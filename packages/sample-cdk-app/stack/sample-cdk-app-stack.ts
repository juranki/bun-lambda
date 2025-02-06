import { BunFunction } from 'bun-lambda-construct';
import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import { join } from 'node:path';
import { Architecture, FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';

export class SampleCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const arm = new BunFunction(this, 'handler-arm', {
      entry: join(__dirname, 'sample-cdk-app-stack.handler.ts'),
      architecture: Architecture.ARM_64,
    });

    const x86 = new BunFunction(this, 'handler-x86', {
      entry: join(__dirname, 'sample-cdk-app-stack.handler.ts'),
    });

    arm.function.addFunctionUrl({ authType: FunctionUrlAuthType.NONE });
    x86.function.addFunctionUrl({ authType: FunctionUrlAuthType.NONE });
  }
}
