import * as cdk from 'aws-cdk-lib';
import { SampleCdkAppStack } from './stack/sample-cdk-app-stack';

const app = new cdk.App();
new SampleCdkAppStack(app, 'SampleCdkAppStack', {
  env: {
    account: process.env.CDK_TARGET_ACCOUNT,
    region: process.env.CDK_TARGET_REGION,
  },
});
