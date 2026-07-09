const SUSPICIOUS_PATTERNS = [
  /ignora\s*(las|tus)?\s*instrucciones/i,
  /ignore\s*(all\s*)?(previous\s*)?instructions/i,
  /olvida\s*todo/i,
  /forget\s*(all\s*)?(previous\s*)?instructions/i,
  /eres\s*(un|una)\s*(asistente|ai|bot)/i,
  /you\s+are\s+(an?\s+)?(ai|assistant|bot)/i,
  /system\s*prompt/i,
  /prompt\s*injection/i,
  /dilo\s*en\s*(inglés|frances|aleman)/i,
];

export function sanitizePrompt(input: unknown): string {
  if (typeof input !== "string") return "";

  const trimmed = input.trim();
  if (!trimmed || trimmed.length > 5000) return "";

  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return "";
    }
  }

  return trimmed.slice(0, 5000);
}
