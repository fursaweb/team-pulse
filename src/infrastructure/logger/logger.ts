enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
}

class Logger {
  private format(
    level: LogLevel,
    context: string,
    message: string,
    meta?: Record<string, unknown>,
  ): string {
    const date = new Date().toISOString();

    if (meta) {
      return `${date} ${level} [${context}] ${message} ${JSON.stringify(meta)}`;
    } else {
      return `${date} ${level} [${context}] ${message}`;
    }
  }

  info(context: string, message: string, meta?: Record<string, unknown>) {
    console.log(this.format(LogLevel.INFO, context, message, meta));
  }

  warn(context: string, message: string, meta?: Record<string, unknown>) {
    console.warn(this.format(LogLevel.WARN, context, message, meta));
  }

  error(context: string, message: string, meta?: Record<string, unknown>) {
    console.error(this.format(LogLevel.WARN, context, message, meta));
  }

  debug(context: string, message: string, meta?: Record<string, unknown>) {
    console.debug(this.format(LogLevel.DEBUG, context, message, meta));
  }
}

export const logger = new Logger();
