// src/pages/DatabasePage.tsx
import React, { useMemo, useRef, useContext } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  ICellRendererParams,
} from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "ag-grid-enterprise";

import "../styles/EditableTable.css";
import AppWrapper from "../components/AppWrapper";
import TableToolbar from "../components/TableToolbar";
import { useClickOutsideToStopEditing } from "../hooks/useClickOutsideToStopEditing";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { getDatabaseContextMenuItems } from "../menus/getDatabaseContextMenuItems";
import { DatabaseLinkRenderer } from "../renderers/DatabaseLinkRenderer";
import type { DatabaseRow } from "../types/DatabaseRow";

ModuleRegistry.registerModules([AllCommunityModule]);

// utility: capitalize just the first letter of a string
const capitalizeFirst = (s: string) =>
  s.length > 0 ? s[0].toUpperCase() + s.slice(1).toLowerCase() : "";

const normalizeRolesOnFetch = (raw: any): string => {
  const arr = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
    ? raw.split(/,\s*/)
    : [];
  return arr
    .map(role =>
      role === role.toUpperCase() ? capitalizeFirst(role) : role
    )
    .join(", ");
};

const DatabasePage: React.FC = () => {
  const gridRef = useRef<AgGridReact<DatabaseRow>>(null);
  const { user } = useAuth();
  const { displayType } = useContext(ThemeContext);
  const createdRef = useRef<DatabaseRow[]>([]);
  const updatedRef = useRef<DatabaseRow[]>([]);
  const deletedRef = useRef<DatabaseRow[]>([]);

  const [colDefs] = React.useState<ColDef<DatabaseRow>[]>([
    {
      field: "databaseName",
      headerName: "Database Name",
      flex: 1,
      editable: true,
      cellRenderer: (params: ICellRendererParams<DatabaseRow>) => (
        <DatabaseLinkRenderer {...params} />
      ),
    },
    {
      field: "allowedRoles",
      headerName: "Allowed Roles",
      flex: 1,
      editable: true,
    },
    {
      field: "ownerName",
      headerName: "Owner Name",
      flex: 1,
      editable: false,
    },
  ]);

  const defaultColDef = useMemo<ColDef>(() => ({
    filter: true,
    editable: true,
    resizable: true,
    minWidth: 100,
  }), []);

  useClickOutsideToStopEditing(gridRef);

  const serverSideDatasource = useMemo<IServerSideDatasource>(
    () => ({
      async getRows(params: IServerSideGetRowsParams) {
        const { startRow, endRow } = params.request;
        const blockSize = endRow! - startRow!;
        const page = Math.floor(startRow! / blockSize);

        try {
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/databases?page=${page}&size=${blockSize}`,
            { credentials: "include" }
          );
          const body = await res.json();
          const items = Array.isArray(body) ? body : body.content;
          const total = Array.isArray(body) ? items.length : body.totalElements;

          const serverRows: DatabaseRow[] = items.map((d: any) => {
            const displayRoles = normalizeRolesOnFetch(d.allowedRoles);
            return {
              id: d.id,
              tempId: undefined,
              databaseName: d.name,
              allowedRoles: displayRoles,
              ownerName: d.ownerName || user || "Unknown",
              _originalId: d.id,
              _originalName: d.name,
              _originalAllowedRoles: displayRoles,
              _isNew: false,
            };
          });

          const pend = createdRef.current;
          const rowCount = total + pend.length;
          let rowsToReturn: DatabaseRow[];

          if (displayType === "infinite") {
            if ((page + 1) * blockSize <= total) {
              rowsToReturn = serverRows;
            } else if (page * blockSize >= total) {
              const start = page * blockSize - total;
              rowsToReturn = pend.slice(start, start + blockSize);
            } else {
              const left = total - page * blockSize;
              rowsToReturn = [
                ...serverRows.slice(0, left),
                ...pend.slice(0, blockSize - left),
              ];
            }
          } else {
            if (page === 0) {
              rowsToReturn = [...pend, ...serverRows].slice(0, blockSize);
            } else {
              rowsToReturn = serverRows;
            }
          }

          params.success({ rowData: rowsToReturn, rowCount });
        } catch (err) {
          params.fail();
        }
      },
    }),
    [user, displayType]
  );

  const handleSave = async () => {
    gridRef.current?.api.stopEditing();
    try {
      if (createdRef.current.length) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/databases`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            createdRef.current.map(r => ({
              name: r.databaseName,
              allowedRoles: r.allowedRoles
                .split(/,\s*/)
                .map(role => role.toUpperCase()),
            }))
          ),
        }).then(res => {
          if (!res.ok) throw new Error("Create failed");
        });
      }

      if (updatedRef.current.length) {
        // now including oldName and newName
        const payload = updatedRef.current.map(r => ({
          id: r.id,
          oldName: r._originalName,
          newName: r.databaseName,
          allowedRoles: r.allowedRoles
            .split(/,\s*/)
            .map(role => role.toUpperCase()),
        }));

        console.log("PUT payload:", JSON.stringify(payload));

        await fetch(`${import.meta.env.VITE_BACKEND_URL}/databases`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then(res => {
          if (!res.ok) throw new Error("Update failed");
        });
      }

      if (deletedRef.current.length) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/databases`, {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(deletedRef.current.map(r => r.id)),
        }).then(res => {
          if (!res.ok) throw new Error("Delete failed");
        });
      }

      createdRef.current = [];
      updatedRef.current = [];
      deletedRef.current = [];
      gridRef.current?.api.refreshServerSide({ purge: false });
      toast.success("Changes saved");
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    }
  };

  const handleRefresh = () => {
    createdRef.current = [];
    updatedRef.current = [];
    deletedRef.current = [];
    gridRef.current?.api.refreshServerSide({ purge: true });
    toast.info("Database table refreshed");
  };

  useKeyboardShortcuts(handleSave, handleRefresh);

  return (
    <AppWrapper>
      <div className="flex flex-col h-[97vh]">
        <div className="p-2 bg-white">
          <TableToolbar
            tableName="Databases"
            onSave={handleSave}
            onRefresh={handleRefresh}
          />
        </div>
        <div className="flex-1">
          <div className="ag-theme-quartz w-full h-full">
            <AgGridReact<DatabaseRow>
              ref={gridRef}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
              rowModelType="serverSide"
              serverSideDatasource={serverSideDatasource}
              cacheBlockSize={20}
              maxBlocksInCache={4}
              pagination={displayType === "paginated"}
              paginationPageSize={20}
              animateRows={false}
              undoRedoCellEditing
              undoRedoCellEditingLimit={20}
              suppressRowHoverHighlight
              columnHoverHighlight={false}
              getContextMenuItems={params =>
                getDatabaseContextMenuItems(
                  gridRef.current!.api!,
                  user || "Unknown",
                  createdRef,
                  updatedRef,
                  deletedRef
                )(params)
              }
              onCellValueChanged={params => {
                const row = params.data;
                const changedName = row.databaseName !== row._originalName;
                const changedRoles =
                  row.allowedRoles !== row._originalAllowedRoles;
                if (
                  !row._isNew &&
                  (changedName || changedRoles) &&
                  !updatedRef.current.find(r => r.id === row.id)
                ) {
                  updatedRef.current.push(row);
                }
              }}
              getRowId={params =>
                params.data.id != null
                  ? String(params.data.id)
                  : params.data.tempId!
              }
            />
          </div>
        </div>
      </div>
    </AppWrapper>
  );
};

export default DatabasePage;
