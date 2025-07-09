import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "../styles/EditableTable.css";
import AppWrapper from "../components/AppWrapper";

ModuleRegistry.registerModules([AllCommunityModule]);

interface IRow {
  accountName: string;
  ownerName: string;
}

const hardcodedData: IRow[] = [
  { accountName: "MainAccount01", ownerName: "Sarah Li" },
  { accountName: "ReserveFund", ownerName: "David Kim" },
  { accountName: "TechGrowth", ownerName: "Emma Wong" },
  { accountName: "PrivateWealth", ownerName: "Liam Cooper" },
  { accountName: "HNW_Account", ownerName: "Sophia Verma" },
];

const AccountLinkRenderer = ({ value }: { value: string }) => {
  const { databaseId, portfolioId } = useParams();
  return (
    <Link
      to={`/databases/${encodeURIComponent(databaseId!)}/portfolios/${encodeURIComponent(portfolioId!)}/accounts/${encodeURIComponent(value)}`}
      className="text-blue-600 dark:text-blue-400 hover:underline"
    >
      {value}
    </Link>
  );
};

const AccountPage = () => {
  const [colDefs] = useState<ColDef<IRow>[]>([
    {
      field: "accountName",
      headerName: "Account Name",
      flex: 1,
      cellRenderer: AccountLinkRenderer,
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

export default AccountPage;
