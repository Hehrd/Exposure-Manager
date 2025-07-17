import type { GetContextMenuItemsParams, MenuItemDef } from "ag-grid-community";
import type { DatabaseRow } from "../types/DatabaseRow";

export const getDatabaseContextMenuItems = (
  setRowData: React.Dispatch<React.SetStateAction<DatabaseRow[] | null>>
) => {
  return (params: GetContextMenuItemsParams<DatabaseRow>): MenuItemDef[] => {
    const { node } = params;

    const addRow = () => {
      setRowData((prev) => [
        ...(prev || []),
        {
          databaseName: "NewDatabase",
          description: "",
          region: "",
          environment: "",
          ownerName: "Unknown Owner",
        },
      ]);
    };

    const duplicateRow = () => {
      const data = node?.data;
      if (data) {
        setRowData((prev) => [...(prev || []), { ...data }]);
      }
    };

    const deleteRow = () => {
      const data = node?.data;
      if (data) {
        setRowData((prev) => (prev || []).filter((r) => r !== data));
      }
    };

    if (!node || !node.data) {
      return [{ name: "➕ Add Database", action: addRow }];
    }

    return [
      { name: "➕ Add Database", action: addRow },
      { name: "📄 Duplicate Database", action: duplicateRow },
      { name: "🗑️ Delete Database", action: deleteRow },
    ];
  };
};
