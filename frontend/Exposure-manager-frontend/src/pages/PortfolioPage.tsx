import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "../styles/EditableTable.css";
import AppWrapper from "../components/AppWrapper";

ModuleRegistry.registerModules([AllCommunityModule]);

interface PortfolioRow {
  portfolioName: string;
  ownerName: string;
}

const portfolioData: PortfolioRow[] = [
  { portfolioName: "GrowthFund", ownerName: "Alice Smith" },
  { portfolioName: "ValueFund", ownerName: "Bob Johnson" },
  { portfolioName: "TechInvest", ownerName: "Charlie Lee" },
  { portfolioName: "RealEstateHoldings", ownerName: "Dana Patel" },
  { portfolioName: "GlobalEquity", ownerName: "Emily Chen" },
  { portfolioName: "EmergingMarkets", ownerName: "Frank Zhao" },
];

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
  const { databaseId } = useParams();

  const [colDefs] = useState<ColDef<PortfolioRow>[]>([
    {
      field: "portfolioName",
      headerName: "Portfolio Name",
      flex: 1,
      cellRenderer: PortfolioLinkRenderer,
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
          className="ag-theme-quartz"
          rowData={portfolioData}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          suppressClickEdit={true}
          columnHoverHighlight={false}
          suppressRowHoverHighlight={true}
          readOnlyEdit={true}
        />
      </div>
    </AppWrapper>
  );
};

export default DatabasePage;
