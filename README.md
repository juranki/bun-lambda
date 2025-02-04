# Bun Lambda: AWS Lambda Runtime and CDK Construct for Bun

This project provides a custom AWS Lambda runtime for Bun and a CDK construct to easily deploy Bun-based Lambda functions.

The Bun Lambda project consists of three main packages:

1. `bun-lambda-bootstrap`: A custom AWS Lambda runtime for Bun.
1. `bun-lambda-construct`: A CDK construct for deploying Bun-based Lambda functions.
1. `sample-cdk-app`: A sample CDK application demonstrating the usage of the Bun Lambda construct.

These packages work together to enable developers to write and deploy AWS Lambda functions using Bun, a fast all-in-one JavaScript runtime.

## Repository Structure

```
.
├── packages
│   ├── bun-lambda-bootstrap
│   │   ├── bootstrap
│   │   │   ├── index.test.ts
│   │   │   └── index.ts
│   │   ├── index.ts
│   │   └── package.json
│   ├── bun-lambda-construct
│   │   ├── construct
│   │   │   └── index.ts
│   │   ├── index.ts
│   │   └── package.json
│   └── sample-cdk-app
│       ├── cdk.json
│       ├── index.ts
│       ├── package.json
│       └── stack
│           ├── sample-cdk-app-stack.handler.ts
│           └── sample-cdk-app-stack.ts
├── biome.json
├── package.json
└── tsconfig.json
```

### Key Files:
- `packages/bun-lambda-bootstrap/bootstrap/index.ts`: The main entry point for the Bun Lambda runtime.
- `packages/bun-lambda-construct/construct/index.ts`: The CDK construct for creating Bun Lambda functions.
- `packages/sample-cdk-app/index.ts`: The entry point for the sample CDK application.
- `packages/sample-cdk-app/stack/sample-cdk-app-stack.ts`: The CDK stack definition for the sample application.

## Usage Instructions

### Installation

Prerequisites:
- Bun (latest version)

To install the project dependencies, run the following command in the root directory:

```bash
bun install
```

### Getting Started

Check out the [sample CDK app](packages/sample-cdk-app/README.md)

It creates two Lambda functions in your AWS account, one using ARM64 architecture and another using x86 architecture.

### Creating a Bun Lambda Function

To create a Bun Lambda function in your own CDK stack:

1. Import the `BunFunction` construct:

```typescript
import { BunFunction } from 'bun-lambda-construct';
```

2. Create a new `BunFunction` instance in your stack:

```typescript
new BunFunction(this, 'MyBunFunction', {
  entry: 'path/to/your/handler.ts',
  architecture: Architecture.ARM_64, // Optional: defaults to x86
});
```

### Writing a Lambda Handler

Here's an example of a simple Lambda handler using Bun:

```typescript
import { startRuntime } from 'bun-lambda-boostrap';

async function main() {
  await startRuntime(async (event, context) => {
    console.log('event', JSON.stringify(event, null, 2));
    console.log('context', JSON.stringify(context, null, 2));
    return { message: 'Hello from Bun AWS Lambda!' };
  });
}

if (require.main === module) {
  main().catch(console.error);
}
```
