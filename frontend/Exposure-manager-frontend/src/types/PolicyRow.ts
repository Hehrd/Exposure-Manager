// src/types/PolicyRow.ts
export interface PolicyRow {
  id?: number;
  tempId?: string;
  name: string;
  startDate: Date;
  expirationDate: Date;
  coverage: number;
  perilType: string;
  accountId?: number;
  _isNew?: boolean;
  _isDeleted?: boolean;
  _originalName?: string;
  _originalStartDate?: string;
  _originalExpirationDate?: string;
  _originalCoverage?: number;
  _originalPerilType?: string;
}
