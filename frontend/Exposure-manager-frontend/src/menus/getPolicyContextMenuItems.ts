// src/menus/getPolicyContextMenuItems.ts
import type { GridApi, GetContextMenuItemsParams, MenuItemDef } from "ag-grid-community";
import type { PolicyRow } from "../types/PolicyRow";
import { toast } from "react-toastify";

export const getPolicyContextMenuItems = (
  gridApi: GridApi<PolicyRow>,
  createdRef: React.RefObject<PolicyRow[]>,
  updatedRef: React.RefObject<PolicyRow[]>,
  deletedRef: React.RefObject<PolicyRow[]>
) => (params: GetContextMenuItemsParams<PolicyRow>): MenuItemDef[] => {
  const d = params.node?.data;
  const genTempId = () =>
    `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  const addRow = () => {
    const now = new Date().toISOString().slice(0, 10);
    const newRow: PolicyRow = {
      tempId: genTempId(),
      name: "New Policy",
      startDate: now,
      expirationDate: now,
      coverage: 0,
      perilType: "",
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
    toast.success("New policy added");
  };

  const duplicateRow = () => {
    if (!d) return;
    const dup: PolicyRow = {
      ...d,
      tempId: genTempId(),
      id: undefined,
      _isNew: true,
      // clear originals so edits record
      _originalName: undefined,
      _originalStartDate: undefined,
      _originalExpirationDate: undefined,
      _originalCoverage: undefined,
      _originalPerilType: undefined,
    };
    createdRef.current.push(dup);
    gridApi.applyServerSideTransaction({ add: [dup] });
    setTimeout(() => {
      const node = gridApi.getRowNode(dup.tempId!);
      if (node) {
        gridApi.startEditingCell({ rowIndex: node.rowIndex!, colKey: "name" });
      }
    }, 0);
    toast.success("Policy duplicated");
  };

  const deleteRow = () => {
    if (!d) return;
    if (d.id != null) deletedRef.current.push(d);
    else createdRef.current = createdRef.current.filter(r => r.tempId !== d.tempId);
    gridApi.applyServerSideTransaction({ remove: [d] });
    toast.info("Policy removed");
  };

  if (!d) {
    return [{ name: "➕ Add Policy", action: addRow }];
  }
  return [
    { name: "➕ Add Policy", action: addRow },
    { name: "📄 Duplicate Policy", action: duplicateRow },
    { name: "🗑️ Delete Policy", action: deleteRow },
  ];
};
