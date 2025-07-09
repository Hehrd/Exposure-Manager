import React, { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "../styles/EditableTable.css";
import AppWrapper from "../components/AppWrapper";
import { useClickOutsideToStopEditing } from "../hooks/useClickOutsideToStopEditing";

ModuleRegistry.registerModules([AllCommunityModule]);

interface PolicyRow {
  name: string;
  startDate: string;
  expiryDate: string;
  coverage: number;
  perilType: string;
}

const policyData: PolicyRow[] = [
  {
    name: "General Liability",
    startDate: "2024-01-01",
    expiryDate: "2025-01-01",
    coverage: 500000,
    perilType: "Liability",
  },
  {
    name: "Cyber Risk",
    startDate: "2024-03-01",
    expiryDate: "2025-03-01",
    coverage: 250000,
    perilType: "Cyber",
  },
  {
    name: "Property",
    startDate: "2024-06-01",
    expiryDate: "2025-06-01",
    coverage: 1000000,
    perilType: "Physical Damage",
  },
];

const PolicyPage = () => {
  const { policyId } = useParams();
  const gridRef = useRef<AgGridReact<any>>(null);
  useClickOutsideToStopEditing(gridRef);

  const [colDefs] = useState<ColDef<PolicyRow>[]>([
    { field: "name", headerName: "Policy Name", flex: 2, editable: true },
    { field: "startDate", headerName: "Start Date", flex: 1, editable: true },
    { field: "expiryDate", headerName: "Expiry Date", flex: 1, editable: true },
    {
      field: "coverage",
      headerName: "Coverage $",
      flex: 1,
      editable: true,
      valueFormatter: (params: ValueFormatterParams) =>
        `$${params.value.toLocaleString()}`,
    },
    { field: "perilType", headerName: "Peril Type", flex: 1, editable: true },
  ]);

  const defaultColDef = useMemo<ColDef>(() => ({
    filter: true,
    editable: true,
    resizable: true,
  }), []);

  return (
    <AppWrapper>
      <div id="custom-grid-wrapper" style={{ width: "100%", height: "95vh" }}>
        <AgGridReact
          ref={gridRef}
          className="ag-theme-quartz"
          rowData={policyData}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          columnHoverHighlight={false}
          suppressRowHoverHighlight={true}
          pagination={true}
        />
      </div>
    </AppWrapper>
  );
};

export default PolicyPage;
