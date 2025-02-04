import { startRuntime } from 'bun-lambda-boostrap';

async function main() {
  await startRuntime(async (event, context) => {
    console.log('event', JSON.stringify(event, null, 2));
    console.log('context', JSON.stringify(context, null, 2));
    return { message: 'Hello from Bun AWS Lambda!' };
  });
}
// if this is main module, start runtime
if (require.main === module) {
  main()
    .then(() => {
      console.log('shutdown');
    })
    .catch(console.error);
}
