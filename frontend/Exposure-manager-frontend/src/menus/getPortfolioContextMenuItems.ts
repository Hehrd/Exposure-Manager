// getPortfolioContextMenuItems.ts
import type { GridApi, GetContextMenuItemsParams, MenuItemDef } from "ag-grid-community";
import type { PortfolioRow } from "../types/PortfolioRow";

export const getPortfolioContextMenuItems = (
  gridApi: GridApi<PortfolioRow>,
  currentUsername: string,
  createdRef: React.RefObject<PortfolioRow[]>,
  updatedRef: React.RefObject<PortfolioRow[]>,
  deletedRef: React.RefObject<PortfolioRow[]>
) => (params: GetContextMenuItemsParams<PortfolioRow>): MenuItemDef[] => {
  const d = params.node?.data;

  const genTempId = () =>
    `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  const addRow = () => {
    const newRow: PortfolioRow = {
      tempId: genTempId(),
      portfolioName: "NewPortfolio",
      ownerName: currentUsername,
      _isNew: true,
    };

    createdRef.current.push(newRow);
    gridApi.applyServerSideTransaction({ add: [newRow] });

    setTimeout(() => {
      const rowNode = gridApi.getRowNode(newRow.tempId!);
      if (rowNode) {
        gridApi.startEditingCell({
          rowIndex: rowNode.rowIndex!,
          colKey: "portfolioName",
        });
      }
    }, 0);
  };

  const duplicateRow = () => {
    if (d) {
      const dup: PortfolioRow = {
        ...d,
        tempId: genTempId(),
        id: undefined,
        _isNew: true,
      };

      createdRef.current.push(dup);
      gridApi.applyServerSideTransaction({ add: [dup] });

      setTimeout(() => {
        const rowNode = gridApi.getRowNode(dup.tempId!);
        if (rowNode) {
          gridApi.startEditingCell({
            rowIndex: rowNode.rowIndex!,
            colKey: "portfolioName",
          });
        }
      }, 0);
    }
  };

  const deleteRow = () => {
    if (d) {
      if (d.id) {
        deletedRef.current.push(d);
      } else {
        createdRef.current = {
          current: createdRef.current.filter((r) => r.tempId !== d.tempId),
        } as any;
      }
      gridApi.applyServerSideTransaction({ remove: [d] });
    }
  };

  if (!d) {
    return [{ name: "➕ Add Portfolio", action: addRow }];
  }

  return [
    { name: "➕ Add Portfolio", action: addRow },
    { name: "📄 Duplicate Portfolio", action: duplicateRow },
    { name: "🗑️ Delete Portfolio", action: deleteRow },
  ];
};
