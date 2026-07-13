import { ExportError, ERROR } from "./errors";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateId(raw: string): string {
  if (!UUID_RE.test(raw)) {
    throw new ExportError("Invalid student ID format", ERROR.INVALID_ID, 400);
  }
  return raw;
}
