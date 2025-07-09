import React, { useMemo, useRef, useEffect, useState } from "react";
import type { ColDef } from "ag-grid-community";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "../styles/EditableTable.css";

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

const GridExample = () => {
  const gridRef = useRef<AgGridReact<any>>(null);

  const [colDefs] = useState<ColDef<IRow>[]>([
    { field: "databaseName", headerName: "Database Name", flex: 1 },
    { field: "ownerName", headerName: "Owner Name", flex: 1 },
  ]);

  const defaultColDef = useMemo<ColDef>(() => ({
    filter: true,
    editable: true,
    resizable: true,
  }), []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      const gridWrapper = document.getElementById("custom-grid-wrapper");
      const isInGrid = gridWrapper?.contains(target);
      const isCell = target.closest(".ag-cell");
      const isRow = target.closest(".ag-row");

      const isBlankGridSpace =
        isInGrid &&
        !isCell &&
        !isRow &&
        target.closest(".ag-center-cols-viewport");

      const isOutsideGrid = !isInGrid;

      if (isOutsideGrid || isBlankGridSpace) {
        gridRef.current?.api.stopEditing();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div id="custom-grid-wrapper" style={{ width: "100%", height: "95vh" }}>
      <AgGridReact
        ref={gridRef}
        theme={themeQuartz}
        rowData={hardcodedData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        columnHoverHighlight={false}
        suppressRowHoverHighlight={true}
        onCellValueChanged={(event) =>
          console.log(`New Cell Value: ${event.value}`)
        }
      />
    </div>
  );
};

export default GridExample;
