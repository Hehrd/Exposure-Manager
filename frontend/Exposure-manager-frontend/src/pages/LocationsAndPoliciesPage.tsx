import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "../styles/EditableTable.css";
import AppWrapper from "../components/AppWrapper";

ModuleRegistry.registerModules([AllCommunityModule]);

interface IRow {
  location: string;
  policy: string;
}

const hardcodedData: IRow[] = [
  { location: "New York HQ", policy: "General Liability" },
  { location: "London Branch", policy: "Cyber Risk" },
  { location: "Tokyo Office", policy: "Property Insurance" },
  { location: "Berlin Hub", policy: "Directors & Officers" },
  { location: "Toronto Node", policy: "Business Interruption" },
];


const LocationLinkRenderer = ({ value }: { value: string }) => {
  const { databaseId, portfolioId, accountId } = useParams();
  return (
    <Link
      to={`/databases/${encodeURIComponent(databaseId!)}/portfolios/${encodeURIComponent(portfolioId!)}/accounts/${encodeURIComponent(accountId!)}/locations/${encodeURIComponent(value)}`}
      className="text-blue-600 dark:text-blue-400 hover:underline"
    >
      {value}
    </Link>
  );
};


const PolicyLinkRenderer = ({ value }: { value: string }) => {
  const { databaseId, portfolioId, accountId } = useParams();
  return (
    <Link
      to={`/databases/${encodeURIComponent(databaseId!)}/portfolios/${encodeURIComponent(portfolioId!)}/accounts/${encodeURIComponent(accountId!)}/policies/${encodeURIComponent(value)}`}
      className="text-blue-600 dark:text-blue-400 hover:underline"
    >
      {value}
    </Link>
  );
};

const LocationsAndPoliciesPage = () => {
  const [colDefs] = useState<ColDef<IRow>[]>([
    {
      field: "location",
      headerName: "Location",
      flex: 1,
      cellRenderer: LocationLinkRenderer,
      cellClass: "ag-cell-content-centered",
    },
    {
      field: "policy",
      headerName: "Policy",
      flex: 1,
      cellRenderer: PolicyLinkRenderer,
      cellClass: "ag-cell-content-centered",
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
          className="ag-theme-quartz"
          rowData={hardcodedData}
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

export default LocationsAndPoliciesPage;
