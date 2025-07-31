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
import type { PolicyRow } from "../types/PolicyRow";
import { getPolicyContextMenuItems } from "../menus/getPolicyContextMenuItems";
import { ThemeContext } from "../context/ThemeContext";

ModuleRegistry.registerModules([AllCommunityModule]);

const PolicyPage: React.FC = () => {
  const { displayType } = useContext(ThemeContext);
  const gridRef = useRef<AgGridReact<PolicyRow>>(null);
  const { databaseName, accountId } = useParams<{ databaseName: string; accountId: string }>();

  const created = useRef<PolicyRow[]>([]);
  const updated = useRef<PolicyRow[]>([]);
  const deleted = useRef<PolicyRow[]>([]);

  // any cell in a _isNew row gets red text
  const cellClassRules = { "text-red-600 dark:text-red-400": "data._isNew" };

  const [colDefs] = React.useState<ColDef<PolicyRow>[]>([
    { 
      field: "name", 
      headerName: "Policy Name", 
      flex: 2, 
      editable: true, 
      cellClassRules 
    },

    // --- DATE COLUMNS ---
    {
    field: "startDate",
    headerName: "Start Date",
    flex: 1,
    editable: true,
    filter: "agDateColumnFilter",      // date filter
    cellEditor: "agDateCellEditor",    // HTML5 date picker
    cellEditorParams: {
      useBrowserDatePicker: true,      // ensure native picker
    },
    // when editing: parse the "YYYY-MM-DD" back into a Date
    valueParser: params => {
      const d = new Date(params.newValue);
      return isNaN(d.getTime()) ? params.oldValue : d;
    },
    // always show YYYY-MM-DD
    valueFormatter: params =>
      params.value instanceof Date
        ? params.value.toISOString().slice(0, 10)
        : "",
    cellClassRules,
  },

  {
    field: "expirationDate",
    headerName: "Expiration Date",
    flex: 1,
    editable: true,
    filter: "agDateColumnFilter",
    cellEditor: "agDateCellEditor",
    cellEditorParams: {
      useBrowserDatePicker: true,
    },
    valueParser: params => {
      const d = new Date(params.newValue);
      return isNaN(d.getTime()) ? params.oldValue : d;
    },
    valueFormatter: params =>
      params.value instanceof Date
        ? params.value.toISOString().slice(0, 10)
        : "",
    cellClassRules,
  },

    // --- NUMERIC COLUMN ---
    {
      field: "coverage",
      headerName: "Coverage $",
      flex: 1,
      editable: true,
      filter: "agNumberColumnFilter",    // numeric filter UI
      cellEditor: "agNumericCellEditor", // only digits (and decimal/minus if you allow)
      valueParser: params => {
        // parse back into a number; reject bad input
        const n = parseFloat(params.newValue);
        return isNaN(n) ? params.oldValue : n;
      },
      valueFormatter: params =>
        // format with commas and dollar sign
        params.value != null
          ? `$${(params.value as number).toLocaleString()}`
          : "",
      cellClassRules,
    },

    { 
      field: "perilType", 
      headerName: "Peril Type", 
      flex: 1, 
      editable: true, 
      cellClassRules 
    },
  ]);


  const defaultColDef = useMemo<ColDef<PolicyRow>>(() => ({
    filter: true,
    editable: true,
    resizable: true,
    minWidth: 100,
  }), []);

  useClickOutsideToStopEditing(gridRef);

  const handleSaveChanges = async () => {
    gridRef.current?.api.stopEditing();
    try {
      const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/policies?databaseName=${databaseName}`;

      // CREATE
      if (created.current.length) {
        const payload = created.current.map(r => ({
          name: r.name,
          startDate: (r.startDate as Date).toISOString().slice(0, 10),
          expirationDate: (r.expirationDate as Date).toISOString().slice(0, 10),
          coverage: r.coverage,
          perilType: r.perilType,
          accountId: Number(accountId),
        }));
        const res = await fetch(baseUrl, {
          method: "POST",
          credentials: "include",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Create failed");
      }

      // UPDATE
      if (updated.current.length) {
        const payload = updated.current.map(r => ({
          id: r.id,
          name: r.name,
          startDate: (r.startDate as Date).toISOString().slice(0, 10),
          expirationDate: (r.expirationDate as Date).toISOString().slice(0, 10),
          coverage: r.coverage,
          perilType: r.perilType,
          accountId: Number(accountId),
        }));
        const res = await fetch(baseUrl, {
          method: "PUT",
          credentials: "include",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Update failed");
      }

      // DELETE
      if (deleted.current.length) {
        const payload = deleted.current.map(r => r.id);
        const res = await fetch(baseUrl, {
          method: "DELETE",
          credentials: "include",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Delete failed");
      }

      // clear buffers
      created.current = [];
      updated.current = [];
      deleted.current = [];
      // purge if paginated, ensures unsaved rows disappear
      gridRef.current?.api.refreshServerSide({ purge: displayType === "paginated" });
      toast.success("Policies saved");
    } catch (err) {
      console.error("❌ Save failed:", err);
      toast.error("Save failed");
    }
  };

  const handleRefresh = () => {
    // discard unsaved rows
    created.current = [];
    updated.current = [];
    deleted.current = [];
    gridRef.current?.api.refreshServerSide({ purge: true });
  };

  useKeyboardShortcuts(
    () => handleSaveChanges(),
    () => handleRefresh()
  );

  const serverSideDatasource = React.useMemo(() => ({
    async getRows(params: any) {
      const { startRow, endRow } = params.request;
      const pageSize = endRow - startRow;
      const pageIndex = Math.floor(startRow / pageSize);
      const url =
        `${import.meta.env.VITE_BACKEND_URL}/policies?page=${pageIndex}&size=${pageSize}` +
        `&databaseName=${databaseName}&accountId=${accountId}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      const items       = Array.isArray(data) ? data : data.content;
      const serverTotal = Array.isArray(data) ? items.length : data.totalElements;

      // map server rows
      const serverRows: PolicyRow[] = items.map((p: any) => ({
        id: p.id,
        tempId: undefined,
        name: p.name,
        startDate: new Date(p.startDate),        
        expirationDate: new Date(p.expirationDate),
        coverage: p.coverage,
        perilType: p.perilType,
        accountId: Number(accountId),
        _originalName: p.name,
        _originalStartDate: new Date(p.startDate),
        _originalExpirationDate: new Date(p.expirationDate),
        _originalCoverage: p.coverage,
        _originalPerilType: p.perilType,
        _isNew: false,
      }));

      const pending = created.current;
      const totalCount = serverTotal + pending.length;
      let pageRows: PolicyRow[];

      if (displayType === "infinite") {
        // infinite: merge pending across pages
        if ((pageIndex + 1)*pageSize <= serverTotal) {
          pageRows = serverRows;
        } else if (pageIndex*pageSize >= serverTotal) {
          const start = pageIndex*pageSize - serverTotal;
          pageRows = pending.slice(start, start+pageSize);
        } else {
          const remain = serverTotal - pageIndex*pageSize;
          pageRows = [
            ...serverRows.slice(0, remain),
            ...pending.slice(0, pageSize-remain)
          ];
        }
      } else {
        // paginated: pending only on first page
        pageRows = pageIndex === 0
          ? [...pending, ...serverRows].slice(0, pageSize)
          : serverRows;
      }

      params.success({ rowData: pageRows, rowCount: totalCount });
    }
  }), [databaseName, accountId, displayType]);

  return (
    <>
      <TableToolbar
        tableName="Policies"
        onSave={handleSaveChanges}
        onRefresh={handleRefresh}
      />
      <div style={{ width: "100%", height: "90%" }}>
        <AgGridReact<PolicyRow>
          ref={gridRef}
          className="ag-theme-quartz"
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          getRowId={params =>
            params.data.id != null ? params.data.id.toString() : params.data.tempId!
          }
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
            getPolicyContextMenuItems(
              gridRef.current!.api!,
              created,
              updated
            )(params)
          }
          onCellValueChanged={params => {
            const row = params.data as PolicyRow;
            if (!row._isNew && row.id != null) {
              if (!updated.current.find(r => r.id === row.id)) {
                updated.current.push(row);
              }
            }
          }}
        />
      </div>
    </>
  );
};

export default PolicyPage;
