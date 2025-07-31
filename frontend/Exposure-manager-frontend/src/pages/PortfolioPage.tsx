import React, { useMemo, useRef, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import type { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import type {
  ICellRendererParams,
  IServerSideDatasource,
  IServerSideGetRowsParams,
} from "ag-grid-community";
import "ag-grid-enterprise";

import "../styles/EditableTable.css";
import AppWrapper from "../components/AppWrapper";
import TableToolbar from "../components/TableToolbar";
import { useClickOutsideToStopEditing } from "../hooks/useClickOutsideToStopEditing";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import type { PortfolioRow } from "../types/PortfolioRow";
import { getPortfolioContextMenuItems } from "../menus/getPortfolioContextMenuItems";

// Link renderer highlights new rows in red
const PortfolioLinkRenderer: React.FC<ICellRendererParams<PortfolioRow>> = ({ value, data }) => {
  const { databaseName } = useParams<{ databaseName: string }>();
  const rowId = data?.id != null ? data.id : data?.tempId;
  if (!rowId) return <span>{value}</span>;
  const isNew = data!._isNew;
  const baseClass = isNew
    ? "text-red-600 dark:text-red-400"
    : "text-blue-600 dark:text-blue-400";
  return (
    <Link
      to={`/databases/${encodeURIComponent(databaseName!)}/portfolios/${encodeURIComponent(
        String(value)
      )}/${encodeURIComponent(String(rowId))}`}
      className={`${baseClass} hover:underline`}
    >
      {value}
    </Link>
  );
};

const PortfolioPage: React.FC = () => {
  const { displayType } = useContext(ThemeContext);
  const gridRef = useRef<AgGridReact<PortfolioRow>>(null);
  const { databaseName } = useParams<{ databaseName: string }>();
  const { user } = useAuth();

  const created = useRef<PortfolioRow[]>([]);
  const updated = useRef<PortfolioRow[]>([]);
  const deleted = useRef<PortfolioRow[]>([]);

  const [colDefs] = React.useState<ColDef<PortfolioRow>[]>([
    {
      field: "portfolioName",
      headerName: "Portfolio Name",
      flex: 1,
      editable: true,
      cellRenderer: PortfolioLinkRenderer,
    },
    { field: "ownerName", headerName: "Owner Name", flex: 1, editable: false },
  ]);

  const defaultColDef = useMemo<ColDef<PortfolioRow>>(
    () => ({ filter: true, editable: true, resizable: true, minWidth: 100 }),
    []
  );

  useClickOutsideToStopEditing(gridRef);

  const serverSideDatasource = useMemo<IServerSideDatasource>(
    () => ({
      async getRows(params: IServerSideGetRowsParams) {
        const { startRow, endRow } = params.request;
        const blockSize = endRow! - startRow!;
        const page = Math.floor(startRow! / blockSize);
        try {
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/portfolios?page=${page}&size=${blockSize}&databaseName=${databaseName}`,
            { credentials: "include" }
          );
          const body = await res.json();
          const items = Array.isArray(body) ? body : body.content;
          const total = Array.isArray(body) ? items.length : body.totalElements;

          const serverRows: PortfolioRow[] = items.map((p: any) => ({
            id: p.id,
            tempId: undefined,
            portfolioName: p.name,
            ownerName: user || "Unknown",
            _originalId: p.id,
            _originalName: p.name,
            _isNew: false,
          }));

          const pend = created.current;
          const rowCount = total + pend.length;
          let rowsToReturn: PortfolioRow[];

          if (displayType === 'infinite') {
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
            // paginated: show first page combined, others server only
            if (page === 0) {
              rowsToReturn = [...pend, ...serverRows].slice(0, blockSize);
            } else {
              rowsToReturn = serverRows;
            }
          }

          params.success({ rowData: rowsToReturn, rowCount });
        } catch {
          params.fail();
        }
      },
    }),
    [databaseName, user, displayType]
  );

  const handleSave = async () => {
    gridRef.current?.api.stopEditing();
    try {
      if (created.current.length) {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/portfolios?databaseName=${databaseName}`,
          { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(created.current.map(r => ({ name: r.portfolioName })))}
        );
        if (!res.ok) throw new Error("Create failed");
      }
      if (updated.current.length) {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/portfolios?databaseName=${databaseName}`,
          { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated.current.map(r => ({ id: r.id, name: r.portfolioName })))}
        );
        if (!res.ok) throw new Error("Update failed");
      }
      if (deleted.current.length) {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/portfolios?databaseName=${databaseName}`,
          { method: "DELETE", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(deleted.current.map(r => r.id))}
        );
        if (!res.ok) throw new Error("Delete failed");
      }

      created.current = [];
      updated.current = [];
      deleted.current = [];
      gridRef.current?.api.refreshServerSide({ purge: false });
      toast.success("Changes saved");
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    }
  };

  const handleRefresh = () => {
    created.current = [];
    updated.current = [];
    deleted.current = [];
    gridRef.current?.api.refreshServerSide({ purge: true });
  };

  useKeyboardShortcuts(handleSave, handleRefresh);

  return (
    <AppWrapper>
      <div className="flex flex-col h-[97vh]">
        <div className="p-2 bg-[var(--bg-color)]">
          <TableToolbar
            tableName="Portfolios"
            onSave={handleSave}
            onRefresh={handleRefresh}
          />
        </div>
        <div className="flex-1">
          <div className="ag-theme-quartz w-full h-full">
            <AgGridReact<PortfolioRow>
              ref={gridRef}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
              rowSelection="multiple"
              getRowId={params => params.data.id != null ? String(params.data.id) : params.data.tempId!}
              rowModelType="serverSide"
              serverSideDatasource={serverSideDatasource}
              cacheBlockSize={20}
              maxBlocksInCache={4}
              pagination={displayType === 'paginated'}
              paginationPageSize={20}
              animateRows={false}
              undoRedoCellEditing
              undoRedoCellEditingLimit={20}
              suppressRowHoverHighlight
              columnHoverHighlight={false}
              getContextMenuItems={params =>
                getPortfolioContextMenuItems(
                  gridRef.current!.api!,
                  user!,
                  created,
                  updated
                )(params)
              }
              onCellValueChanged={params => {
                const row = params.data;
                if (!row._isNew && row.id && !updated.current.find(r => r.id === row.id)) {
                  updated.current.push(row);
                }
              }}
            />
          </div>
        </div>
      </div>
    </AppWrapper>
  );
};

export default PortfolioPage;
