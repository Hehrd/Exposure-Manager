export interface LocationRow {
  id?: number;
  name: string;
  address: string;
  country: string;
  city: string;
  zip: string;
  accountId?: number;
  _isNew?: boolean;
  _isDeleted?: boolean;
  _originalName?: string;
}