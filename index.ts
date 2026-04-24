/// <reference path="./prisma-sdk.d.ts" />

PrismaSDK.register('ping', async () => {
  console.log('pong');
  return 'pong';
});