import React, { useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import type {
  ColDef,
  GetContextMenuItemsParams,
  MenuItemDef,
} from "ag-grid-community";
import { getPolicyContextMenuItems } from "../menus/getPolicyContextMenuItems";
import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";
import { ContextMenuModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "../styles/EditableTable.css";
import AppWrapper from "../components/AppWrapper";
import TableToolbar from "../components/TableToolbar";
import { useClickOutsideToStopEditing } from "../hooks/useClickOutsideToStopEditing";
import type { PolicyRow } from "../types/PolicyRow";

ModuleRegistry.registerModules([AllCommunityModule, ContextMenuModule]);

const initialPolicyData: PolicyRow[] = [
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
  const gridRef = useRef<AgGridReact<PolicyRow>>(null);
  useClickOutsideToStopEditing(gridRef);
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const rawTableName = pathSegments[pathSegments.length - 1];
  const tableName = decodeURIComponent(rawTableName);



  const [rowData, setRowData] = useState<PolicyRow[]>(initialPolicyData);

  const [colDefs] = useState<ColDef<PolicyRow>[]>([
    { field: "name", headerName: "Policy Name", flex: 2, editable: true },
    { field: "startDate", headerName: "Start Date", flex: 1, editable: true },
    { field: "expiryDate", headerName: "Expiry Date", flex: 1, editable: true },
    {
      field: "coverage",
      headerName: "Coverage $",
      flex: 1,
      editable: true,
      valueFormatter: (params) =>
        `$${Number(params.value).toLocaleString()}`,
    },
    { field: "perilType", headerName: "Peril Type", flex: 1, editable: true },
  ]);

  const defaultColDef = useMemo<ColDef>(() => ({
    filter: true,
    editable: true,
    resizable: true,
    minWidth: 100,
  }), []);


  const handleSaveChanges = () => {
    gridRef.current?.api.stopEditing();
    const allData: PolicyRow[] = [];
    gridRef.current?.api.forEachNode((node) => {
      if (node.data) allData.push(node.data);
    });
    console.log("Saved all data:", allData);
  };

  const handleRefresh = () => {
    gridRef.current?.api.stopEditing();
    setRowData(initialPolicyData);
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
          getContextMenuItems={getPolicyContextMenuItems(setRowData)}
        />
      </div>
    </AppWrapper>
  );
};

export default PolicyPage;
