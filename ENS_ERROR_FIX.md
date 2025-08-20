# 🔧 Решение ошибки ENS

## ❌ Проблема:
```
resolver or addr is not configured for ENS name (argument="name", value="", code=INVALID_ARGUMENT, version=contracts/5.8.0)
```

## 🎯 Причина:
В `constants.ts` пустой `PROXY_SWAP_ADDRESS = ''` - приложение пытается подключиться к несуществующему контракту.

## ✅ Быстрое решение:

### 1. Временный фикс для демонстрации:
Добавить временный адрес, чтобы приложение не падало:

```typescript
// В constants.ts:
export const PROXY_SWAP_ADDRESS = '0x0000000000000000000000000000000000000001'; // временный
```

### 2. Правильное решение - деплой контракта:

#### Для тестнета (Sepolia):
```bash
# Настроить .env.local для Sepolia:
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/2643d99854284063b2852bea3af7e04a
NEXT_PUBLIC_CHAIN_ID=11155111

# Деплоить контракт:
npm run deploy:sepolia
```

#### Для mainnet:
```bash
# Настроить .env.local для mainnet:
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/2643d99854284063b2852bea3af7e04a
NEXT_PUBLIC_CHAIN_ID=1

# Нужен реальный кошелек с ETH:
DEPLOYER_PRIVATE_KEY=0xВАШ_РЕАЛЬНЫЙ_КЛЮЧ

# Деплоить:
npm run deploy:mainnet
```

### 3. Автоматическое обновление адреса:
После деплоя скрипт автоматически обновит `PROXY_SWAP_ADDRESS` в constants.ts

## 🚀 Пошаговый план:

### Шаг 1: Временный фикс
```typescript
export const PROXY_SWAP_ADDRESS = '0x0000000000000000000000000000000000000001';
```

### Шаг 2: Деплой на Sepolia (безопасно)
```bash
npm run deploy:sepolia
```

### Шаг 3: Проверить что адрес обновился
```typescript
// Должно стать примерно так:
export const PROXY_SWAP_ADDRESS = '0x1234567890123456789012345678901234567890';
```

### Шаг 4: Коммит и push
```bash
git add .
git commit -m "Обновил адрес контракта Sepolia"
git push origin testnet  # для тестнета
# или
git push origin main     # для mainnet
```

## 💡 Для Vercel:

1. **Testnet версия**: Деплоить на Sepolia (бесплатные ETH)
2. **Production версия**: Деплоить на Mainnet (нужны реальные ETH)

## 🔍 Диагностика:

Ошибка возникает в этих местах:
- `SwapForm.tsx` - при подключении к контракту
- `swap.ts` - при вызове функций контракта
- Любое место где используется `PROXY_SWAP_ADDRESS`

---
**🎯 После деплоя контракта ошибка исчезнет!**
