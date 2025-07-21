import type { GetContextMenuItemsParams, MenuItemDef } from "ag-grid-community";
import type { PortfolioRow } from "../types/PortfolioRow";

export const getPortfolioContextMenuItems = (
  setRowData: React.Dispatch<React.SetStateAction<PortfolioRow[] | null>>,
  currentUsername: string
) => {
  return (params: GetContextMenuItemsParams<PortfolioRow>): MenuItemDef[] => {
    const { node } = params;

    const addRow = () => {
      setRowData((prev) => [
        ...(prev || []),
        {
          id: undefined,
          portfolioName: "NewPortfolio",
          ownerName: currentUsername,
          _isNew: true,
        },
      ]);
    };

    if (!node || !node.data) {
      return [{ name: "➕ Add Portfolio", action: addRow }];
    }

    return [
      { name: "➕ Add Portfolio", action: addRow },
      {
        name: "📄 Duplicate Portfolio",
        action: () => {
          const data = node.data;
          if (data) {
            setRowData((prev) => [
              ...(prev || []),
              {
                ...data,
                id: undefined,
                _isNew: true,
                _originalId: undefined,
              },
            ]);
          }
        },
      },
      {
        name: "🗑️ Delete Portfolio",
        action: () => {
          const data = node.data;
          if (data) {
            setRowData((prev) =>
              (prev || []).map((row) =>
                row.id === data.id
                  ? { ...row, _isDeleted: true }
                  : row
              )
            );
          }
        },
      },
    ];
  };
};
