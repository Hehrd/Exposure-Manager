import { useEffect } from "react";
import { AgGridReact } from "ag-grid-react";

export function useClickOutsideToStopEditing(gridRef: React.RefObject<AgGridReact<any>>) {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const gridWrapper = document.getElementById("custom-grid-wrapper");
      const isInGrid = gridWrapper?.contains(target);
      const isCell = target.closest(".ag-cell");
      const isRow = target.closest(".ag-row");

      const isBlankGridSpace =
        isInGrid &&
        !isCell &&
        !isRow &&
        target.closest(".ag-center-cols-viewport");

      const isOutsideGrid = !isInGrid;

      if (isOutsideGrid || isBlankGridSpace) {
        gridRef.current?.api.stopEditing();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [gridRef]);
}
