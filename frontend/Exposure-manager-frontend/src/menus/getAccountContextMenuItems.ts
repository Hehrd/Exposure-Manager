// src/menus/getAccountContextMenuItems.ts
import type { GridApi, GetContextMenuItemsParams, MenuItemDef } from "ag-grid-community";
import type { AccountRow } from "../types/AccountRow";
import { toast } from "react-toastify";

export const getAccountContextMenuItems = (
  gridApi: GridApi<AccountRow>,
  currentUsername: string,
  createdRef: React.RefObject<AccountRow[]>,
  deletedRef: React.RefObject<AccountRow[]>
) => (params: GetContextMenuItemsParams<AccountRow>): MenuItemDef[] => {
  const d = params.node?.data;
  const genTempId = () => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  const addRow = () => {
    const newRow: AccountRow = {
      tempId: genTempId(),
      accountName: "NewAccount",
      ownerName: currentUsername,
      _isNew: true,
    };
    createdRef.current.unshift(newRow);
    // insert at the very top
    gridApi.applyServerSideTransaction({ add: [newRow], addIndex: 0 });
    setTimeout(() => {
      const rowNode = gridApi.getRowNode(newRow.tempId!);
      if (rowNode) {
        gridApi.startEditingCell({ rowIndex: rowNode.rowIndex!, colKey: "accountName" });
      }
    }, 0);
    toast.success("New account added at top");
  };

  const duplicateRow = () => {
    if (!d) return;
    const dup: AccountRow = {
      ...d,
      tempId: genTempId(),
      id: undefined,
      _isNew: true,
    };
    createdRef.current.unshift(dup);
    gridApi.applyServerSideTransaction({ add: [dup], addIndex: 0 });
    setTimeout(() => {
      const rowNode = gridApi.getRowNode(dup.tempId!);
      if (rowNode) {
        gridApi.startEditingCell({ rowIndex: rowNode.rowIndex!, colKey: "accountName" });
      }
    }, 0);
    toast.success("Account duplicated at top");
  };

  const deleteRow = () => {
    if (!d) return;
    if (d.id != null) {
      deletedRef.current.push(d);
    } else {
      createdRef.current = createdRef.current.filter(r => r.tempId !== d.tempId);
    }
    gridApi.applyServerSideTransaction({ remove: [d] });
    toast.info("Account removed");
  };

  if (!d) {
    return [{ name: "➕ Add Account", action: addRow }];
  }

  return [
    { name: "➕ Add Account", action: addRow },
    { name: "📄 Duplicate Account", action: duplicateRow },
    { name: "🗑️ Delete Account", action: deleteRow },
  ];
};
