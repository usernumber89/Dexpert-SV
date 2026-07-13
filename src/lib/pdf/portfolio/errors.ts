export const ERROR = {
  INVALID_ID: "INVALID_STUDENT_ID",
  NOT_FOUND: "STUDENT_NOT_FOUND",
  INTERNAL: "INTERNAL_ERROR",
} as const;

export class ExportError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 500,
  ) {
    super(message);
    this.name = "ExportError";
  }
}
