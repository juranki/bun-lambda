import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

const app = new Hono();
app.get('/api/hello', (c) => c.text('Hello Bun!'));

export const handler = handle(app);
export const fetch = app.fetch;