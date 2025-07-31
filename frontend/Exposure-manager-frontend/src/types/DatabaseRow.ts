export interface DatabaseRow {
  id?: number;
  tempId?: string;

  databaseName: string;
  allowedRoles: string;
  ownerName: string;
  _originalId?: number;
  _originalName?: string;
  _originalAllowedRoles?: string;

  _isNew?: boolean;
  _isDeleted?: boolean;
}
