import type { GetContextMenuItemsParams, MenuItemDef } from "ag-grid-community";
import type { LocationRow } from "../types/LocationRow"; // Create this if not yet defined

export const getLocationContextMenuItems = (
  setRowData: React.Dispatch<React.SetStateAction<LocationRow[]>>
) => {
  return (params: GetContextMenuItemsParams<LocationRow>): MenuItemDef[] => {
    const { node } = params;

    if (!node || !node.data) {
      return [
        {
          name: "➕ Add New Location",
          action: () => {
            setRowData((prev) => [
              ...prev,
              {
                name: "New Location",
                address: "",
                country: "",
                city: "",
                zip: "",
              },
            ]);
          },
        },
      ];
    }

    return [
      {
        name: "➕ Add New Location",
        action: () => {
          setRowData((prev) => [
            ...prev,
            {
              name: "New Location",
              address: "",
              country: "",
              city: "",
              zip: "",
            },
          ]);
        },
      },
      {
        name: "📄 Duplicate Location",
        action: () => {
          const data = node.data;
          if (data) setRowData((prev) => [...prev, { ...data }]);
        },
      },
      {
        name: "🗑️ Delete Location",
        action: () => {
          const data = node.data;
          if (data) setRowData((prev) => prev.filter((r) => r !== data));
        },
      },
    ];
  };
};
