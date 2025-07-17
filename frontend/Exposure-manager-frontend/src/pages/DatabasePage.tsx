import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "../styles/EditableTable.css";

import AppWrapper from "../components/AppWrapper";
import TableToolbar from "../components/TableToolbar";
import { useClickOutsideToStopEditing } from "../hooks/useClickOutsideToStopEditing";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { toast } from "react-toastify";
import { getDatabaseContextMenuItems } from "../menus/getDatabaseContextMenuItems";
import { DatabaseLinkRenderer } from "../renderers/DatabaseLinkRenderer";
import type { DatabaseRow } from "../types/DatabaseRow";

ModuleRegistry.registerModules([AllCommunityModule]);

const Home = () => {
  const location = useLocation();
  const gridRef = useRef<AgGridReact<DatabaseRow>>(null);
  const hasFetchedOnMount = useRef(false);

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const rawTableName = pathSegments[pathSegments.length - 1];
  const tableName = decodeURIComponent(rawTableName);

  const [rowData, setRowData] = useState<DatabaseRow[] | null>(null);

  const [colDefs] = useState<ColDef<DatabaseRow>[]>([
    {
      field: "databaseName",
      headerName: "Database Name",
      flex: 1,
      editable: true,
      cellRenderer: (params) => <DatabaseLinkRenderer value={params.value} />,
    },
    {
      field: "ownerName",
      headerName: "Owner Name",
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

  const fetchDatabases = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/databases?page=0&size=20`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch databases");

      const data = await res.json();
      setRowData(data.content || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load databases");
      setRowData([]);
    }
  };

  useEffect(() => {
    if (!hasFetchedOnMount.current) {
      fetchDatabases();
      hasFetchedOnMount.current = true;
    }
  }, []);

  const handleSaveChanges = () => {
    gridRef.current?.api.stopEditing();
    const allData: DatabaseRow[] = [];
    gridRef.current?.api.forEachNode((node) => {
      if (node.data) allData.push(node.data);
    });
    console.log("Saved databases:", allData);
    toast.success("Database table saved");
  };

  const handleRefresh = () => {
    gridRef.current?.api.stopEditing();
    fetchDatabases();
    toast.info("Database table refreshed");
  };

  useKeyboardShortcuts(handleSaveChanges, handleRefresh);

  return (
    <AppWrapper>
      <TableToolbar
        tableName="Databases"
        onSave={handleSaveChanges}
        onRefresh={handleRefresh}
      />

      <div id="custom-grid-wrapper" style={{ width: "100%", height: "85vh" }}>
        <AgGridReact
          ref={gridRef}
          className="ag-theme-quartz"
          rowData={rowData ?? []}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          columnHoverHighlight={false}
          suppressRowHoverHighlight={true}
          getContextMenuItems={getDatabaseContextMenuItems(setRowData)}
          overlayLoadingTemplate={
            '<span class="ag-overlay-loading-center">Loading databases...</span>'
          }
        />
      </div>
    </AppWrapper>
  );
};

export default Home;
