import type { GetContextMenuItemsParams, MenuItemDef } from "ag-grid-community";
import type { PortfolioRow } from "../pages/PortfolioPage"; // adjust if needed

export const getPortfolioContextMenuItems = (
  setRowData: React.Dispatch<React.SetStateAction<PortfolioRow[] | null>>
) => {
  return (params: GetContextMenuItemsParams<PortfolioRow>): MenuItemDef[] => {
    const { node } = params;

    const addRow = () => {
      setRowData((prev) => [
        ...(prev || []),
        {
          portfolioName: "New Portfolio",
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

    // Show only Add when not right-clicking a row
    if (!node || !node.data) {
      return [{ name: "➕ Add Portfolio", action: addRow }];
    }

    // Full menu
    return [
      { name: "➕ Add Portfolio", action: addRow },
      { name: "📄 Duplicate Portfolio", action: duplicateRow },
      { name: "🗑️ Delete Portfolio", action: deleteRow },
    ];
  };
};
