// src/pages/JobsPage.tsx
import React, { useMemo, useRef, useContext } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ModuleRegistry,
  AllCommunityModule,
} from "ag-grid-community";
import type {
  ColDef,
  IServerSideDatasource,
  IServerSideGetRowsParams,
} from "ag-grid-community";
import "ag-grid-enterprise";

import AppWrapper from "../components/AppWrapper";
import { ThemeContext } from "../context/ThemeContext";
import type { DefaultJobResDTO } from "../types/JobRow";

// Register the community modules once per app lifetime
ModuleRegistry.registerModules([AllCommunityModule]);

export default function JobsPage() {
  const { displayType } = useContext(ThemeContext);
  const gridRef = useRef<AgGridReact<DefaultJobResDTO>>(null);

  // Column definitions matching your DTO
  const [colDefs] = React.useState<ColDef<DefaultJobResDTO>[]>([
    { field: "name", headerName: "Job Name", flex: 1, filter: true },
    {
      field: "timeStartedMillis",
      headerName: "Started",
      flex: 1,
      filter: "agDateColumnFilter",
      valueFormatter: (params) => {
        const v = params.value;
        const ms = typeof v === "number" ? v : parseInt(v, 10);
        return !isNaN(ms) ? new Date(ms).toLocaleString() : "";
      },
    },
    {
      field: "timeFinishedMillis",
      headerName: "Finished",
      flex: 1,
      filter: "agDateColumnFilter",
      valueFormatter: (params) => {
        const v = params.value;
        const ms = typeof v === "number" ? v : parseInt(v, 10);
        return !isNaN(ms) ? new Date(ms).toLocaleString() : "";
      },
    },
    { field: "status", headerName: "Status", flex: 1, filter: true },
  ]);

  // Default properties for all columns
  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      sortable: true,
      minWidth: 120,
    }),
    []
  );

  // Server-side data source: only GET
  const serverSideDatasource: IServerSideDatasource = {
    getRows: async (params: IServerSideGetRowsParams) => {
      const { startRow, endRow } = params.request;
      const page = Math.floor(startRow! / (endRow! - startRow!));
      const size = endRow! - startRow!;

      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/jobs?page=${page}&size=${size}`,
          { credentials: "include" }
        );

        if (!res.ok) {
          console.error("[JobsPage] fetch error:", res.status);
          params.fail();
          return;
        }

        const payload = await res.json();
        params.success({
          rowData: payload.content,
          rowCount: payload.totalElements,
        });
      } catch (err) {
        console.error("[JobsPage] network or parsing error:", err);
        params.fail();
      }
    },
  };

  // Refresh function to reload from server
  const handleRefresh = () => {
    gridRef.current?.api.refreshServerSide({ purge: true });
  };

  return (
    <AppWrapper>
      {/* Custom Toolbar */}
      <div className="p-2 bg-white border-b border-gray-200 flex items-center">
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* AG-Grid */}
      <div className="ag-theme-quartz" style={{ width: "100%", height: "80vh" }}>
        <AgGridReact<DefaultJobResDTO>
          serverSideDatasource={serverSideDatasource}
          ref={gridRef}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          rowModelType="serverSide"
          pagination={displayType === "paginated"}
          paginationPageSize={20}
          cacheBlockSize={20}
          animateRows={false}
          suppressRowHoverHighlight
          columnHoverHighlight={false}
        />
      </div>
    </AppWrapper>
  );
}
