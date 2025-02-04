import { BunFunction } from 'bun-lambda-construct';
import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import { join } from 'node:path';
import { Architecture } from 'aws-cdk-lib/aws-lambda';

export class SampleCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new BunFunction(this, 'handler-arm', {
      entry: join(__dirname, 'sample-cdk-app-stack.handler.ts'),
      architecture: Architecture.ARM_64,
    });

    new BunFunction(this, 'handler-x86', {
      entry: join(__dirname, 'sample-cdk-app-stack.handler.ts'),
    });
  }
}
