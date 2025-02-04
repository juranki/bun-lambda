import type { Context } from 'aws-lambda';

/**
 * startRuntime is the entrypoint for Bun lambda runtime
 *
 * runtime is an infinite loop with following steps
 * - fetch next lambda invocation
 * - construct lambda invocation context from response headers and environment variables
 * - parse lambda invocation event from request body
 * - try to
 *   - invoke lambda handler with event and context
 *   - serialize lambda handler response to response body and headers
 *   - send response to lambda runtime
 * - on error
 *   - serialize error to response body and headers
 *   - send response to lambda runtime
 * - repeat
 *
 * see https://docs.aws.amazon.com/lambda/latest/dg/runtimes-custom.html for more details
 */
export async function startRuntime(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  handler: (event: any, context: Context) => Promise<any>,
): Promise<void> {
  // AWS_LAMBDA_RUNTIME_API – The host and port of the runtime API.
  if (!process.env.AWS_LAMBDA_RUNTIME_API) {
    throw new Error('AWS_LAMBDA_RUNTIME_API env var not set');
  }
  const runtimeApiEndpoint = `http://${process.env.AWS_LAMBDA_RUNTIME_API}/2018-06-01/runtime/invocation`;
  const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME ?? 'unknown';
  const functionVersion = process.env.AWS_LAMBDA_FUNCTION_VERSION ?? 'unknown';
  const memoryLimitInMB = process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE ?? '0';
  const logGroupName = process.env.AWS_LAMBDA_LOG_GROUP_NAME ?? 'unknown';
  const logStreamName = process.env.AWS_LAMBDA_LOG_STREAM_NAME ?? 'unknown';

  while (true) {
    // Call the next invocation API to get the next event.
    // The response body contains the event data. Response headers contain the request ID and other information.
    const next = await fetch(`${runtimeApiEndpoint}/next`);

    // Get the X-Ray tracing header from the Lambda-Runtime-Trace-Id header in the API response.
    // Set the _X_AMZN_TRACE_ID environment variable locally with the same value.
    // The X-Ray SDK uses this value to connect trace data between services
    const traceId = next.headers.get('lambda-runtime-trace-id');
    if (traceId) {
      process.env._X_AMZN_TRACE_ID = traceId;
    }
    const awsRequestId =
      next.headers.get('lambda-runtime-aws-request-id') ?? '';
    const runtimeDeadlineMs = Number(
      next.headers.get('lambda-runtime-deadline-ms'),
    );

    // Create an object with context information from environment variables and headers in the API response.
    const context: Context = {
      awsRequestId,
      invokedFunctionArn:
        next.headers.get('lambda-runtime-invoked-function-arn') ?? '',
      logGroupName,
      logStreamName,
      functionName,
      functionVersion,
      memoryLimitInMB,
      getRemainingTimeInMillis: () => {
        return runtimeDeadlineMs - Date.now();
      },
      identity: jsonFromHeader(next.headers, 'lambda-runtime-cognito-identity'),
      clientContext: jsonFromHeader(
        next.headers,
        'lambda-runtime-client-context',
      ),
      done: () => {},
      fail: () => {},
      succeed: () => {},
      callbackWaitsForEmptyEventLoop: false,
    };

    try {
      // Pass the event and context object to the handler.
      const event = await next.json();
      const result = await handler(event, context);

      //  Call the invocation response API to post the response from the handler.
      await fetch(`${runtimeApiEndpoint}/${awsRequestId}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result),
      });
    } catch (error) {
      log('ERROR', 'Failed to handle event', error);

      await fetch(`${runtimeApiEndpoint}/${awsRequestId}/error`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(extractErrorInfo(error)),
      });
    }
  }
}

interface ErrorInfo {
  errorMessage: string;
  errorType: string;
  stackTrace: string[] | undefined;
}
function extractErrorInfo(error: unknown): ErrorInfo {
  return error instanceof Error
    ? {
        errorType: error.name,
        errorMessage: error.message,
        stackTrace: error.stack ? error.stack.split('\n') : undefined,
      }
    : {
        errorType: 'Error',
        errorMessage: String(error),
        stackTrace: undefined,
      };
}

type LogLevel = 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function log(level: LogLevel, message: string, ...args: any) {
  console.log(`[${level}] ${message}`, ...args);
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function jsonFromHeader(headers: Headers, headerName: string): any | undefined {
  const headerValue = headers.get(headerName);
  if (!headerValue || headerValue.trim().length === 0) {
    return undefined;
  }
  try {
    return JSON.parse(headerValue);
  } catch (error) {
    log('ERROR', `Failed to parse header ${headerName} as JSON`, error);
  }
}
