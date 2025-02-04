# Bun Lambda Construct for AWS CDK

This project provides a custom AWS CDK construct for creating Lambda functions using the Bun runtime.
It simplifies the process of deploying Bun-based serverless applications on AWS.

## Repository Structure

```
.
└── packages
    └── bun-lambda-construct
        ├── construct
        │   └── index.ts
        ├── index.ts
        ├── package.json
        ├── README.md
        └── tsconfig.json
```

- `construct/index.ts`: Contains the core implementation of the `BunFunction` construct.
- `index.ts`: Entry point of the package, re-exporting the construct.
- `package.json`: Defines the package dependencies and metadata.
- `tsconfig.json`: TypeScript configuration for the project.

## Usage Instructions

### Installation
To install the package in your project:

```bash
bun install bun-lambda-construct
```

### Getting Started

1. Import the `BunFunction` construct in your CDK stack:

    ```typescript
    import { BunFunction } from 'bun-lambda-construct';
    ```

1. Create a new Bun Lambda function in your stack:

    ```typescript
    const bunFunction = new BunFunction(this, 'MyBunFunction', {
      entry: 'path/to/your/bun/app.ts',
      // Other Lambda function options
    });
    ```

### Configuration Options

The `BunFunction` construct accepts all standard Lambda function options, plus:

- `entry`: (string) The path to your Bun application's entry point file.

### Integration Example

Here's a complete example of how to use the `BunFunction` construct in a CDK stack:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BunFunction } from 'bun-lambda-construct';

export class MyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bunLambda = new BunFunction(this, 'BunLambda', {
      entry: 'src/index.ts',
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      environment: {
        NODE_ENV: 'production',
      },
    });

    // Use the Lambda function in other constructs
    new cdk.aws_apigateway.LambdaRestApi(this, 'BunApi', {
      handler: bunLambda.function,
    });
  }
}
```
