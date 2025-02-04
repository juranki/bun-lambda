# Bun Lambda Bootstrap: Streamlined AWS Lambda Runtime for Bun

The Bun Lambda Bootstrap is a lightweight and efficient runtime package designed to enable AWS Lambda functions to run using the Bun JavaScript runtime. This package provides a seamless integration between Bun's performance capabilities and AWS Lambda's serverless architecture.

By leveraging the speed and efficiency of Bun, this bootstrap allows developers to create high-performance Lambda functions with reduced cold start times and improved overall execution speed. The package handles the necessary runtime interactions with AWS Lambda, allowing developers to focus on writing their function logic without worrying about the underlying Lambda runtime implementation details.

## Repository Structure

```
.
└── packages
    └── bun-lambda-bootstrap
        ├── bootstrap
        │   ├── index.test.ts
        │   └── index.ts
        ├── index.ts
        ├── package.json
        ├── README.md
        └── tsconfig.json
```

### Key Files:
- `packages/bun-lambda-bootstrap/bootstrap/index.ts`: Core implementation of the Bun Lambda runtime.
- `packages/bun-lambda-bootstrap/index.ts`: Entry point for the package, re-exporting the bootstrap functionality.
- `packages/bun-lambda-bootstrap/package.json`: Package configuration and dependencies.
- `packages/bun-lambda-bootstrap/tsconfig.json`: TypeScript configuration for the project.

## Usage Instructions

### Installation

Prerequisites:
- Bun runtime (latest version recommended)

To install the package in your project:

```bash
bun add bun-lambda-boostrap
```

### Getting Started

1. Import the `startRuntime` function in your Lambda handler file:
    ```typescript
    import { startRuntime } from 'bun-lambda-boostrap';
    import type { Context } from 'aws-lambda';

    async function handler(event: any, context: Context) {
    // Your Lambda function logic here
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Hello from Bun Lambda!' }),
    };
    }

    startRuntime(handler);
    ```
1. Build the module into `bootstrap` executable and deploy using `PROVIDED_AL2023` runtime 

### Testing

To run tests for the Bun Lambda Bootstrap:

```bash
bun test
```

The test suite covers various scenarios, including error handling and successful event processing.

### Troubleshooting

#### Common Issues

1. **AWS_LAMBDA_RUNTIME_API not set**
   - Problem: The Lambda function fails to start with an error message "AWS_LAMBDA_RUNTIME_API env var not set".
   - Solution: This error occurs when running the function outside of the AWS Lambda environment. Ensure you're deploying the function to AWS Lambda and not running it locally without proper environment setup.

2. **Type errors when using the handler function**
   - Problem: TypeScript compilation errors related to event or context types.
   - Solution: Import the correct types from the `aws-lambda` package:
     ```typescript
     import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
     ```

#### Debugging

To enable verbose logging:

1. Set the `DEBUG` environment variable to `true` in your Lambda function configuration.
2. Add the following code at the beginning of your handler:

```typescript
if (process.env.DEBUG === 'true') {
  console.log = console.debug;
}
```

This will output additional information to CloudWatch logs, helping diagnose issues.

#### Performance Optimization

- Monitor the `getRemainingTimeInMillis()` value in the context object to ensure your function completes within the allocated time.

## Data Flow

The Bun Lambda Bootstrap manages the data flow between AWS Lambda and your handler function. Here's an overview of how data flows through the system:

1. AWS Lambda invokes the runtime
2. The runtime fetches the next event from the Lambda Runtime API
3. Event data and context are passed to your handler function
4. Your handler processes the event and returns a result
5. The runtime sends the result back to the Lambda Runtime API
6. The process repeats for subsequent invocations

The bootstrap handles error scenarios by catching exceptions, formatting error information, and sending it back to the Lambda runtime API.