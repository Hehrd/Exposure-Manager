import React from "react";
import { Link } from "react-router-dom";

export const DatabaseLinkRenderer = ({ value }: { value: string }) => {
  return (
    <Link
      to={`/databases/${encodeURIComponent(value)}`}
      className="text-blue-600 dark:text-blue-400 hover:underline"
    >
      {value}
    </Link>
  );
};
