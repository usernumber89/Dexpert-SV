type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  [key: string]: unknown;
}

function formatLog(entry: LogEntry): string {
  return JSON.stringify(entry);
}

function sendToServer(entry: LogEntry) {
  if (process.env.NODE_ENV === "production") {
    // Could be extended to send to a logging service (Logtail, Axiom, etc.)
    console.log(formatLog(entry));
  } else {
    const prefix = `[${entry.level.toUpperCase()}]`;
    const color =
      entry.level === "error"
        ? "\x1b[31m"
        : entry.level === "warn"
          ? "\x1b[33m"
          : "\x1b[36m";
    console.log(`${color}${prefix}\x1b[0m`, entry.message, ...Object.entries(entry).filter(([k]) => !["level", "message", "timestamp"].includes(k)).map(([k, v]) => ({ [k]: v })));
  }
}

export function createLogger(context: string) {
  function log(level: LogLevel, message: string, extra?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      ...extra,
    };
    sendToServer(entry);
  }

  return {
    info: (msg: string, extra?: Record<string, unknown>) => log("info", msg, extra),
    warn: (msg: string, extra?: Record<string, unknown>) => log("warn", msg, extra),
    error: (msg: string, extra?: Record<string, unknown>) => log("error", msg, extra),
  };
}
