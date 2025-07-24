// PortfolioPage.tsx
import React, { useEffect, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import type { ColDef, GridApi } from "ag-grid-community";
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
import type { PortfolioRow } from "../types/PortfolioRow";
import { getPortfolioContextMenuItems } from "../menus/getPortfolioContextMenuItems";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const PortfolioLinkRenderer = ({ value, data }: { value: string; data: PortfolioRow }) => {
  const { databaseName } = useParams();
  return (
    <Link
      to={`/databases/${encodeURIComponent(databaseName!)}/portfolios/${encodeURIComponent(value)}/${data.id}`}
      className="text-blue-600 dark:text-blue-400 hover:underline"
    >
      {value}
    </Link>
  );
};

const PortfolioPage = () => {
  const gridRef = useRef<AgGridReact<PortfolioRow>>(null);
  const { databaseName } = useParams();
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

  const serverSideDatasource = {
    getRows: async (params: any) => {
      const page = params.request.startRow / 20;
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/portfolios?page=${page}&size=20&databaseName=${databaseName}`,
        { credentials: "include" }
      );
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.content;
      const total = Array.isArray(data) ? items.length : data.totalElements;

      const rows: PortfolioRow[] = items.map((p: any) => ({
        id: p.id,
        tempId: undefined,
        portfolioName: p.name,
        ownerName: user || "Unknown",
        _originalId: p.id!,
        _originalName: p.name,
      }));

      params.success({ rowData: rows, rowCount: total });
    },
  };

  const handleSaveChanges = async () => {
    gridRef.current?.api.stopEditing();

    try {
      if (created.current.length) {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/portfolios?databaseName=${databaseName}`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              created.current.map((r) => ({ name: r.portfolioName }))
            ),
          }
        );
        if (!res.ok) throw new Error("Create failed");
      }

      if (updated.current.length) {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/portfolios?databaseName=${databaseName}`,
          {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              updated.current.map((r) => ({
                id: r.id,
                name: r.portfolioName,
              }))
            ),
          }
        );
        if (!res.ok) throw new Error("Update failed");
      }

      if (deleted.current.length) {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/portfolios?databaseName=${databaseName}`,
          {
            method: "DELETE",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(deleted.current.map((r) => r.id)),
          }
        );
        if (!res.ok) throw new Error("Delete failed");
      }

      created.current = [];
      updated.current = [];
      deleted.current = [];
      gridRef.current?.api.refreshServerSide({ purge: true });
      toast.success("Portfolio table saved");
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
        tableName="Portfolios"
        onSave={handleSaveChanges}
        onRefresh={() => gridRef.current?.api.refreshServerSide({ purge: true })}
      />

      <div style={{ width: "100%", height: "85vh" }}>
        <AgGridReact
          ref={gridRef}
          className="ag-theme-quartz"
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          getRowId={(params) =>
            params.data.id != null ? params.data.id.toString() : params.data.tempId!
          }
          rowModelType="serverSide"
          pagination
          paginationPageSize={20}
          cacheBlockSize={20}
          serverSideDatasource={serverSideDatasource}
          animateRows={false}
          suppressRowHoverHighlight={true}
          columnHoverHighlight={false}
          getContextMenuItems={(params) =>
            getPortfolioContextMenuItems(
              gridRef.current!.api!,
              user!,
              created,
              updated,
              deleted
            )(params)
          }
          onCellValueChanged={(params) => {
            const row = params.data;
            if (!row._isNew && row.id) {
              const already = updated.current.find((r) => r.id === row.id);
              if (!already) {
                updated.current.push(row);
              }
            }
          }}
        />
      </div>
    </AppWrapper>
  );
};

export default PortfolioPage;
