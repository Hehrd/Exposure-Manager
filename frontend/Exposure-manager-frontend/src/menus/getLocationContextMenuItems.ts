// src/menus/getLocationContextMenuItems.ts
import type { GridApi, GetContextMenuItemsParams, MenuItemDef } from "ag-grid-community";
import type { LocationRow } from "../types/LocationRow";
import { toast } from "react-toastify";

export const getLocationContextMenuItems = (
  gridApi: GridApi<LocationRow>,
  currentUsername: string,              // not used here but kept for symmetry
  createdRef: React.RefObject<LocationRow[]>,
  updatedRef: React.RefObject<LocationRow[]>,
  deletedRef: React.RefObject<LocationRow[]>
) => (params: GetContextMenuItemsParams<LocationRow>): MenuItemDef[] => {
  const d = params.node?.data;

  const genTempId = () =>
    `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  const addRow = () => {
    const newRow: LocationRow = {
      tempId: genTempId(),
      name: "New Location",
      address: "",
      country: "",
      city: "",
      zip: "",
      _isNew: true,
    };
    createdRef.current.push(newRow);
    gridApi.applyServerSideTransaction({ add: [newRow] });
    setTimeout(() => {
      const node = gridApi.getRowNode(newRow.tempId!);
      if (node) {
        gridApi.startEditingCell({ rowIndex: node.rowIndex!, colKey: "name" });
      }
    }, 0);
    toast.success("New location added");
  };

  const duplicateRow = () => {
    if (!d) return;
    const dup: LocationRow = {
      ...d,
      tempId: genTempId(),
      id: undefined,
      _isNew: true,
      // clear original markers so edits count as new changes
      _originalName: undefined,
      _originalAddress: undefined,
      _originalCountry: undefined,
      _originalCity: undefined,
      _originalZip: undefined,
    };
    createdRef.current.push(dup);
    gridApi.applyServerSideTransaction({ add: [dup] });
    setTimeout(() => {
      const node = gridApi.getRowNode(dup.tempId!);
      if (node) {
        gridApi.startEditingCell({ rowIndex: node.rowIndex!, colKey: "name" });
      }
    }, 0);
    toast.success("Location duplicated");
  };

  const deleteRow = () => {
    if (!d) return;
    if (d.id != null) deletedRef.current.push(d);
    else createdRef.current = createdRef.current.filter(r => r.tempId !== d.tempId);
    gridApi.applyServerSideTransaction({ remove: [d] });
    toast.info("Location removed");
  };

  if (!d) {
    return [{ name: "➕ Add Location", action: addRow }];
  }
  return [
    { name: "➕ Add Location", action: addRow },
    { name: "📄 Duplicate Location", action: duplicateRow },
    { name: "🗑️ Delete Location", action: deleteRow },
  ];
};
