// src/pages/LocationPage.tsx
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
import { useAuth } from "../context/AuthContext";
import type { LocationRow } from "../types/LocationRow";
import { getLocationContextMenuItems } from "../menus/getLocationContextMenuItems";

ModuleRegistry.registerModules([AllCommunityModule]);

const LocationPage: React.FC = () => {
  const gridRef = useRef<AgGridReact<LocationRow>>(null);
  const { databaseName, accountId } = useParams<{
    databaseName: string;
    accountId: string;
  }>();
  const { user } = useAuth();

  const created = useRef<LocationRow[]>([]);
  const updated = useRef<LocationRow[]>([]);
  const deleted = useRef<LocationRow[]>([]);

  const [colDefs] = React.useState<ColDef<LocationRow>[]>([
    { field: "name", headerName: "Location Name", flex: 1, editable: true },
    { field: "address", headerName: "Address", flex: 2, editable: true },
    { field: "country", headerName: "Country", flex: 1, editable: true },
    { field: "city", headerName: "City", flex: 1, editable: true },
    { field: "zip", headerName: "Zip Code", flex: 1, editable: true },
  ]);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      filter: true,
      editable: true,
      resizable: true,
      minWidth: 100,
    }),
    []
  );

  useClickOutsideToStopEditing(gridRef);

  const serverSideDatasource = {
    getRows: async (params: any) => {
      const page = params.request.startRow / 20;
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/locations?page=${page}&size=20&databaseName=${databaseName}&accountId=${accountId}`,
        { credentials: "include" }
      );
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.content;
      const total = Array.isArray(data) ? items.length : data.totalElements;

      const rows: LocationRow[] = items.map((loc: any) => ({
        id: loc.id,
        tempId: undefined,
        name: loc.name,
        address: loc.address,
        country: loc.country,
        city: loc.city,
        zip: String(loc.zipCode),
        accountId: Number(accountId),
        _originalName: loc.name,
        _originalAddress: loc.address,
        _originalCountry: loc.country,
        _originalCity: loc.city,
        _originalZip: String(loc.zipCode),
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
          address: r.address,
          country: r.country,
          city: r.city,
          zipCode: Number(r.zip),
          accountId: Number(accountId),
        }));
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/locations?databaseName=${databaseName}`,
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
          address: r.address,
          country: r.country,
          city: r.city,
          zipCode: Number(r.zip),
          accountId: Number(accountId),
        }));
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/locations?databaseName=${databaseName}`,
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
          `${import.meta.env.VITE_BACKEND_URL}/locations?databaseName=${databaseName}`,
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
      toast.success("Location table saved");
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
        tableName="Locations"
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
            getLocationContextMenuItems(
              gridRef.current!.api!,
              user || "Unknown",
              created,
              updated,
              deleted
            )(params)
          }
          onCellValueChanged={params => {
            const row = params.data as LocationRow;
            if (!row._isNew && row.id != null) {
              const exists = updated.current.find(r => r.id === row.id);
              if (!exists) updated.current.push(row);
            }
          }}
        />
      </div>
    </>
  );
};

export default LocationPage;
