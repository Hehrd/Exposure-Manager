import React from "react";

interface TableToolbarProps {
  tableName: string;
  onSave: () => void;
  onRefresh: () => void;
}
import refreshIcon from '../assets/refresh.svg';
import saveIcon from '../assets/save.svg'; 

export default function TableToolbar({
  tableName,
  onSave,
  onRefresh,
}: TableToolbarProps) {
  return (
         <div className="px-6 py-4 flex justify-between items-center h-10%">
        <h1 className="text-xl font-semibold text-[var(--primary-color)] ">
          {tableName}
        </h1>
        
        <button
          onClick={onRefresh}
          className="px-4 py-2 flex items-center justify-center gap-2 w-1/4 bg-[var(--primary-color)] text-[var(--text-color)] rounded hover:bg-blue-700 transition"
        >
          <img src={refreshIcon} alt="Refresh" className="w-4 h-4" />
          Refresh
        </button>

        <button
          onClick={onSave}
          className="px-4 py-2 flex items-center justify-center gap-2 w-1/4 bg-[var(--primary-color)] text-[var(--text-color)] rounded hover:bg-blue-700 transition"
        >
          <img src={saveIcon} alt="Save" className="w-4 h-4" />
          Save Changes
        </button>

        
      </div>
  );
}
