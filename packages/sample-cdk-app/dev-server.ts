// bun fullstack dev server
import home from './site/index.html';
import { fetch } from './api';

const server = Bun.serve({
  static: {
    '/': home,
  },
  development: true,
  fetch,
});

console.log(`Listening on ${server.url}`);