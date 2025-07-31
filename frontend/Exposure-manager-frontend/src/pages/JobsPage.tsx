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
  const gridRef = useRef<AgGridReact<DefaultJobResDTO> | null>(null);

  // Column definitions matching your DTO
  const [colDefs] = React.useState<ColDef<DefaultJobResDTO, any>[]>([
    { field: "name", headerName: "Job Name", flex: 1, filter: true },
    {
      field: "timeStartedMillis",
      headerName: "Started",
      flex: 1,
      filter: "agDateColumnFilter",
      valueFormatter: ({ value }) =>
        value != null
          ? new Date(value).toLocaleString()
          : "——",
      cellStyle: ({ value }) =>
        value == null ? { textAlign: "center" } : undefined,
    },
    {
      field: "timeFinishedMillis",
      headerName: "Finished",
      flex: 1,
      filter: "agDateColumnFilter",
      valueFormatter: ({ value }) =>
        value != null
          ? new Date(value).toLocaleString()
          : "——",
      cellStyle: ({ value }) =>
        value == null ? { textAlign: "center" } : undefined,
    },
    { field: "status", headerName: "Status", flex: 1, filter: true },
  ]);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      sortable: true,
      minWidth: 120,
    }),
    []
  );

  const serverSideDatasource: IServerSideDatasource = {
    getRows: async (params: IServerSideGetRowsParams) => {
      const { startRow, endRow } = params.request;
      const page = Math.floor(startRow! / (endRow! - startRow!));
      const size = endRow! - startRow!;

      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/jobs?page=${page}&size=${size}`;
        const res = await fetch(url, { credentials: "include" });

        console.log("[JobsPage] fetch URL:", url);
        console.log("[JobsPage] raw response:", res);

        if (!res.ok) {
          console.error("[JobsPage] fetch error status:", res.status);
          params.fail();
          return;
        }

        const payload = await res.json();
        console.log("[JobsPage] parsed payload:", payload);

        // Map raw DTO fields to your grid columns
        const rowData = payload.content.map((job: DefaultJobResDTO) => job);

        params.success({
          rowData,
          rowCount: payload.totalElements,
        });
      } catch (err) {
        console.error("[JobsPage] network or parsing error:", err);
        params.fail();
      }
    },
  };

  const handleRefresh = () => {
    gridRef.current?.api.refreshServerSide({ purge: true });
  };

  return (
    <AppWrapper>
      <div className="p-2 bg-[var(--bg-color)] border-b border-gray-200 flex items-center">
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

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
