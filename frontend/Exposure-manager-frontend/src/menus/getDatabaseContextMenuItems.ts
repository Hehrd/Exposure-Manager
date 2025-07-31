import type {
  GridApi,
  GetContextMenuItemsParams,
  MenuItemDef,
} from "ag-grid-community";
import type { DatabaseRow } from "../types/DatabaseRow";
import { toast } from "react-toastify";

export const getDatabaseContextMenuItems = (
  gridApi: GridApi<DatabaseRow>,
  currentUsername: string,
  createdRef: React.RefObject<DatabaseRow[]>,
  deletedRef: React.RefObject<DatabaseRow[]>
) => (params: GetContextMenuItemsParams<DatabaseRow>): MenuItemDef[] => {
  const d = params.node?.data;
  const genTempId = () =>
    `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  const addRow = () => {
    const newRow: DatabaseRow = {
      tempId: genTempId(),
      databaseName: "NewDatabase",
      allowedRoles: "",
      ownerName: currentUsername,
      _isNew: true,
      _originalAllowedRoles: "",
    };
    createdRef.current.unshift(newRow);
    gridApi.applyServerSideTransaction({ add: [newRow], addIndex: 0 });
    setTimeout(() => {
      const node = gridApi.getRowNode(newRow.tempId!);
      if (node) {
        gridApi.startEditingCell({
          rowIndex: node.rowIndex!,
          colKey: "databaseName",
        });
      }
    }, 0);
    toast.success("New database added at top");
  };

  const duplicateRow = () => {
    if (!d) return;
    const dup: DatabaseRow = {
      ...d,
      tempId: genTempId(),
      id: undefined,
      _isNew: true,
      _originalAllowedRoles: d.allowedRoles,
    };
    createdRef.current.unshift(dup);
    gridApi.applyServerSideTransaction({ add: [dup], addIndex: 0 });
    setTimeout(() => {
      const node = gridApi.getRowNode(dup.tempId!);
      if (node) {
        gridApi.startEditingCell({
          rowIndex: node.rowIndex!,
          colKey: "databaseName",
        });
      }
    }, 0);
    toast.success("Database duplicated at top");
  };

  const deleteRow = () => {
    if (!d) return;
    if (d.id) {
      deletedRef.current.push(d);
    } else {
      createdRef.current = createdRef.current.filter(
        r => r.tempId !== d.tempId
      );
    }
    gridApi.applyServerSideTransaction({ remove: [d] });
    toast.info("Database removed");
  };

  if (!d) {
    return [{ name: "➕ Add Database", action: addRow }];
  }
  return [
    { name: "➕ Add Database", action: addRow },
    { name: "📄 Duplicate Database", action: duplicateRow },
    { name: "🗑️ Delete Database", action: deleteRow },
  ];
};
