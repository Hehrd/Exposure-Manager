// src/pages/AccountPage.tsx
import React, { useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import type { ColDef, GridApi } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise"; // for server-side row model
import "../styles/EditableTable.css";
import AppWrapper from "../components/AppWrapper";
import TableToolbar from "../components/TableToolbar";
import { useClickOutsideToStopEditing } from "../hooks/useClickOutsideToStopEditing";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import type { AccountRow } from "../types/AccountRow";
import { getAccountContextMenuItems } from "../menus/getAccountContextMenuItems";

ModuleRegistry.registerModules([AllCommunityModule]);

const AccountLinkRenderer = ({
  value,
  data,
}: {
  value: string;
  data: AccountRow;
}) => {
  const { databaseName, portfolioName, portfolioId } = useParams<{
    databaseName: string;
    portfolioName: string;
    portfolioId: string;
  }>();
  return (
    <Link
      to={`/databases/${encodeURIComponent(
        databaseName!
      )}/portfolios/${encodeURIComponent(
        portfolioName!
      )}/${encodeURIComponent(
        portfolioId!
      )}/accounts/${encodeURIComponent(value)}/${data.id}`}
      className="text-blue-600 dark:text-blue-400 hover:underline"
    >
      {value}
    </Link>
  );
};

const AccountPage: React.FC = () => {
  const gridRef = useRef<AgGridReact<AccountRow>>(null);
  const { databaseName, portfolioId } = useParams<{
    databaseName: string;
    portfolioId: string;
  }>();
  const { user } = useAuth();

  // track new/updated/deleted rows
  const created = useRef<AccountRow[]>([]);
  const updated = useRef<AccountRow[]>([]);
  const deleted = useRef<AccountRow[]>([]);

  const [colDefs] = React.useState<ColDef<AccountRow>[]>([
    {
      field: "accountName",
      headerName: "Account Name",
      flex: 1,
      editable: true,
      cellRenderer: AccountLinkRenderer,
    },
    {
      field: "ownerName",
      headerName: "Owner Name",
      flex: 1,
      editable: false,
    },
  ]);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      filter: true,
      editable: true,
      resizable: true,
      minWidth: 100,
    };
  }, []);

  useClickOutsideToStopEditing(gridRef);

  // server-side datasource
  const serverSideDatasource = {
    getRows: async (params: any) => {
      const page = params.request.startRow / 20;
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/accounts?page=${page}&size=20&databaseName=${databaseName}&portfolioId=${portfolioId}`,
        { credentials: "include" }
      );
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.content;
      const total = Array.isArray(data) ? items.length : data.totalElements;

      const rows: AccountRow[] = items.map((a: any) => ({
        id: a.id,
        tempId: undefined,
        accountName: a.name,
        ownerName: user || "Unknown",
        _originalId: a.id,
        _originalName: a.name,
      }));

      params.success({ rowData: rows, rowCount: total });
    },
  };

  const handleSaveChanges = async () => {
    gridRef.current?.api.stopEditing();

    try {
      // CREATE
      if (created.current.length) {
        const payload = created.current.map(r => ({
          name: r.accountName,
          portfolioId,
        }));
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/accounts?databaseName=${databaseName}`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (!res.ok) throw new Error("Create failed");
      }

      // UPDATE
      if (updated.current.length) {
        const payload = updated.current.map(r => ({
          id: r.id,
          name: r.accountName,
          portfolioId,
        }));
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/accounts?databaseName=${databaseName}`,
          {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (!res.ok) throw new Error("Update failed");
      }

      // DELETE
      if (deleted.current.length) {
        const payload = deleted.current.map(r => r.id);
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/accounts?databaseName=${databaseName}`,
          {
            method: "DELETE",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (!res.ok) throw new Error("Delete failed");
      }

      // reset
      created.current = [];
      updated.current = [];
      deleted.current = [];
      gridRef.current?.api.refreshServerSide({ purge: true });
      toast.success("Account table saved");
    } catch (err) {
      console.error("❌ Save failed:", err);
      toast.error("Save failed");
    }
  };

  useKeyboardShortcuts(
    () => handleSaveChanges(),
    () => gridRef.current?.api.refreshServerSide({ purge: true })
  );

  return (
    <AppWrapper>
      <TableToolbar
        tableName="Accounts"
        onSave={handleSaveChanges}
        onRefresh={() => gridRef.current?.api.refreshServerSide({ purge: true })}
      />
      <div style={{ width: "100%", height: "85vh" }}>
        <AgGridReact
          ref={gridRef}
          className="ag-theme-quartz"
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          getRowId={params =>
            params.data.id != null
              ? params.data.id.toString()
              : params.data.tempId!
          }
          rowModelType="serverSide"
          pagination
          paginationPageSize={20}
          cacheBlockSize={20}
          serverSideDatasource={serverSideDatasource}
          animateRows={false}
          undoRedoCellEditing
          undoRedoCellEditingLimit={20}
          suppressRowHoverHighlight
          columnHoverHighlight={false}
          getContextMenuItems={params =>
            getAccountContextMenuItems(
              gridRef.current!.api!,
              user || "Unknown",
              created,
              updated,
              deleted
            )(params)
          }
          onCellValueChanged={params => {
            const row = params.data as AccountRow;
            if (!row._isNew && row.id != null) {
              const already = updated.current.find(r => r.id === row.id);
              if (!already) updated.current.push(row);
            }
          }}
        />
      </div>
    </AppWrapper>
  );
};

export default AccountPage;
