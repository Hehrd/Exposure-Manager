import React from "react";

interface TableToolbarProps {
  tableName: string;
  onSave: () => void;
  onRefresh: () => void;
}

export default function TableToolbar({
  tableName,
  onSave,
  onRefresh,
}: TableToolbarProps) {
  return (
         <div className="px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-[var(--primary-color)] ">
          {tableName}
        </h1>
        
          <button
            onClick={onRefresh}
            className="px-4 w-1/4 py-2 bg-[var(--primary-color)] text-[var(--text-color)] rounded hover:bg-blue-700 transition"
          >
            Refresh
          </button>
          <button
            onClick={onSave}
            className="px-4 w-1/4 py-2 bg-[var(--primary-color)] text-[var(--text-color)] rounded hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        
      </div>
  );
}
