// src/pages/JobsPage.tsx
import React, { useMemo, useRef, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ModuleRegistry,
  AllCommunityModule,
  ColDef,
  IServerSideDatasource,
  IServerSideGetRowsParams
} from "ag-grid-community";
import "ag-grid-enterprise";
import AppWrapper from '../components/AppWrapper';
import type { DefaultJobResDTO } from "../types/JobRow";

// Register the community modules once per app lifetime
ModuleRegistry.registerModules([AllCommunityModule]);

export default function JobsPage() {
  const gridRef = useRef<AgGridReact<DefaultJobResDTO>>(null);

  // Column definitions matching your DTO
  const [colDefs] = React.useState<ColDef<DefaultJobResDTO>[]>([
    { field: "name", headerName: "Job Name", flex: 1, filter: true },
    {
      field: "timeStarted",
      headerName: "Started",
      flex: 1,
      filter: "agDateColumnFilter",
      valueFormatter: (p) =>
        p.value ? new Date(p.value).toLocaleString() : "",
    },
    {
      field: "timeFinished",
      headerName: "Finished",
      flex: 1,
      filter: "agDateColumnFilter",
      valueFormatter: (p) =>
        p.value ? new Date(p.value).toLocaleString() : "",
    },
    { field: "status", headerName: "Status", flex: 1, filter: true },
  ]);

  // Default properties for all columns
  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      sortable: true,
      minWidth: 120,
      suppressMenuHide: true,
    }),
    []
  );

  // Server-side data source: only GET
  const serverSideDatasource: IServerSideDatasource = {
    getRows: async (params: IServerSideGetRowsParams) => {
      const { startRow, endRow } = params.request;
      const page       = Math.floor(startRow / (endRow - startRow));
      const size       = endRow - startRow;

      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/jobs?page=${page}&size=${size}`,
          { credentials: "include" }
        );
        const json: { content: DefaultJobResDTO[]; totalElements: number } =
          await res.json();

        params.success({
          rowData: json.content,
          rowCount: json.totalElements,
        });
      } catch (err) {
        console.error("Failed to load jobs:", err);
        params.fail();
      }
    },
  };

  // Once the grid is ready, register the SSRM datasource
  const onGridReady = (params: any) => {
    params.api.setServerSideDatasource(serverSideDatasource);
  };

  return (
    <AppWrapper>
        <>
        
            <div
                className="ag-theme-quartz "
                style={{ width: "100%", height: "80vh" }}
            >
                <AgGridReact<DefaultJobResDTO>
                ref={gridRef}
                columnDefs={colDefs}
                defaultColDef={defaultColDef}
                rowModelType="serverSide"
                pagination
                paginationPageSize={20}
                cacheBlockSize={20}
                animateRows={false}
                suppressRowHoverHighlight
                columnHoverHighlight={false}
                onGridReady={onGridReady}
                />
            </div>
        </>
    </AppWrapper>
  );
}
