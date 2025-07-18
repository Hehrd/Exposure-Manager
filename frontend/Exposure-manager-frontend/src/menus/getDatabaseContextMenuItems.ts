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
            setRowData((prev) => [
              ...(prev || []),
              {
                ...data,
                _isNew: true,
                _originalName: undefined, // or `NewDatabaseName-${Date.now()}`
              },
            ]);
          }
        },
      },    
      {
        name: "🗑️ Delete Database",
        action: () => {
          const data = node.data;
          if (data) {
            setRowData((prev) => {
              const updated = (prev || []).map((row) =>
                row._originalName === data._originalName
                  ? { ...row, _isDeleted: true }
                  : row
              );
              console.log("✅ Updated rowData after delete:", updated);
              return updated;
            });

            console.log("after set row data:", data);


          }
        },
      }
    ];
  };
};
