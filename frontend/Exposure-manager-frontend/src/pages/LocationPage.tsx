// LocationPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "ag-grid-enterprise";
import "../styles/EditableTable.css";
import TableToolbar from "../components/TableToolbar";
import { useClickOutsideToStopEditing } from "../hooks/useClickOutsideToStopEditing";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { getLocationContextMenuItems } from "../menus/getLocationContextMenuItems";
import type { LocationRow } from "../types/LocationRow";

import { ContextMenuModule } from "ag-grid-enterprise";

ModuleRegistry.registerModules([AllCommunityModule, ContextMenuModule]);

const LocationPage = () => {
  const gridRef = useRef<AgGridReact<LocationRow>>(null);
  const hasFetchedOnMount = useRef(false);
  const { databaseName, accountId } = useParams();
  const { user } = useAuth();
  const [rowData, setRowData] = useState<LocationRow[] | null>(null);

  const [colDefs] = useState<ColDef<LocationRow>[]>([{
    field: "name", headerName: "Location Name", flex: 1, editable: true
  }, {
    field: "address", headerName: "Address", flex: 2, editable: true
  }, {
    field: "country", headerName: "Country", flex: 1, editable: true
  }, {
    field: "city", headerName: "City", flex: 1, editable: true
  }, {
    field: "zip", headerName: "Zip Code", flex: 1, editable: true
  }]);

  const defaultColDef = useMemo<ColDef>(() => ({
    filter: true,
    editable: true,
    resizable: true,
    minWidth: 100,
  }), []);

  useClickOutsideToStopEditing(gridRef);

  const fetchLocations = async (page = 0, size = 20) => {
    console.log("🔍 [READ] Fetching locations...");
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/locations?page=${page}&size=${size}&databaseName=${databaseName}&accountId=${accountId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch locations");

      const data = await res.json();
      console.log("✅ [READ] Fetched locations:", data);

      setRowData(
        Object.values(data || {}).map((loc: any) => ({
          id: loc.id,
          name: loc.name,
          address: loc.address,
          country: loc.country,
          city: loc.city,
          zip: loc.zipCode,
          accountId: Number(accountId),
          _originalName: loc.name,
          _isNew: false,
          _isDeleted: false
        }))
      );
    } catch (err) {
      console.error("❌ [READ] Error fetching locations:", err);
      toast.error("Failed to load locations");
      setRowData([]);
    }
  };

  useEffect(() => {
    if (!hasFetchedOnMount.current) {
      fetchLocations();
      hasFetchedOnMount.current = true;
    }
  }, []);

  const handleSaveChanges = async () => {
    gridRef.current?.api.stopEditing();
    const allData = rowData ?? [];
    const newRows = allData.filter((r) => r._isNew);
    const editedRows = allData.filter((r) => !r._isNew && !r._isDeleted && r.name !== r._originalName);
    const deletedRows = allData.filter((r) => r._isDeleted && !r._isNew);

    const createPayload = newRows.map((r) => ({
      name: r.name,
      address: r.address,
      country: r.country,
      city: r.city,
      zipCode: Number(r.zip),
      accountId: Number(accountId)
    }));

    const updatePayload = editedRows.map((r) => ({
      id: r.id,
      name: r.name,
      address: r.address,
      country: r.country,
      city: r.city,
      zipCode: Number(r.zip),
      accountId: Number(accountId)
    }));

    const deletePayload = deletedRows.map((r) => r.id);

    try {
      if (createPayload.length > 0) {
        console.log("📦 [CREATE] Sending payload:", createPayload);
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/locations?databaseName=${databaseName}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(createPayload),
        });
        if (!res.ok) throw new Error("Create failed");
        toast.success("Created locations");
      }

      if (updatePayload.length > 0) {
        console.log("✏️ [UPDATE] Sending payload:", updatePayload);
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/locations?databaseName=${databaseName}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updatePayload),
        });
        if (!res.ok) throw new Error("Update failed");
        toast.success("Updated locations");
      }

      if (deletePayload.length > 0) {
        console.log("🗑️ [DELETE] Sending payload:", deletePayload);
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/locations?databaseName=${databaseName}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(deletePayload),
        });
        if (!res.ok) throw new Error("Delete failed");
        toast.success("Deleted locations");
      }

      console.log("🔁 Refreshing after save");
      fetchLocations();
      toast.success("Location table saved");
    } catch (err) {
      console.error("❌ [SAVE] Error saving changes:", err);
      toast.error("Save failed");
    }
  };

  const handleRefresh = () => {
    gridRef.current?.api.stopEditing();
    console.log("🔄 Manual refresh triggered");
    fetchLocations();
    toast.info("Location table refreshed");
  };

  useKeyboardShortcuts(handleSaveChanges, handleRefresh);

  return (<>
      <TableToolbar
        tableName="Locations"
        onSave={handleSaveChanges}
        onRefresh={handleRefresh}
      />

      <div id="custom-grid-wrapper" style={{ width: "100%", height: "85vh" }}>
        <AgGridReact
          ref={gridRef}
          className="ag-theme-quartz"
          rowData={(rowData ?? []).filter((row) => !row._isDeleted)}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          columnHoverHighlight={false}
          suppressRowHoverHighlight={true}
          getContextMenuItems={(params) =>
            getLocationContextMenuItems(setRowData, user?.toString() || "Unknown")(params)
          }
          overlayLoadingTemplate={
            '<span class="ag-overlay-loading-center">Loading locations...</span>'
          }
        />
      </div>
      </>
  );
};

export default LocationPage;
