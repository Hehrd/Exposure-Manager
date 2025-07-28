// src/types/AccountRow.ts
export interface AccountRow {
  id?: number;
  tempId?: string;
  accountName: string;
  ownerName: string;
  _isNew?: boolean;
  _isDeleted?: boolean;
  _originalId?: number;
  _originalName?: string;
}
