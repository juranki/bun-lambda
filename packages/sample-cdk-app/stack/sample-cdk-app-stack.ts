import { BunDistribution, BunFunction } from 'bun-cdk-constructs';
import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import { join } from 'node:path';
import { Architecture, FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { FunctionUrlOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';

export class SampleCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const arm = new BunFunction(this, 'handler-arm', {
      entry: join(__dirname, 'sample-cdk-app-stack.handler.ts'),
      architecture: Architecture.ARM_64,
    });

    const funUrl = arm.addFunctionUrl({ authType: FunctionUrlAuthType.NONE });

    const distribution = new BunDistribution(this, 'distribution', {
      entries: [join(__dirname, '..', 'site', 'index.html')],
    });

    distribution.addBehavior('api/*', new FunctionUrlOrigin(funUrl));
  }
}
