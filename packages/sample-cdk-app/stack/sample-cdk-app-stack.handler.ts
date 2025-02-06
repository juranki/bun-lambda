import { startRuntime } from 'bun-lambda-bootstrap'
import { handler } from '../api';

if (require.main === module) {
  startRuntime(handler).catch(console.error);
}
