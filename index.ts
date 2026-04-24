/// <reference path="./prisma-sdk.d.ts" />

const REPLY_TEXT = 'Hello World! Это сообщение было отправлено плагином prismaGram Web!';

function evaluate(expr: string): number | string {
  try {
    if (!/^[\d\s+\-*/()%.]+$/.test(expr)) throw new Error();
    const result = Function('"use strict"; return (' + expr + ')')();
    return isNaN(result) ? 'Ошибка' : result;
  } catch {
    return 'Ошибка вычисления';
  }
}

PrismaSDK.register('beforeMessageSent', async ({ text, chatId }) => {
  if (text === '!hello') {
    await PrismaSDK.call('messages.send', chatId, REPLY_TEXT);
    return { cancel: true };
  }
  if (text.startsWith('!calc ')) {
    const expr = text.slice(6).trim();
    const result = evaluate(expr);
    await PrismaSDK.call('messages.send', chatId, `Результат: ${result}`);
    return { cancel: true };
  }
  return { cancel: false };
});
