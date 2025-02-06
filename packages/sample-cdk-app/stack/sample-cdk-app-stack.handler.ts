import { startRuntime } from 'bun-lambda-boostrap';
import { handler } from '../app';

if (require.main === module) {
  startRuntime(handler).catch(console.error);
}
