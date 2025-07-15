import type { GetContextMenuItemsParams, MenuItemDef } from "ag-grid-community";

interface PortfolioRow {
  portfolioName: string;
  ownerName: string;
}

export const getPortfolioContextMenuItems = (
  setRowData: React.Dispatch<React.SetStateAction<PortfolioRow[]>>
) => {
  return (params: GetContextMenuItemsParams<PortfolioRow>): MenuItemDef[] => {
    const { node } = params;

    if (!node || !node.data) {
      return [
        {
          name: "➕ Add New Portfolio",
          action: () => {
            setRowData((prev) => [
              ...prev,
              {
                portfolioName: "New Portfolio",
                ownerName: "Unknown Owner",
              },
            ]);
          },
        },
      ];
    }

    return [
      {
        name: "➕ Add New Portfolio",
        action: () => {
          setRowData((prev) => [
            ...prev,
            {
              portfolioName: "New Portfolio",
              ownerName: "Unknown Owner",
            },
          ]);
        },
      },
      {
        name: "📄 Duplicate Portfolio",
        action: () => {
          const data = node.data;
          if (data) setRowData((prev) => [...prev, { ...data }]);
        },
      },
      {
        name: "🗑️ Delete Portfolio",
        action: () => {
          const data = node.data;
          if (data) setRowData((prev) => prev.filter((r) => r !== data));
        },
      },
    ];
  };
};
