export interface AccountRow {
  id?: number;
  accountName: string;
  ownerName: string;
  _isNew?: boolean;
  _isDeleted?: boolean;
  _originalId?: number;
  _originalName?: string;
}
