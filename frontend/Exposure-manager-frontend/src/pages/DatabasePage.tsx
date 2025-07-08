import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "../styles/EditableTable.css";
import AppWrapper from "../components/AppWrapper"; 

ModuleRegistry.registerModules([AllCommunityModule]);

interface IRow {
  databaseName: string;
  ownerName: string;
}

const hardcodedData: IRow[] = [
  { databaseName: "CustomerDB", ownerName: "Alice Smith" },
  { databaseName: "InventoryDB", ownerName: "Bob Johnson" },
  { databaseName: "AnalyticsDB", ownerName: "Charlie Lee" },
  { databaseName: "BillingDB", ownerName: "Diana Scott" },

];


const DatabaseLinkRenderer = ({ value }: { value: string }) => {
  return (
    <Link
      to={`/databases/${encodeURIComponent(value)}`}
      className="text-blue-600 dark:text-blue-400 hover:underline"
    >
      {value}
    </Link>
  );
};

const Home = () => {
  const [colDefs] = useState<ColDef<IRow>[]>([
    {
      field: "databaseName",
      headerName: "Database Name",
      flex: 1,
      cellRenderer: DatabaseLinkRenderer,
      cellClass: "ag-cell-content-centered",
    },
    {
      field: "ownerName",
      headerName: "Owner Name",
      flex: 1,
    },
  ]);

  const defaultColDef = useMemo<ColDef>(() => ({
    filter: true,
    editable: false,
    resizable: true,
  }), []);

  return (
    <AppWrapper>
      <div id="custom-grid-wrapper" style={{ width: "100%", height: "95vh" }}>
        <AgGridReact
          theme={themeQuartz}
          rowData={hardcodedData}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          pagination={true}
        />
      </div>
    </AppWrapper>
  );
};

export default Home;
