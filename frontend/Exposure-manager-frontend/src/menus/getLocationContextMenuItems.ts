import type { GetContextMenuItemsParams, MenuItemDef } from "ag-grid-community";
import type { LocationRow } from "../types/LocationRow";

export const getLocationContextMenuItems = (
  setRowData: React.Dispatch<React.SetStateAction<LocationRow[]>>,
  currentUsername: string
) => {
  return (params: GetContextMenuItemsParams<LocationRow>): MenuItemDef[] => {
    const { node } = params;

    const addRow = () => {
      setRowData((prev) => [
        ...(prev || []),
        {
          name: "New Location",
          address: "",
          country: "",
          city: "",
          zip: "",
          _isNew: true,
          _isDeleted: false,
        },
      ]);
      console.log("➕ Added new location row");
    };

    if (!node || !node.data) {
      return [{ name: "➕ Add Location", action: addRow }];
    }

    return [
      { name: "➕ Add Location", action: addRow },
      {
        name: "📄 Duplicate Location",
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
            console.log("📄 Duplicated location:", data.name);
          }
        },
      },
      {
        name: "🗑️ Delete Location",
        action: () => {
          const data = node.data;
          if (data) {
            setRowData((prev) =>
              (prev || []).map((row) =>
                row === data ? { ...row, _isDeleted: true } : row
              )
            );
            console.log("🗑️ Marked location as deleted:", data.name);
          }
        },
      },
    ];
  };
};
