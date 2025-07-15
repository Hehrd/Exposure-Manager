import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import type { ColDef, GetContextMenuItemsParams, MenuItemDef } from "ag-grid-community";
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
import { getPortfolioContextMenuItems } from "../menus/getPortfolioContextMenuItems";

ModuleRegistry.registerModules([AllCommunityModule]);

interface PortfolioRow {
  id?: string;
  name: string;
  databaseName: string;
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

const PortfolioPage = () => {
  const location = useLocation();
  const gridRef = useRef<AgGridReact<PortfolioRow>>(null);
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const rawTableName = pathSegments[pathSegments.length - 1];
  const tableName = decodeURIComponent(rawTableName);

  const [rowData, setRowData] = useState<PortfolioRow[]>([]);
  const [originalData, setOriginalData] = useState<PortfolioRow[]>([]);

  useClickOutsideToStopEditing(gridRef);
  useKeyboardShortcuts(handleSaveChanges, handleRefresh);

  const [colDefs] = useState<ColDef<PortfolioRow>[]>([
    {
      field: "name",
      headerName: "Portfolio Name",
      flex: 1,
      editable: true,
      cellRenderer: PortfolioLinkRenderer,
    },
    {
      field: "databaseName",
      headerName: "Database Name",
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

  const fetchPortfolios = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/portfolios?page=0&size=20&databaseId=1`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to fetch portfolios");

      const data = await res.json();
      setRowData(data.content || []);
      setOriginalData(data.content || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load portfolios");
      setRowData([]);
      setOriginalData([]);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleSaveChanges = async () => {
    gridRef.current?.api.stopEditing();
    const currentData: PortfolioRow[] = [];
    gridRef.current?.api.forEachNode((node) => {
      if (node.data) currentData.push(node.data);
    });

    const originalIds = new Set(originalData.map((d) => d.id));
    const currentIds = new Set(currentData.map((d) => d.id));

    const toCreate = currentData.filter((d) => !d.id);
    const toUpdate = currentData.filter((d) => {
      const original = originalData.find((o) => o.id === d.id);
      return (
        d.id &&
        original &&
        (d.name !== original.name || d.databaseName !== original.databaseName)
      );
    });
    const toDelete = originalData
      .filter((d) => !currentIds.has(d.id))
      .map((d) => d.id);

    try {
      if (toCreate.length > 0) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/portfolios`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toCreate),
          credentials: "include",
        });
      }  

      if (toUpdate.length > 0) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/portfolios`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toUpdate),
          credentials: "include",
        });
      }

      if (toDelete.length > 0) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/portfolios`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toDelete),
          credentials: "include",
        });
      }

      toast.success("Changes saved!");
      fetchPortfolios();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes.");
    }
  };

  const handleRefresh = () => {
    gridRef.current?.api.stopEditing();
    fetchPortfolios();
    toast.info("Portfolio table refreshed");
  };

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
          rowData={rowData}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          columnHoverHighlight={false}
          suppressRowHoverHighlight={true}
          overlayLoadingTemplate={
            '<span class="ag-overlay-loading-center">Loading portfolios...</span>'
          }
          getContextMenuItems={getPortfolioContextMenuItems(setRowData)}
        />
      </div>
    </AppWrapper>
  );
};

export default PortfolioPage;
