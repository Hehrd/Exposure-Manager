// src/pages/PolicyPage.tsx
import React, { useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import type { ColDef, GridApi } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "../styles/EditableTable.css";
import TableToolbar from "../components/TableToolbar";
import { useClickOutsideToStopEditing } from "../hooks/useClickOutsideToStopEditing";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { toast } from "react-toastify";
import type { PolicyRow } from "../types/PolicyRow";
import { getPolicyContextMenuItems } from "../menus/getPolicyContextMenuItems";

ModuleRegistry.registerModules([AllCommunityModule]);

const PolicyPage: React.FC = () => {
  const gridRef = useRef<AgGridReact<PolicyRow>>(null);
  const { databaseName, accountId } = useParams<{ databaseName: string; accountId: string }>();

  // track changes
  const created = useRef<PolicyRow[]>([]);
  const updated = useRef<PolicyRow[]>([]);
  const deleted = useRef<PolicyRow[]>([]);

  const [colDefs] = React.useState<ColDef<PolicyRow>[]>([
    {
      field: "name",
      headerName: "Policy Name",
      flex: 2,
      editable: true,
    },
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 1,
      editable: true,
    },
    {
      field: "expirationDate",
      headerName: "Expiration Date",
      flex: 1,
      editable: true,
    },
    {
      field: "coverage",
      headerName: "Coverage $",
      flex: 1,
      editable: true,
      valueFormatter: params => `$${Number(params.value).toLocaleString()}`,
    },
    {
      field: "perilType",
      headerName: "Peril Type",
      flex: 1,
      editable: true,
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
        `${import.meta.env.VITE_BACKEND_URL}/policies?page=${page}&size=20&databaseName=${databaseName}&accountId=${accountId}`,
        { credentials: "include" }
      );
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.content;
      const total = Array.isArray(data) ? items.length : data.totalElements;

      const rows: PolicyRow[] = items.map((p: any) => ({
        id: p.id,
        tempId: undefined,
        name: p.name,
        startDate: p.startDate,
        expirationDate: p.expirationDate,
        coverage: p.coverage,
        perilType: p.perilType,
        accountId: Number(accountId),
        _originalName: p.name,
        _originalStartDate: p.startDate,
        _originalExpirationDate: p.expirationDate,
        _originalCoverage: p.coverage,
        _originalPerilType: p.perilType,
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
          name: r.name,
          startDate: r.startDate,
          expirationDate: r.expirationDate,
          coverage: r.coverage,
          perilType: r.perilType,
          accountId: Number(accountId),
        }));
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/policies?databaseName=${databaseName}`,
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
          name: r.name,
          startDate: r.startDate,
          expirationDate: r.expirationDate,
          coverage: r.coverage,
          perilType: r.perilType,
          accountId: Number(accountId),
        }));
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/policies?databaseName=${databaseName}`,
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
          `${import.meta.env.VITE_BACKEND_URL}/policies?databaseName=${databaseName}`,
          {
            method: "DELETE",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (!res.ok) throw new Error("Delete failed");
      }

      // reset and refresh
      created.current = [];
      updated.current = [];
      deleted.current = [];
      gridRef.current?.api.refreshServerSide({ purge: true });
      toast.success("Policy table saved");
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
    <>
      <TableToolbar
        tableName="Policies"
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
            getPolicyContextMenuItems(
              gridRef.current!.api!,
              created,
              updated,
              deleted
            )(params)
          }
          onCellValueChanged={params => {
            const row = params.data as PolicyRow;
            if (!row._isNew && row.id != null && row.name !== row._originalName) {
              const exists = updated.current.find(r => r.id === row.id);
              if (!exists) updated.current.push(row);
            }
          }}
        />
      </div>
    </>
  );
};

export default PolicyPage;
