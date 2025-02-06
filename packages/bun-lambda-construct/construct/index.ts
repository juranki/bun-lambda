import type { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'node:path';

interface BunFunctionProps extends lambda.FunctionOptions {
  entry: string;
}

export class BunFunction extends lambda.Function {
  constructor(scope: Construct, id: string, props: BunFunctionProps) {
    const buildDir = path.join('.', 'build', Bun.randomUUIDv7());
    const target =
      props.architecture === lambda.Architecture.ARM_64
        ? 'bun-linux-arm64-modern'
        : 'bun-linux-x64-modern';
    super(scope, id, {
      ...props,
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: 'bootstrap', // required, but not used
      code: lambda.Code.fromCustomCommand(buildDir, [
        'bun',
        'build',
        '--compile',
        '--bytecode',
        '--minify',
        '--target',
        target,
        props.entry,
        '--outfile',
        path.join(buildDir, 'bootstrap'),
      ]),
    });
  }
}
