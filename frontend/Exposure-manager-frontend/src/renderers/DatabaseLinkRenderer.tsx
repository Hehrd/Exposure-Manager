// src/renderers/DatabaseLinkRenderer.tsx
import React from "react";
import { Link } from "react-router-dom";
import type { ICellRendererParams } from "ag-grid-community";
import type { DatabaseRow } from "../types/DatabaseRow";

export const DatabaseLinkRenderer: React.FC<ICellRendererParams<DatabaseRow>> = ({ value, data }) => {
  const isNew = data?._isNew;
  const baseClass = isNew ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400";
  return (
    <Link
      to={`/databases/${encodeURIComponent(value)}`}
      className={`${baseClass} hover:underline`}
    >
      {value}
    </Link>
  );
};