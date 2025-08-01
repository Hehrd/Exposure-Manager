// src/types/LocationRow.ts
export interface LocationRow {
  id?: number;
  tempId?: string;
  name: string;
  address: string;
  country: string;
  city: string;
  zip: number | null;
  accountId?: number;
  _isNew?: boolean;
  _isDeleted?: boolean;
  _originalName?: string;
  _originalAddress?: string;
  _originalCountry?: string;
  _originalCity?: string;
  _originalZip?: number;
}
