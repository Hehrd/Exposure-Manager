export interface PolicyRow {
  id?: number;
  name: string;
  startDate: string;     // Format: "YYYY-MM-DD"
  expirationDate: string;
  coverage: number;
  perilType: string;
  _isNew?: boolean;
  _isDeleted?: boolean;
  _originalName?: string;
}
