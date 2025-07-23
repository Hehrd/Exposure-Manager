// PolicyPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { ContextMenuModule } from "ag-grid-enterprise";
import "ag-grid-enterprise";
import "../styles/EditableTable.css";
import TableToolbar from "../components/TableToolbar";
import { useClickOutsideToStopEditing } from "../hooks/useClickOutsideToStopEditing";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { toast } from "react-toastify";
import { getPolicyContextMenuItems } from "../menus/getPolicyContextMenuItems";
import type { PolicyRow } from "../types/PolicyRow";

ModuleRegistry.registerModules([AllCommunityModule, ContextMenuModule]);

const PolicyPage = () => {
  const gridRef = useRef<AgGridReact<PolicyRow>>(null);
  const hasFetchedOnMount = useRef(false);
  const { databaseName, accountId } = useParams();
  const [rowData, setRowData] = useState<PolicyRow[] | null>(null);

  const [colDefs] = useState<ColDef<PolicyRow>[]>([{
    field: "name", headerName: "Policy Name", flex: 2, editable: true
  }, {
    field: "startDate", headerName: "Start Date", flex: 1, editable: true
  }, {
    field: "expirationDate", headerName: "expiration Date", flex: 1, editable: true
  }, {
    field: "coverage", headerName: "Coverage $", flex: 1, editable: true,
    valueFormatter: (params) => `$${Number(params.value).toLocaleString()}`
  }, {
    field: "perilType", headerName: "Peril Type", flex: 1, editable: true
  }]);

  const defaultColDef = useMemo<ColDef>(() => ({
    filter: true,
    editable: true,
    resizable: true,
    minWidth: 100,
  }), []);

  useClickOutsideToStopEditing(gridRef);

  const fetchPolicies = async () => {
    console.log("🔍 [READ] Fetching policies...");
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/policies?page=0&size=20&databaseName=${databaseName}&accountId=${accountId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch policies");
      const data = await res.json();
      console.log("✅ [READ] Fetched policies:", data);
      setRowData((data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        startDate: p.startDate,
        expirationDate: p.expirationDate,
        coverage: p.coverage,
        perilType: p.perilType,
        _originalName: p.name,
        _isNew: false,
        _isDeleted: false
      })));
    } catch (err) {
      console.error("❌ [READ] Error fetching policies:", err);
      toast.error("Failed to load policies");
      setRowData([]);
    }
  };

  useEffect(() => {
    if (!hasFetchedOnMount.current && databaseName && accountId) {
      console.log("🚀 Initial fetch triggered for policies");
      fetchPolicies();
      hasFetchedOnMount.current = true;
    }
  }, [databaseName, accountId]);

  const handleSaveChanges = async () => {
    gridRef.current?.api.stopEditing();
    const allData = rowData ?? [];
    const newRows = allData.filter((r) => r._isNew);
    const editedRows = allData.filter((r) => !r._isNew && !r._isDeleted && r.name !== r._originalName);
    const deletedRows = allData.filter((r) => r._isDeleted && !r._isNew);

    const createPayload = newRows.map((r) => ({
      name: r.name,
      startDate: r.startDate,
      expirationDate: r.expirationDate,
      coverage: r.coverage,
      perilType: r.perilType,
      accountId: Number(accountId),
    }));

    const updatePayload = editedRows.map((r) => ({
      id: r.id,
      name: r.name,
      startDate: r.startDate,
      expirationDate: r.expirationDate,
      coverage: r.coverage,
      perilType: r.perilType,
      accountId: Number(accountId),
    }));

    const deletePayload = deletedRows.map((r) => r.id);

    try {
      if (createPayload.length > 0) {
        console.log("📦 [CREATE] Sending payload:", createPayload);
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/policies?databaseName=${databaseName}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(createPayload),
        });
        if (!res.ok) throw new Error("Create failed");
        toast.success("Created policies");
      }

      if (updatePayload.length > 0) {
        console.log("✏️ [UPDATE] Sending payload:", updatePayload);
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/policies?databaseName=${databaseName}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updatePayload),
        });
        if (!res.ok) throw new Error("Update failed");
        toast.success("Updated policies");
      }

      if (deletePayload.length > 0) {
        console.log("🗑️ [DELETE] Sending payload:", deletePayload);
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/policies?databaseName=${databaseName}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(deletePayload),
        });
        if (!res.ok) throw new Error("Delete failed");
        toast.success("Deleted policies");
      }

      fetchPolicies();
      toast.success("Policy table saved");
    } catch (err) {
      console.error("❌ [SAVE] Error saving changes:", err);
      toast.error("Save failed");
    }
  };

  const handleRefresh = () => {
    gridRef.current?.api.stopEditing();
    fetchPolicies();
    toast.info("Policy table refreshed");
  };

  useKeyboardShortcuts(handleSaveChanges, handleRefresh);

  return (
    <>
      <TableToolbar
        tableName="Policies"
        onSave={handleSaveChanges}
        onRefresh={handleRefresh}
      />
      <div id="custom-grid-wrapper" style={{ width: "100%", height: "85%" }}>
        <AgGridReact
          ref={gridRef}
          className="ag-theme-quartz"
          rowData={(rowData ?? []).filter((r) => !r._isDeleted)}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          columnHoverHighlight={false}
          suppressRowHoverHighlight={true}
          getContextMenuItems={(params) =>
            getPolicyContextMenuItems(setRowData)(params)
          }
          overlayLoadingTemplate={
            '<span class="ag-overlay-loading-center">Loading policies...</span>'
          }
        />
      </div>
    </>
  );
};

export default PolicyPage;