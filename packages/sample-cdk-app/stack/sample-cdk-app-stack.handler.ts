import type { Context } from 'aws-lambda';
import { startRuntime } from 'bun-lambda-boostrap';

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
async function handler(event: any, context: Context) {
  console.log('event', JSON.stringify(event, null, 2));
  console.log('context', JSON.stringify(context, null, 2));
  return { message: 'Hello from Bun AWS Lambda!' };
}

// if this is main module, start runtime
if (require.main === module) {
  startRuntime(handler).catch(console.error);
}
