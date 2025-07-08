import React, { useMemo, useState } from "react";
import type {
  ColDef,
  RowSelectionOptions,
  ValueFormatterParams,
} from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "../styles/EditableTable.css";

ModuleRegistry.registerModules([AllCommunityModule]);

// Custom Types
interface IRow {
  databaseName: string;
  ownerName: string;
}

// Hardcoded Data
const hardcodedData: IRow[] = [
  { databaseName: "CustomerDB", ownerName: "Alice Smith" },
  { databaseName: "InventoryDB", ownerName: "Bob Johnson" },
  { databaseName: "AnalyticsDB", ownerName: "Charlie Lee" },
  { databaseName: "BillingDB", ownerName: "Diana Scott" },
  { databaseName: "AnalyticsDB", ownerName: "Charlie Lee" },
  { databaseName: "BillingDB", ownerName: "Diana Scott" },
    { databaseName: "AnalyticsDB", ownerName: "Charlie Lee" },
  { databaseName: "BillingDB", ownerName: "Diana Scott" },
    { databaseName: "AnalyticsDB", ownerName: "Charlie Lee" },
  { databaseName: "BillingDB", ownerName: "Diana Scott" },
    { databaseName: "AnalyticsDB", ownerName: "Charlie Lee" },
  { databaseName: "BillingDB", ownerName: "Diana Scott" },
    { databaseName: "AnalyticsDB", ownerName: "Charlie Lee" },
  { databaseName: "BillingDB", ownerName: "Diana Scott" },
      { databaseName: "AnalyticsDB", ownerName: "Charlie Lee" },
  { databaseName: "BillingDB", ownerName: "Diana Scott" },
    { databaseName: "AnalyticsDB", ownerName: "Charlie Lee" },
  { databaseName: "BillingDB", ownerName: "Diana Scott" },
    { databaseName: "AnalyticsDB", ownerName: "Charlie Lee" },
  { databaseName: "BillingDB", ownerName: "Diana Scott" },
    { databaseName: "AnalyticsDB", ownerName: "Charlie Lee" },
  { databaseName: "BillingDB", ownerName: "Diana Scott" },
    { databaseName: "AnalyticsDB", ownerName: "Charlie Lee" },
  { databaseName: "BillingDB", ownerName: "Diana Scott" },
];

// Row selection config
const rowSelection: RowSelectionOptions = {
  mode: "multiRow",
  headerCheckbox: false,
};

const GridExample = () => {
  const [colDefs] = useState<ColDef<IRow>[]>([
    {
      field: "databaseName",
      headerName: "Database Name",
      flex: 1,
    },
    {
      field: "ownerName",
      headerName: "Owner Name",
      flex: 1,
    },
  ]);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      filter: true,
      editable: true,
      resizable: true,
    };
  }, []);

  return (
    <div id="custom-grid-wrapper" style={{ width: "100%", height: "95vh" }}>
      <AgGridReact
        theme={themeQuartz}
        rowData={hardcodedData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        // rowSelection={rowSelection}
        // onSelectionChanged={(event) => console.log("Row Selected!")}
        onCellValueChanged={(event) =>
          console.log(`New Cell Value: ${event.value}`)
        }
      />
    </div>
  );
};

export default GridExample;
