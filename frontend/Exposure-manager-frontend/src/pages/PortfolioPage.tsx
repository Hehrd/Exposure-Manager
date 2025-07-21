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
import { getPortfolioContextMenuItems } from "../menus/getPortfolioContextMenuItems";
import { useAuth } from "../context/AuthContext";
import type { PortfolioRow } from "../types/PortfolioRow";

ModuleRegistry.registerModules([AllCommunityModule]);

const PortfolioLinkRenderer = ({ value }: { value: string }) => {
  const { databaseName } = useParams();
  return (
    <Link
      to={`/databases/${encodeURIComponent(databaseName!)}/portfolios/${encodeURIComponent(value)}`}
      className="text-blue-600 dark:text-blue-400 hover:underline"
    >
      {value}
    </Link>
  );
};

const DatabasePage = () => {
  const { databaseName } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const gridRef = useRef<AgGridReact<PortfolioRow>>(null);
  const hasFetchedOnMount = useRef(false);

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const rawTableName = pathSegments[pathSegments.length - 1];
  const tableName = decodeURIComponent(rawTableName);

  const [rowData, setRowData] = useState<PortfolioRow[] | null>(null);

  const [colDefs] = useState<ColDef<PortfolioRow>[]>([
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

  const fetchPortfolios = async (page = 0, size = 20) => {
    console.log("📡 Fetching portfolios...");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/portfolios?page=${page}&size=${size}&databaseName=${databaseName}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error("Failed to fetch portfolios");

      const data = await res.json();
      console.log("✅ Fetched portfolios:", data.content);
      setRowData(
        (data.content || []).map((p: any) => ({
          portfolioName: p.name,
          ownerName: p.ownerName,
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
      console.log("🚀 Initial fetch triggered");
      fetchPortfolios();
      hasFetchedOnMount.current = true;
    }
  }, []);

  const handleSaveChanges = async () => {
    gridRef.current?.api.stopEditing();

    const allData = rowData ?? [];
    console.log("📝 All row data:", allData);

    const newRows = allData.filter((row) => row._isNew);
    const editedRows = allData.filter(
      (row) =>
        !row._isNew &&
        row._originalName &&
        row.portfolioName !== row._originalName
    );
    const deletedRows = allData.filter((row) => row._isDeleted && !row._isNew);

    const createPayload = newRows.map((row) => ({
      name: row.portfolioName,
      databaseName,
    }));
    const updatePayload = editedRows.map((row) => ({
      oldName: row._originalName!,
      newName: row.portfolioName,
      databaseName,
    }));
    const deletePayload = deletedRows.map((row) => row.portfolioName);

    console.log("🆕 Create payload:", createPayload);
    console.log("✏️ Update payload:", updatePayload);
    console.log("🗑️ Delete payload:", deletePayload);

    try {
      if (createPayload.length > 0) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/portfolios`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(createPayload),
        });
        toast.success("Created portfolios");
      }

      if (updatePayload.length > 0) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/portfolios`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updatePayload),
        });
        toast.success("Updated portfolios");
      }

      if (deletePayload.length > 0) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/portfolios`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(deletePayload),
        });
        toast.success("Deleted portfolios");
      }

      console.log("💾 Save complete. Refreshing...");
      fetchPortfolios();
      toast.success("Portfolio table saved");
    } catch (err) {
      console.error("❌ Error saving changes:", err);
      toast.error("Save failed");
    }
  };

  const handleRefresh = () => {
    gridRef.current?.api.stopEditing();
    console.log("🔄 Manual refresh");
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
          getContextMenuItems={getPortfolioContextMenuItems(setRowData, user || "Unknown")}
          overlayLoadingTemplate={
            '<span class="ag-overlay-loading-center">Loading portfolios...</span>'
          }
        />
      </div>
    </AppWrapper>
  );
};

export default DatabasePage;
