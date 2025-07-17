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
import { useAuth } from "../context/AuthContext";

ModuleRegistry.registerModules([AllCommunityModule]);

const Home = () => {
  const location = useLocation();
  const gridRef = useRef<AgGridReact<DatabaseRow>>(null);
  const hasFetchedOnMount = useRef(false);
  const { user } = useAuth();

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
      editable: false, // Make it read-only
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
      console.log(data);
      setRowData(
        (data || []).map((db: any) => ({
          databaseName: db.name,
          ownerName: db.ownerName,
          _originalName: db.name,
        }))
      );

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

  const handleSaveChanges = async () => {
    gridRef.current?.api.stopEditing();
    const allData: DatabaseRow[] = [];
    gridRef.current?.api.forEachNode((node) => {
      if (node.data) allData.push(node.data);
    });

    const newRows = allData.filter((row) => row._isNew);
    const editedRows = allData.filter(
      (row) =>
        !row._isNew &&
        row._originalName &&
        row.databaseName !== row._originalName
    );

    // === CREATE ===
    const createPayload = newRows.map((row) => ({
      name: row.databaseName,
    }));

    if (createPayload.length > 0) {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/databases`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(createPayload),
        });

        if (!res.ok) throw new Error("Create failed");
        toast.success("New databases created");
      } catch (err) {
        console.error(err);
        toast.error("Create failed");
      }
    }

    // === EDIT ===
    const updatePayload = editedRows.map((row) => ({
      oldName: row._originalName!,
      newName: row.databaseName,
    }));

    if (updatePayload.length > 0) {
      console.log(JSON.stringify(updatePayload))
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/databases`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updatePayload),
        });

        if (!res.ok) throw new Error("Update failed");
        toast.success("Database names updated");
      } catch (err) {
        console.error(err);
        toast.error("Update failed");
      }
    }

    console.log("Saved:", { createPayload, updatePayload });
    toast.success("Database table saved");
    fetchDatabases(); // Refresh table
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
          getContextMenuItems={getDatabaseContextMenuItems(setRowData, user || "Unknown")}
          overlayLoadingTemplate={
            '<span class="ag-overlay-loading-center">Loading databases...</span>'
          }
        />
      </div>
    </AppWrapper>
  );
};

export default Home;
