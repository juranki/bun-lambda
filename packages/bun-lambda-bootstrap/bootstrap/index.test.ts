import { expect, test, mock, beforeEach, afterEach, describe, it } from "bun:test";
import { startRuntime } from "./index";
import type { Context } from "aws-lambda";

describe("startRuntime", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
    process.env.AWS_LAMBDA_RUNTIME_API = "localhost:8080";
    process.env.AWS_LAMBDA_FUNCTION_NAME = "test-function";
    process.env.AWS_LAMBDA_FUNCTION_VERSION = "1";
    process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = "128";
    process.env.AWS_LAMBDA_LOG_GROUP_NAME = "test-log-group";
    process.env.AWS_LAMBDA_LOG_STREAM_NAME = "test-log-stream";
  });

  afterEach(() => {
    // Restore process.env after each test
    process.env = originalEnv;
  });

  it("throws error when AWS_LAMBDA_RUNTIME_API is not set", async () => {
    // biome-ignore lint/performance/noDelete: <explanation>
    delete process.env.AWS_LAMBDA_RUNTIME_API;
    
    await expect(startRuntime(async () => {})).rejects.toThrow(
      "AWS_LAMBDA_RUNTIME_API env var not set"
    );
  });

  it("successfully processes event and returns response", async () => {
    const mockEvent = { key: "value" };
    const mockResult = { result: "success" };
    const mockRequestId = "test-request-id";
    
    // Mock fetch for /next endpoint
    // @ts-ignore
    global.fetch = mock((url) => {
      if (url.endsWith("/next")) {
        return Promise.resolve({
          json: () => Promise.resolve(mockEvent),
          headers: new Headers({
            "lambda-runtime-aws-request-id": mockRequestId,
            "lambda-runtime-trace-id": "test-trace-id",
            "lambda-runtime-deadline-ms": (Date.now() + 1000).toString(),
            "lambda-runtime-invoked-function-arn": "test:arn",
          }),
        });
      }
      // Mock fetch for /response endpoint
      return Promise.resolve({
        json: () => Promise.resolve({}),
        headers: new Headers({
          "lambda-runtime-aws-request-id": mockRequestId,
        }),
      });
    });

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const handler = mock(async (event: any, context: Context) => {
      expect(event).toEqual(mockEvent);
      expect(context.awsRequestId).toBe(mockRequestId);
      expect(context.functionName).toBe("test-function");
      return mockResult;
    });

    // We need to terminate the infinite loop after first iteration
    setTimeout(() => process.exit(), 100);
    
    await startRuntime(handler);
    
    expect(handler).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("handles errors and calls error endpoint", async () => {
    const mockError = new Error("Test error");
    
    // Mock fetch for /next endpoint
    // @ts-ignore
    global.fetch = mock((url) => {
      if (url.endsWith("/next")) {
        return Promise.resolve({
          json: () => Promise.resolve({}),
          headers: new Headers({
            "lambda-runtime-aws-request-id": "error-request-id",
          }),
        });
      }
      // Mock fetch for /error endpoint
      return Promise.resolve({});
    });

    const handler = mock(async () => {
      throw mockError;
    });

    // We need to terminate the infinite loop after first iteration
    setTimeout(() => process.exit(), 100);
    
    await startRuntime(handler);
    
    expect(handler).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledTimes(2);
    // Verify the second fetch call was to the error endpoint
    expect(fetch).toHaveBeenLastCalledWith(
      expect.stringContaining("/error"),
      expect.any(Object)
    );
  });
});