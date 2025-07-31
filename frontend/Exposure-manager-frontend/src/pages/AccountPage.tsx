import React, { useMemo, useRef, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import { AllEnterpriseModule } from "ag-grid-enterprise";

import "../styles/EditableTable.css";
import AppWrapper from "../components/AppWrapper";
import TableToolbar from "../components/TableToolbar";
import { useClickOutsideToStopEditing } from "../hooks/useClickOutsideToStopEditing";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import type { AccountRow } from "../types/AccountRow";
import { getAccountContextMenuItems } from "../menus/getAccountContextMenuItems";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

// Link renderer highlights new accounts in red
const AccountLinkRenderer: React.FC<{ value: string; data: AccountRow }> = ({ value, data }) => {
  const { databaseName, portfolioName, portfolioId } = useParams<{
    databaseName: string;
    portfolioName: string;
    portfolioId: string;
  }>();
  const linkId = data.id ?? data.tempId;
  if (!linkId) return <span>{value}</span>;
  const isNew = data._isNew;
  const baseClass = isNew
    ? "text-red-600 dark:text-red-400"
    : "text-blue-600 dark:text-blue-400";

  return (
    <Link
      to={`/databases/${encodeURIComponent(databaseName!)}` +
         `/portfolios/${encodeURIComponent(portfolioName!)}` +
         `/${encodeURIComponent(portfolioId!)}` +
         `/accounts/${encodeURIComponent(value)}/${encodeURIComponent(String(linkId))}`}
      className={`${baseClass} hover:underline`}
    >
      {value}
    </Link>
  );
};

const AccountsPage: React.FC = () => {
  const { displayType } = useContext(ThemeContext);
  const gridRef = useRef<AgGridReact<AccountRow>>(null);
  const { databaseName, portfolioId } = useParams<{ databaseName: string; portfolioId: string }>();
  const { user } = useAuth();

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
    { field: "ownerName", headerName: "Owner Name", flex: 1, editable: false },
  ]);

  const defaultColDef = useMemo<ColDef>(() => ({
    filter: true,
    editable: true,
    resizable: true,
    minWidth: 100,
  }), []);

  useClickOutsideToStopEditing(gridRef);

  // Save changes
  const handleSave = async () => {
    gridRef.current?.api.stopEditing();
    try {
      if (created.current.length) {
        const payload = created.current.map(r => ({ name: r.accountName, portfolioId }));
        const url = `${import.meta.env.VITE_BACKEND_URL}/accounts?databaseName=${databaseName}`;
        const res = await fetch(url, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Create failed");
      }
      if (updated.current.length) {
        const payload = updated.current.map(r => ({ id: r.id, name: r.accountName, portfolioId }));
        const url = `${import.meta.env.VITE_BACKEND_URL}/accounts?databaseName=${databaseName}`;
        const res = await fetch(url, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Update failed");
      }
      if (deleted.current.length) {
        const payload = deleted.current.map(r => r.id);
        const url = `${import.meta.env.VITE_BACKEND_URL}/accounts?databaseName=${databaseName}`;
        const res = await fetch(url, {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Delete failed");
      }
      created.current = [];
      updated.current = [];
      deleted.current = [];
      gridRef.current?.api.refreshServerSide({ purge: displayType === 'paginated' });
      toast.success("Accounts saved");
    } catch (e) {
      console.error(e);
      toast.error("Save failed");
    }
  };

  // Refresh clears unsaved and reloads
  const handleRefresh = () => {
    created.current = [];
    updated.current = [];
    deleted.current = [];
    gridRef.current?.api.refreshServerSide({ purge: true });
  };

  useKeyboardShortcuts(handleSave, handleRefresh);

  const serverSideDatasource = useMemo(() => ({
    async getRows(params: any) {
      const { startRow, endRow } = params.request;
      const pageSize = endRow - startRow;
      const pend = created.current;
      const pendCount = pend.length;
      let rows: AccountRow[] = [];
      let serverTotal = 0;

      // pending
      if (startRow < pendCount) {
        const pendingSlice = pend.slice(startRow, startRow + pageSize);
        rows = [...pendingSlice];
        const needed = pageSize - pendingSlice.length;
        if (needed > 0) {
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/accounts?page=0&size=${needed}&databaseName=${databaseName}&portfolioId=${portfolioId}`,
            { credentials: "include" }
          );
          const body = await res.json();
          const items = Array.isArray(body) ? body : body.content;
          serverTotal = Array.isArray(body) ? items.length : body.totalElements;
          rows = rows.concat(
            items.slice(0, needed).map((a: any) => ({
              id: a.id,
              tempId: undefined,
              accountName: a.name,
              ownerName: user || "Unknown",
              _originalId: a.id,
              _originalName: a.name,
              _isNew: false,
            }))
          );
        }
        if (!serverTotal) {
          const countRes = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/accounts?page=0&size=1&databaseName=${databaseName}&portfolioId=${portfolioId}`,
            { credentials: "include" }
          );
          const countBody = await countRes.json();
          const items = Array.isArray(countBody) ? countBody : countBody.content;
          serverTotal = Array.isArray(countBody) ? items.length : countBody.totalElements;
        }
      } else {
        const serverStart = startRow - pendCount;
        const pageIndex = Math.floor(serverStart / pageSize);
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/accounts?page=${pageIndex}&size=${pageSize}&databaseName=${databaseName}&portfolioId=${portfolioId}`,
          { credentials: "include" }
        );
        const body = await res.json();
        const items = Array.isArray(body) ? body : body.content;
        serverTotal = Array.isArray(body) ? items.length : body.totalElements;
        rows = items.map((a: any) => ({
          id: a.id,
          tempId: undefined,
          accountName: a.name,
          ownerName: user || "Unknown",
          _originalId: a.id,
          _originalName: a.name,
          _isNew: false,
        }));
      }
      const totalCount = pendCount + serverTotal;
      params.success({ rowData: rows, rowCount: totalCount });
    }
  }), [databaseName, portfolioId, user]);

  return (
    <AppWrapper>
      <TableToolbar
        tableName="Accounts"
        onSave={handleSave}
        onRefresh={handleRefresh}
      />
      <div style={{ width: "100%", height: "85vh" }}>
        <AgGridReact<AccountRow>
          ref={gridRef}
          className="ag-theme-quartz"
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          pagination={displayType === "paginated"}
          paginationPageSize={20}
          cacheBlockSize={20}
          getRowId={params => params.data.id != null ? params.data.id.toString() : params.data.tempId!}
          rowModelType="serverSide"
          serverSideDatasource={serverSideDatasource}
          animateRows={false}
          undoRedoCellEditing={true}
          undoRedoCellEditingLimit={20}
          suppressRowHoverHighlight={true}
          columnHoverHighlight={false}
          maxBlocksInCache={4}
          getContextMenuItems={params =>
            getAccountContextMenuItems(
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
    </AppWrapper>
  );
};

export default AccountsPage;
