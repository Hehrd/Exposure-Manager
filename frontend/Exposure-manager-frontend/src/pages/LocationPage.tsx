import React, { useMemo, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "../styles/EditableTable.css";
import TableToolbar from "../components/TableToolbar";
import { useClickOutsideToStopEditing } from "../hooks/useClickOutsideToStopEditing";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { toast } from "react-toastify";
import { ThemeContext } from "../context/ThemeContext";
import type { LocationRow } from "../types/LocationRow";
import { getLocationContextMenuItems } from "../menus/getLocationContextMenuItems";

ModuleRegistry.registerModules([AllCommunityModule]);

const LocationPage: React.FC = () => {
  const { displayType } = useContext(ThemeContext);
  const gridRef = useRef<AgGridReact<LocationRow>>(null);
  const { databaseName, accountId } = useParams<{ databaseName: string; accountId: string }>();

  const created = useRef<LocationRow[]>([]);
  const updated = useRef<LocationRow[]>([]);
  const deleted = useRef<LocationRow[]>([]);

  // Highlight any new (_isNew) rows in red
  const cellClassRules = { "text-red-600 dark:text-red-400": "data._isNew" };

  const [colDefs] = React.useState<ColDef<LocationRow>[]>([
    { field: "name",    headerName: "Location Name", flex: 1, editable: true, cellClassRules },
    { field: "address", headerName: "Address",       flex: 2, editable: true, cellClassRules },
    { field: "country", headerName: "Country",       flex: 1, editable: true, cellClassRules },
    { field: "city",    headerName: "City",          flex: 1, editable: true, cellClassRules },
    {
      field: "zip",
      headerName: "Zip Code",
      flex: 1,
      editable: true,
      filter: 'agNumberColumnFilter',      // <-- switch filter to number
      cellEditor: 'agNumericCellEditor',   // <-- use numeric editor
      valueParser: params => {
        // parse any edit back into a number, reject non‐numeric
        const parsed = parseInt(params.newValue, 10);
        return isNaN(parsed) ? params.oldValue : parsed;
      },
      valueFormatter: params =>
        // render the number as a string in the cell so you don’t see “123” vs 123
        params.value != null ? String(params.value) : '',
      cellClassRules,
    },
  ]);


  const defaultColDef = useMemo<ColDef<LocationRow>>(() => ({
    filter: true,
    editable: true,
    resizable: true,
    minWidth: 100,
  }), []);

  useClickOutsideToStopEditing(gridRef);

  const handleSaveChanges = async () => {
    gridRef.current?.api.stopEditing();
    try {
      const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/locations?databaseName=${databaseName}`;

      if (created.current.length) {
        const payload = created.current.map(r => ({
          name: r.name,
          address: r.address,
          country: r.country,
          city: r.city,
          zipCode: Number(r.zip),
          accountId: Number(accountId),
        }));
        const res = await fetch(baseUrl, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Create failed");
      }

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
        const res = await fetch(baseUrl, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Update failed");
      }

      if (deleted.current.length) {
        const payload = deleted.current.map(r => r.id);
        const res = await fetch(baseUrl, {
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
      // Purge when paginated ensures unsaved rows disappear; infinite preserves scroll cache
      gridRef.current?.api.refreshServerSide({ purge: displayType === "paginated" });
      toast.success("Locations saved");
    } catch (err) {
      console.error("❌ Save failed:", err);
      toast.error("Save failed");
    }
  };

  const handleRefresh = () => {
    created.current = [];
    updated.current = [];
    deleted.current = [];
    gridRef.current?.api.refreshServerSide({ purge: true });
  };

  useKeyboardShortcuts(
    handleSaveChanges,
    handleRefresh
  );

  const serverSideDatasource = useMemo(() => ({
    async getRows(params: any) {
      const { startRow, endRow } = params.request;
      const pageSize = endRow - startRow;
      const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/locations`;

      const pend = created.current;
      const pendCount = pend.length;
      const pageIndex = Math.floor(startRow / pageSize);
      let rows: LocationRow[] = [];
      let serverTotal = 0;

      if (displayType === "infinite") {
        if (startRow < pendCount) {
          const slice = pend.slice(startRow, startRow + pageSize);
          rows = [...slice];
          const need = pageSize - slice.length;
          if (need > 0) {
            const res = await fetch(
              `${baseUrl}?page=0&size=${need}&databaseName=${databaseName}&accountId=${accountId}`,
              { credentials: "include" }
            );
            const body = await res.json();
            const items = Array.isArray(body) ? body : body.content;
            serverTotal = Array.isArray(body) ? items.length : body.totalElements;
            rows.push(
              ...items.slice(0, need).map((loc: any) => ({
                id: loc.id,
                tempId: undefined,
                name: loc.name,
                address: loc.address,
                country: loc.country,
                city: loc.city,
                zip: String(loc.zipCode),
                accountId: Number(accountId),
                _isNew: false,
              }))
            );
          }
        } else {
          const serverStart = startRow - pendCount;
          const idx = Math.floor(serverStart / pageSize);
          const res = await fetch(
            `${baseUrl}?page=${idx}&size=${pageSize}&databaseName=${databaseName}&accountId=${accountId}`,
            { credentials: "include" }
          );
          const body = await res.json();
          const items = Array.isArray(body) ? body : body.content;
          serverTotal = Array.isArray(body) ? items.length : body.totalElements;
          rows = items.map((loc: any) => ({
            id: loc.id,
            tempId: undefined,
            name: loc.name,
            address: loc.address,
            country: loc.country,
            city: loc.city,
            zip: String(loc.zipCode),
            accountId: Number(accountId),
            _isNew: false,
          }));
        }
      } else {
        const res = await fetch(
          `${baseUrl}?page=${pageIndex}&size=${pageSize}&databaseName=${databaseName}&accountId=${accountId}`,
          { credentials: "include" }
        );
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.content;
        serverTotal = Array.isArray(data) ? items.length : data.totalElements;
        rows = items.map((loc: any) => ({
          id: loc.id,
          tempId: undefined,
          name: loc.name,
          address: loc.address,
          country: loc.country,
          city: loc.city,
          zip: String(loc.zipCode),
          accountId: Number(accountId),
          _isNew: false,
        }));
      }

      params.success({
        rowData: rows,
        rowCount: serverTotal + pendCount,
      });
    }
  }), [databaseName, accountId, displayType]);

  return (
    <>
      <TableToolbar
        tableName="Locations"
        onSave={handleSaveChanges}
        onRefresh={handleRefresh}
      />
      <div style={{ width: "100%", height: "90%" }}>
        <AgGridReact<LocationRow>
          ref={gridRef}
          className="ag-theme-quartz"
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          getRowId={params => params.data.id != null ? params.data.id.toString() : params.data.tempId!}
          rowModelType="serverSide"
          pagination={displayType === "paginated"}
          paginationPageSize={20}
          cacheBlockSize={20}
          serverSideDatasource={serverSideDatasource}
          animateRows={false}
          undoRedoCellEditing={true}
          undoRedoCellEditingLimit={20}
          suppressRowHoverHighlight={true}
          columnHoverHighlight={false}
          getContextMenuItems={params =>
            getLocationContextMenuItems(
              gridRef.current!.api!,
              created,
              deleted
            )(params)
          }
          onCellValueChanged={params => {
            const row = params.data as LocationRow;
            if (!row._isNew && row.id != null && !updated.current.find(r => r.id === row.id)) {
              updated.current.push(row);
            }
          }}
        />
      </div>
    </>
  );
};

export default LocationPage;
