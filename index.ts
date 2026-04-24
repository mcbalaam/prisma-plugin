// Временно отключаем внешние типы для чистоты (PrismaSDK будет в рантайме)
// /// <reference path="./prisma-sdk.d.ts" />
window.parent.postMessage({ type: 'debug', text: 'Plugin script started' }, '*');
window.parent.postMessage({ type: 'debug', text: `PrismaSDK available? ${typeof PrismaSDK}` }, '*');
declare const PrismaSDK: any;

const REPLY_TEXT = 'Hello World! Это сообщение было отправлено плагином prismaGram Web!';

// Утилита для логирования с временной меткой
function log(...args: any[]) {
  console.log(`[PLUGIN ${Date.now()}]`, ...args);
}

function evaluate(expr: string): number | string {
  try {
    if (!/^[\d\:\s+\-*/()%.]+$/.test(expr)) throw new Error();
    const result = Function('"use strict"; return (' + expr + ')')();
    return isNaN(result) ? 'Ошибка' : result;
  } catch {
    return 'Ошибка вычисления';
  }
}

log('🚀 Script execution started');

// Проверяем наличие SDK в момент старта
if (typeof PrismaSDK === 'undefined') {
  log('❌ PrismaSDK is undefined at script start');
} else {
  log('✅ PrismaSDK found', {
    hasRegister: typeof PrismaSDK.register === 'function',
    hasReady: typeof PrismaSDK.ready === 'function',
    hasCall: typeof PrismaSDK.call === 'function',
    pluginId: PrismaSDK.pluginId,
    capabilities: PrismaSDK.capabilities,
    isReady: (PrismaSDK as any)._isReady,
  });
}

// Регистрируем обработчик синхронно с логами
log('📝 About to register beforeMessageSent handler');
PrismaSDK.register('beforeMessageSent', async ({ text, chatId }: any) => {
  log('🔥 beforeMessageSent handler INVOKED', { text, chatId });
  try {
    if (text === '!hello') {
      log('✅ Processing !hello command');
      await PrismaSDK.call('messages.send', chatId, REPLY_TEXT);
      log('📤 Reply sent for !hello');
      return { cancel: true };
    }
    if (text.startsWith('!calc ')) {
      log('🧮 Processing !calc command');
      const expr = text.slice(6).trim();
      const result = evaluate(expr);
      log(`🔢 Calculation result: ${result}`);
      await PrismaSDK.call('messages.send', chatId, `Результат: ${result}`);
      log('📤 Reply sent for !calc');
      return { cancel: true };
    }
    log('⏭️ No command matched, not cancelling');
    return { cancel: false };
  } catch (err) {
    log('💥 Error in beforeMessageSent handler', err);
    throw err;
  }
});
log('✅ after register call, handler should be stored in _methodHandlers');

// Подписка на готовность SDK
PrismaSDK.ready(() => {
  log('🎉 SDK ready callback fired', {
    pluginId: PrismaSDK.pluginId,
    capabilities: PrismaSDK.capabilities,
    isReady: (PrismaSDK as any)._isReady,
  });
});

// Перехват всех postMessage от родителя для диагностики
window.addEventListener('message', (event) => {
  if (event.source !== window.parent) return;
  const msg = event.data;
  if (msg && typeof msg.type === 'string') {
    log('📨 Received postMessage from host', { type: msg.type, method: msg.method, id: msg.id });
    if (msg.type === 'rpc:request' && msg.method === 'beforeMessageSent') {
      log('⚠️ RPC request for beforeMessageSent received! Checking internal state...');
      try {
        const methodHandlers = (PrismaSDK as any)._methodHandlers;
        if (methodHandlers) {
          log(`🔍 _methodHandlers size = ${methodHandlers.size}, keys:`, Array.from(methodHandlers.keys()));
          const hasHandler = methodHandlers.has('beforeMessageSent');
          log(`🔍 Has 'beforeMessageSent' handler? ${hasHandler}`);
        } else {
          log('🔍 _methodHandlers is not accessible (maybe private)');
        }
        const isReadyFlag = (PrismaSDK as any)._isReady;
        log(`🔍 _isReady = ${isReadyFlag}`);
      } catch (e) {
        log('🔍 Cannot inspect internals', e);
      }
    }
  }
});

log('🏁 Script execution finished (top-level code complete)');

export {};