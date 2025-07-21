import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { ColDef } from "ag-grid-community";
import {
  AllCommunityModule,
  ModuleRegistry,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "../styles/EditableTable.css";

import AppWrapper from "../components/AppWrapper";
import TableToolbar from "../components/TableToolbar";
import { toast } from "react-toastify";
import { useClickOutsideToStopEditing } from "../hooks/useClickOutsideToStopEditing";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { getAccountContextMenuItems } from "../menus/getAccountContextMenuItems";
import type { AccountRow } from "../types/AccountRow";

ModuleRegistry.registerModules([AllCommunityModule]);

const AccountLinkRenderer = ({ value }: { value: string }) => {
  const { databaseName, portfolioName, portfolioId } = useParams();
  return (
    <Link
      to={`/databases/${encodeURIComponent(databaseName!)}/portfolios/${encodeURIComponent(
        portfolioName!
      )}/${encodeURIComponent(portfolioId!)}/accounts/${encodeURIComponent(value)}`}
      className="text-blue-600 dark:text-blue-400 hover:underline"
    >
      {value}
    </Link>
  );
};

const AccountPage = () => {
  const gridRef = useRef<AgGridReact<AccountRow>>(null);
  const { portfolioId, databaseName, portfolioName } = useParams();
  const hasFetchedOnMount = useRef(false);

  const [rowData, setRowData] = useState<AccountRow[] | null>(null);

  const [colDefs] = useState<ColDef<AccountRow>[]>([
    {
      field: "accountName",
      headerName: "Account Name",
      flex: 1,
      editable: true,
      cellRenderer: AccountLinkRenderer,
    },
    {
      field: "ownerName",
      headerName: "Owner Name",
      flex: 1,
      editable: true,
    },
  ]);

  const defaultColDef = useMemo<ColDef>(() => ({
    filter: true,
    editable: true,
    resizable: true,
    minWidth: 100,
  }), []);

  useClickOutsideToStopEditing(gridRef);

  const fetchAccounts = async () => {
    console.log("📡 Fetching accounts...");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/accounts?portfolioId=${portfolioId}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error("Failed to fetch accounts");

      const data = await res.json();
      console.log("✅ Fetched accounts:", data.content);

      setRowData(
        (data.content || []).map((acc: any) => ({
          accountName: acc.name,
          ownerName: acc.ownerName,
          _originalName: acc.name,
        }))
      );
    } catch (err) {
      console.error("❌ Error fetching accounts:", err);
      toast.error("Failed to load accounts");
      setRowData([]);
    }
  };

  useEffect(() => {
    if (!hasFetchedOnMount.current) {
      console.log("🚀 Initial fetch triggered");
      fetchAccounts();
      hasFetchedOnMount.current = true;
    }
  }, []);

  const handleSaveChanges = async () => {
    gridRef.current?.api.stopEditing();
    const allData = rowData ?? [];
    console.log("📝 All row data:", allData);

    const newRows = allData.filter((row) => row._isNew);
    const editedRows = allData.filter(
      (row) =>
        !row._isNew &&
        row._originalName &&
        row.accountName !== row._originalName
    );
    const deletedRows = allData.filter((row) => row._isDeleted && !row._isNew);

    const createPayload = newRows.map((row) => ({
      name: row.accountName,
      portfolioId,
    }));

    const updatePayload = editedRows.map((row) => ({
      oldName: row._originalName!,
      newName: row.accountName,
      portfolioId,
    }));

    const deletePayload = deletedRows.map((row) => row.accountName);

    console.log("🆕 Create payload:", createPayload);
    console.log("✏️ Update payload:", updatePayload);
    console.log("🗑️ Delete payload:", deletePayload);

    try {
      if (createPayload.length > 0) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/accounts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(createPayload),
        });
        toast.success("Created accounts");
      }

      if (updatePayload.length > 0) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/accounts`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updatePayload),
        });
        toast.success("Updated accounts");
      }

      if (deletePayload.length > 0) {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/accounts`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(deletePayload),
        });
        toast.success("Deleted accounts");
      }

      console.log("💾 Save complete. Refreshing...");
      fetchAccounts();
      toast.success("Account table saved");
    } catch (err) {
      console.error("❌ Error saving changes:", err);
      toast.error("Save failed");
    }
  };

  const handleRefresh = () => {
    gridRef.current?.api.stopEditing();
    console.log("🔄 Manual refresh");
    fetchAccounts();
    toast.info("Account table refreshed");
  };

  useKeyboardShortcuts(handleSaveChanges, handleRefresh);

  return (
    <AppWrapper>
      <TableToolbar
        tableName="Accounts"
        onSave={handleSaveChanges}
        onRefresh={handleRefresh}
      />

      <div id="custom-grid-wrapper" style={{ width: "100%", height: "85vh" }}>
        <AgGridReact
          ref={gridRef}
          className="ag-theme-quartz"
          rowData={(rowData ?? []).filter((row) => !row._isDeleted)}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          columnHoverHighlight={false}
          suppressRowHoverHighlight={true}
          getContextMenuItems={getAccountContextMenuItems(setRowData, "Unknown")}
          overlayLoadingTemplate={
            '<span class="ag-overlay-loading-center">Loading accounts...</span>'
          }
        />
      </div>
    </AppWrapper>
  );
};

export default AccountPage;
