import React, { useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import "ag-grid-enterprise";

import "../styles/EditableTable.css";
import { useClickOutsideToStopEditing } from "../hooks/useClickOutsideToStopEditing";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import TableToolbar from "../components/TableToolbar";
import { toast } from "react-toastify";
import { getLocationContextMenuItems } from "../menus/getLocationContextMenuItems";


interface LocationRow {
  name: string;
  address: string;
  country: string;
  city: string;
  zip: string;
}

const initialLocationData: LocationRow[] = [
  { name: "NY HQ", address: "123 Main St", country: "USA", city: "New York", zip: "10001" },
  { name: "London Office", address: "456 Oxford St", country: "UK", city: "London", zip: "W1D 1AN" },
  { name: "Berlin Hub", address: "789 Friedrichstr.", country: "Germany", city: "Berlin", zip: "10117" },
];

const LocationTable = () => {
  const gridRef = useRef<AgGridReact<LocationRow>>(null);
  useClickOutsideToStopEditing(gridRef);

  const [rowData, setRowData] = useState<LocationRow[]>(initialLocationData);

  const [colDefs] = useState<ColDef<LocationRow>[]>([
    { field: "name", headerName: "Name", flex: 1, editable: true },
    { field: "address", headerName: "Address", flex: 2, editable: true },
    { field: "country", headerName: "Country", flex: 1, editable: true },
    { field: "city", headerName: "City", flex: 1, editable: true },
    { field: "zip", headerName: "Zip Code", flex: 1, editable: true },
  ]);

  const defaultColDef = useMemo<ColDef>(() => ({
    filter: true,
    editable: true,
    resizable: true,
    minWidth: 100,
    tooltipField: "value",
  }), []);

  const handleSave = () => {
    gridRef.current?.api.stopEditing();
    const updated: LocationRow[] = [];
    gridRef.current?.api.forEachNode((node) => {
      if (node.data) updated.push(node.data);
    });
    console.log("Saved locations:", updated);
    toast.success("Locations saved");
  };

  const handleRefresh = () => {
    gridRef.current?.api.stopEditing();
    setRowData(initialLocationData);
    toast.info("Locations reset");
  };

  useKeyboardShortcuts(handleSave, handleRefresh);

  return (
    <>
      <TableToolbar
        tableName="Locations"
        onSave={handleSave}
        onRefresh={handleRefresh}
      />
      <div id="custom-grid-wrapper" style={{ width: "100%", height: "85%" }}>
        <AgGridReact
          ref={gridRef}
          className="ag-theme-quartz"
          rowData={rowData}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          columnHoverHighlight={false}
          suppressRowHoverHighlight={true}
          getContextMenuItems={getLocationContextMenuItems(setRowData)}

        />
      </div>
    </>
  );
};

export default LocationTable;
