import type { GetContextMenuItemsParams, MenuItemDef } from "ag-grid-community";
import type { PolicyRow } from "../types/PolicyRow";

export const getPolicyContextMenuItems = (
  setRowData: React.Dispatch<React.SetStateAction<PolicyRow[]>>
) => {
  return (params: GetContextMenuItemsParams<PolicyRow>): MenuItemDef[] => {
    const { node } = params;

    const addRow = () => {
      setRowData((prev) => [
        ...(prev || []),
        {
          name: "New Policy",
          startDate: "2025-01-01",
          expirationDate: "2026-01-01",
          coverage: 0,
          perilType: "",
          _isNew: true,
          _isDeleted: false,
        },
      ]);
      console.log("➕ Added new policy row");
    };

    if (!node || !node.data) {
      return [{ name: "➕ Add Policy", action: addRow }];
    }

    return [
      { name: "➕ Add Policy", action: addRow },
      {
        name: "📄 Duplicate Policy",
        action: () => {
          const data = node.data;
          if (data) {
            setRowData((prev) => [
              ...(prev || []),
              {
                ...data,
                _isNew: true,
                _isDeleted: false,
                _originalName: undefined,
              },
            ]);
            console.log("📄 Duplicated policy:", data.name);
          }
        },
      },
      {
        name: "🗑️ Delete Policy",
        action: () => {
          const data = node.data;
          if (data) {
            setRowData((prev) =>
              (prev || []).map((row) =>
                row === data ? { ...row, _isDeleted: true } : row
              )
            );
            console.log("🗑️ Marked policy as deleted:", data.name);
          }
        },
      },
    ];
  };
};
