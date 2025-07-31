// getPortfolioContextMenuItems.ts
import type { GridApi, GetContextMenuItemsParams, MenuItemDef } from "ag-grid-community";
import type { PortfolioRow } from "../types/PortfolioRow";
import { toast } from "react-toastify";

export const getPortfolioContextMenuItems = (
  gridApi: GridApi<PortfolioRow>,
  currentUsername: string,
  createdRef: React.RefObject<PortfolioRow[]>,
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

    createdRef.current.unshift(newRow);
    gridApi.applyServerSideTransaction({ add: [newRow], addIndex: 0 });

    // start editing the new row immediately
    setTimeout(() => {
      const node = gridApi.getRowNode(newRow.tempId!);
      if (node) {
        gridApi.startEditingCell({
          rowIndex: node.rowIndex!,
          colKey: "portfolioName",
        });
      }
    }, 0);

    toast.success("New portfolio added at top");
  };

  const duplicateRow = () => {
    if (!d) return;
    const dup: PortfolioRow = {
      ...d,
      tempId: genTempId(),
      id: undefined,
      _isNew: true,
    };

    createdRef.current.unshift(dup);
    gridApi.applyServerSideTransaction({ add: [dup], addIndex: 0 });

    setTimeout(() => {
      const node = gridApi.getRowNode(dup.tempId!);
      if (node) {
        gridApi.startEditingCell({
          rowIndex: node.rowIndex!,
          colKey: "portfolioName",
        });
      }
    }, 0);

    toast.success("Portfolio duplicated at top");
  };

  const deleteRow = () => {
    if (!d) return;
    if (d.id) {
      deletedRef.current.push(d);
    } else {
      createdRef.current = createdRef.current.filter(r => r.tempId !== d.tempId);
    }
    gridApi.applyServerSideTransaction({ remove: [d] });
    toast.info("Portfolio removed");
  };

  // when no row is under cursor, only show Add
  if (!d) {
    return [
      { name: "➕ Add Portfolio", action: addRow },
    ];
  }

  return [
    { name: "➕ Add Portfolio", action: addRow },
    { name: "📄 Duplicate Portfolio", action: duplicateRow },
    { name: "🗑️ Delete Portfolio", action: deleteRow },
  ];
};
