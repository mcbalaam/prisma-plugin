/// <reference path="./prisma-sdk.d.ts" />

const REPLY_TEXT = 'Hello World! Это сообщение было отправлено плагином prismaGram Web!';

PrismaSDK.register('beforeMessageSent', async ({ text, chatId }) => {
  if (text !== '!hello') return { cancel: false };
  await PrismaSDK.call('messages.send', chatId, REPLY_TEXT);
  return { cancel: true };
});