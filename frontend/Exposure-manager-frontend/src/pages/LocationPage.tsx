import React, { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import type { ColDef } from "ag-grid-community";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "../styles/EditableTable.css";
import AppWrapper from "../components/AppWrapper";
import { useClickOutsideToStopEditing } from "../hooks/useClickOutsideToStopEditing";

ModuleRegistry.registerModules([AllCommunityModule]);

interface LocationRow {
  name: string;
  address: string;
  country: string;
  city: string;
  zip: string;
}

const locationData: LocationRow[] = [
  { name: "NY HQ", address: "123 Main St", country: "USA", city: "New York", zip: "10001" },
  { name: "London Office", address: "456 Oxford St", country: "UK", city: "London", zip: "W1D 1AN" },
  { name: "Berlin Hub", address: "789 Friedrichstr.", country: "Germany", city: "Berlin", zip: "10117" },
];

const LocationPage = () => {
  const gridRef = useRef<AgGridReact<any>>(null);
  const { locationId } = useParams();

  useClickOutsideToStopEditing(gridRef);

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
  }), []);

  return (
    <AppWrapper>
      <div id="custom-grid-wrapper" style={{ width: "100%", height: "95vh" }}>
        <AgGridReact
          ref={gridRef}
          className="ag-theme-quartz"
          rowData={locationData}
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

export default LocationPage;
