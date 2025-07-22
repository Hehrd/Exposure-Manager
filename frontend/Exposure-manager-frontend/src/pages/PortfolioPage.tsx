import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import type { ColDef } from "ag-grid-community";
import {
  AllCommunityModule,
  ModuleRegistry,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "../styles/EditableTable.css";

import AppWrapper from "../components/AppWrapper";
import TableToolbar from "../components/TableToolbar";
import { useClickOutsideToStopEditing } from "../hooks/useClickOutsideToStopEditing";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import type { PortfolioRow } from "../types/PortfolioRow";
import { getPortfolioContextMenuItems } from "../menus/getPortfolioContextMenuItems";

ModuleRegistry.registerModules([AllCommunityModule]);

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
  const { databaseName } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const gridRef = useRef<AgGridReact<PortfolioRow>>(null);
  const hasFetchedOnMount = useRef(false);

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const rawTableName = pathSegments[pathSegments.length - 1];
  const tableName = decodeURIComponent(rawTableName);

  const [rowData, setRowData] = useState<PortfolioRow[] | null>(null);

  const [colDefs] = useState<ColDef<PortfolioRow>[]>([{
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
  }]);

  const defaultColDef = useMemo<ColDef>(() => ({
    filter: true,
    editable: true,
    resizable: true,
    minWidth: 100,
  }), []);

  useClickOutsideToStopEditing(gridRef);

  const fetchPortfolios = async (page = 0, size = 20) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/portfolios?page=${page}&size=${size}&databaseName=${databaseName}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error("Failed to fetch portfolios");

      const data = await res.json();
      console.log(data)
      setRowData(
        Object.values(data || {}).map((p: any) => ({
          id: p.id,
          portfolioName: p.name,
          ownerName: user || "Unknown",
          _originalId: p.id,
          _originalName: p.name,
        }))
      );
    } catch (err) {
      console.error("❌ Error fetching portfolios:", err);
      toast.error("Failed to load portfolios");
      setRowData([]);
    }
  };

  useEffect(() => {
    if (!hasFetchedOnMount.current) {
      fetchPortfolios();
      hasFetchedOnMount.current = true;
    }
  }, []);

  const handleSaveChanges = async () => {
    gridRef.current?.api.stopEditing();
    const allData = rowData ?? [];

    const newRows = allData.filter((row) => row._isNew);
    const editedRows = allData.filter(
  (row) =>
    !row._isNew &&
    row._originalId &&
    row.id &&
    row.portfolioName !== row._originalName
);

    const deletedRows = allData.filter((row) => row._isDeleted && !row._isNew);

    const createPayload = newRows.map((row) => ({
      name: row.portfolioName,
      databaseName,
    }));

    const updatePayload = editedRows.map((row) => ({
      id: row.id,
      name: row.portfolioName,
      databaseName,
    }));

    const deletePayload = deletedRows.map((row) => row.id);

    if (createPayload.length > 0) {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/portfolios?databaseName=${databaseName}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(createPayload),
        });
        if (!res.ok) throw new Error("Create failed");
        toast.success("New portfolios created");
      } catch (err) {
        console.error(err);
        toast.error("Create failed");
      }
    }

    if (updatePayload.length > 0) {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/portfolios?databaseName=${databaseName}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updatePayload),
        });
        console.log('WHAT I SENT!!!!!!', JSON.stringify(updatePayload))
        if (!res.ok) throw new Error("Update failed");
        toast.success("Portfolio names updated");
      } catch (err) {
        console.error(err);
        toast.error("Update failed");
      }
    }

    if (deletePayload.length > 0) {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/portfolios?databaseName=${databaseName}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(deletePayload),
        });
        if (!res.ok) throw new Error("Delete failed");
        toast.success("Deleted portfolios");
      } catch (err) {
        console.error(err);
        toast.error("Delete failed");
      }
    }

    console.log("✅ Saved:", { createPayload, updatePayload, deletePayload });
    toast.success("Portfolio table saved");
    fetchPortfolios();
  };

  const handleRefresh = () => {
    gridRef.current?.api.stopEditing();
    fetchPortfolios();
    toast.info("Portfolio table refreshed");
  };

  useKeyboardShortcuts(handleSaveChanges, handleRefresh);

  return (
    <AppWrapper>
      <TableToolbar
        tableName={tableName}
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
            getPortfolioContextMenuItems(setRowData, user || "Unknown")(params)
          }
          overlayLoadingTemplate={
            '<span class="ag-overlay-loading-center">Loading portfolios...</span>'
          }
        />
      </div>
    </AppWrapper>
  );
};

export default PortfolioPage;
