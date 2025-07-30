// src/menus/getDatabaseContextMenuItems.ts
import type { GetContextMenuItemsParams, MenuItemDef } from "ag-grid-community";
import type { DatabaseRow } from "../types/DatabaseRow";
import { toast } from "react-toastify";

export const getDatabaseContextMenuItems = (
  setRowData: React.Dispatch<React.SetStateAction<DatabaseRow[] | null>>,
  currentUsername: string
) => {
  return (params: GetContextMenuItemsParams<DatabaseRow>): MenuItemDef[] => {
    const d = params.node?.data;
    const genTempId = () => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    const addRow = () => {
      setRowData(prev => [
        { databaseName: "NewDatabase", ownerName: currentUsername, _isNew: true },
        ...(prev || [])
      ]);
      toast.success("New database added at top");
    };

    const duplicateRow = () => {
      if (!d) return;
      setRowData(prev => [
        { ...d, _isNew: true, _originalName: undefined },
        ...(prev || [])
      ]);
      toast.success("Database duplicated at top");
    };

    const deleteRow = () => {
      if (!d) return;
      setRowData(prev => (prev || []).map(r =>
        r.databaseName === d.databaseName
          ? { ...r, _isDeleted: true }
          : r
      ));
      toast.info("Database marked deleted");
    };

    if (!d) {
      return [{ name: "➕ Add Database", action: addRow }];
    }
    return [
      { name: "➕ Add Database", action: addRow },
      { name: "📄 Duplicate Database", action: duplicateRow },
      { name: "🗑️ Delete Database", action: deleteRow },
    ];
  };
};
