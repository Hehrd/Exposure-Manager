import type { GetContextMenuItemsParams, MenuItemDef } from "ag-grid-community";
import type { PolicyRow } from "../types/PolicyRow";

export const getPolicyContextMenuItems = (
  setRowData: React.Dispatch<React.SetStateAction<PolicyRow[]>>
) => {
  return (params: GetContextMenuItemsParams<PolicyRow>): MenuItemDef[] => {
    const { node, api } = params;

    // If not on a row — only show "Add"
    if (!node || !node.data) {
      return [
        {
          name: "➕ Add New Row",
          action: () => {
            setRowData((prev) => [
              ...prev,
              {
                name: "New Policy",
                startDate: "2025-01-01",
                expiryDate: "2026-01-01",
                coverage: 0,
                perilType: "",
              },
            ]);
          },
        },
      ];
    }

    // If on a row — show full menu
    return [
      {
        name: "➕ Add New Row",
        action: () => {
          setRowData((prev) => [
            ...prev,
            {
              name: "New Policy",
              startDate: "2025-01-01",
              expiryDate: "2026-01-01",
              coverage: 0,
              perilType: "",
            },
          ]);
        },
      },
      {
        name: "📄 Duplicate Row",
        action: () => {
          const data = node.data;
          if (data) setRowData((prev) => [...prev, { ...data }]);
        },
      },
      {
        name: "🗑️ Delete Row",
        action: () => {
          const data = node.data;
          if (data) setRowData((prev) => prev.filter((r) => r !== data));
        },
      },
    ];
  };
};
