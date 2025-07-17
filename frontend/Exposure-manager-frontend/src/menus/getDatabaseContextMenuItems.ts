import type { GetContextMenuItemsParams, MenuItemDef } from "ag-grid-community";
import type { DatabaseRow } from "../types/DatabaseRow";

export const getDatabaseContextMenuItems = (
  setRowData: React.Dispatch<React.SetStateAction<DatabaseRow[] | null>>,
  currentUsername: string
) => {
  return (params: GetContextMenuItemsParams<DatabaseRow>): MenuItemDef[] => {
    const { node } = params;

    const addRow = () => {
      setRowData((prev) => [
        ...(prev || []),
        {
          databaseName: "NewDatabase",
          ownerName: currentUsername,
          _isNew: true,
        },
      ]);
    };

    if (!node || !node.data) {
      return [{ name: "➕ Add Database", action: addRow }];
    }

    return [
      { name: "➕ Add Database", action: addRow },
      {
        name: "📄 Duplicate Database",
        action: () => {
          const data = node.data;
          if (data) {
            setRowData((prev) => [...(prev || []), { ...data }]);
          }
        },
      },
      {
        name: "🗑️ Delete Database",
        action: () => {
          const data = node.data;
          if (data) {
            setRowData((prev) => (prev || []).filter((r) => r !== data));
          }
        },
      },
    ];
  };
};
