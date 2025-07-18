import type { GetContextMenuItemsParams, MenuItemDef } from "ag-grid-community";
import type { AccountRow } from "../types/AccountRow";

export const getAccountContextMenuItems = (
  setRowData: React.Dispatch<React.SetStateAction<AccountRow[] | null>>,
  currentUsername: string
) => {
  return (params: GetContextMenuItemsParams<AccountRow>): MenuItemDef[] => {
    const { node } = params;

    const addRow = () => {
      setRowData((prev) => [
        ...(prev || []),
        {
          accountName: "NewAccount",
          ownerName: currentUsername,
          _isNew: true,
        },
      ]);
      console.log("➕ Added new account row");
    };

    if (!node || !node.data) {
      return [{ name: "➕ Add Account", action: addRow }];
    }

    return [
      { name: "➕ Add Account", action: addRow },
      {
        name: "📄 Duplicate Account",
        action: () => {
          const data = node.data;
          if (data) {
            setRowData((prev) => [
              ...(prev || []),
              {
                ...data,
                _isNew: true,
                _originalName: undefined,
              },
            ]);
            console.log("📄 Duplicated account:", data);
          }
        },
      },
      {
        name: "🗑️ Delete Account",
        action: () => {
          const data = node.data;
          if (data) {
            setRowData((prev) =>
              (prev || []).map((row) =>
                row._originalName === data._originalName
                  ? { ...row, _isDeleted: true }
                  : row
              )
            );
            console.log("🗑️ Marked account as deleted:", data.accountName);
          }
        },
      },
    ];
  };
};
