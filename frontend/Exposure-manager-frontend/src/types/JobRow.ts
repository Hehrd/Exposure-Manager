export interface DefaultJobResDTO {
  id: number;
  name: string;
  /** Timestamp in milliseconds when the job started */
  timeStartedMillis: number;
  /** Timestamp in milliseconds when the job finished (null if still in progress) */
  timeFinishedMillis: number | null;
  status: string;
}
