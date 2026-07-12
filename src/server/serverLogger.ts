type ServerLogContext = Record<string, string | number | boolean | null | undefined>;

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  return {
    message: String(error),
  };
}

export function logServerWarning(message: string, context?: ServerLogContext): void {
  console.warn(
    '[server-warning]',
    JSON.stringify({
      message,
      context: context ?? {},
    }),
  );
}

export function logServerError(message: string, error: unknown, context?: ServerLogContext): void {
  console.error(
    '[server-error]',
    JSON.stringify({
      message,
      error: serializeError(error),
      context: context ?? {},
    }),
  );
}
