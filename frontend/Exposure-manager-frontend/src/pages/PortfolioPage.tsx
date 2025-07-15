import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import type { ColDef } from "ag-grid-community";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "../styles/EditableTable.css";

import AppWrapper from "../components/AppWrapper";
import TableToolbar from "../components/TableToolbar";
import { useClickOutsideToStopEditing } from "../hooks/useClickOutsideToStopEditing";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { toast } from "react-toastify";

ModuleRegistry.registerModules([AllCommunityModule]);

interface PortfolioRow {
  portfolioName: string;
  ownerName: string;
}

const PortfolioLinkRenderer = ({ value }: { value: string }) => {
  const { databaseId } = useParams();
  return (
    <Link
      to={`/databases/${encodeURIComponent(databaseId!)}/portfolios/${encodeURIComponent(value)}`}
      className="text-blue-600 dark:text-blue-400 hover:underline"
    >
      {value}
    </Link>
  );
};

const DatabasePage = () => {
  const location = useLocation();
  const gridRef = useRef<AgGridReact<PortfolioRow>>(null);
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const rawTableName = pathSegments[pathSegments.length - 1];
  const tableName = decodeURIComponent(rawTableName);

  const [rowData, setRowData] = useState<PortfolioRow[] | null>(null); // null = loading
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

  const fetchPortfolios = async (page = 0, size = 20) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/portfolios?page=${page}&size=${size}&databaseId=1`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to fetch portfolios");

      const data = await res.json();
      setRowData(data.content || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load portfolios");
      setRowData([]); // fallback to empty
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleSaveChanges = () => {
    gridRef.current?.api.stopEditing();
    const allData: PortfolioRow[] = [];
    gridRef.current?.api.forEachNode((node) => {
      if (node.data) allData.push(node.data);
    });
    console.log("Saved portfolio data:", allData);
    toast.success("Portfolio table saved");
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
          rowData={rowData ?? []}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          columnHoverHighlight={false}
          suppressRowHoverHighlight={true}
          overlayLoadingTemplate={
            '<span class="ag-overlay-loading-center">Loading portfolios...</span>'
          }
        />
      </div>
    </AppWrapper>
  );
};

export default DatabasePage;
