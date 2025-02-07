// TODO: implement construct for bun static site

import {
  Distribution,
  PriceClass,
  S3OriginAccessControl,
  type BehaviorOptions,
  type DistributionProps,
} from 'aws-cdk-lib/aws-cloudfront';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';
import { sanitizePath } from '../util/sanitize-path';
import { join } from 'node:path';
import { Stack } from 'aws-cdk-lib';
import { execSync } from 'node:child_process';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';

interface BunDistributionProps {
  entries: string[];
  distribution?: Omit<DistributionProps, 'defaultBehavior'>
  defaultBehaviorOptions?: Omit<BehaviorOptions, 'origin'>
}

export class BunDistribution extends Distribution {
  constructor(scope: Construct, id: string, props: BunDistributionProps) {
    const outDir = sanitizePath(
      join('.', 'build', Stack.of(scope).stackName, scope.node.addr, id),
    );
    execSync(`bun build ${props.entries.join(' ')} --minify --outdir=${outDir}`)
    const bucket = new Bucket(scope, 'static', {
      enforceSSL: true,
    });
    const originAccessControl = new S3OriginAccessControl(scope, 'oac');
    super(scope, id, {
      ...props.distribution,
      defaultBehavior: {
        ...props.defaultBehaviorOptions,
        origin: S3BucketOrigin.withOriginAccessControl(bucket, {
          originAccessControl,
        }),
      },
    });
    new BucketDeployment(scope, 'deployment', {
      destinationBucket: bucket,
      sources: [Source.asset(outDir)],
      distribution: this,
      distributionPaths: ['/*'],
    })
  }
}
