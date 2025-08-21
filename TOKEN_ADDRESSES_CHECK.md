# 🔍 ПРОВЕРКА АДРЕСОВ ТОКЕНОВ

## ❌ ВОЗМОЖНАЯ ПРОБЛЕМА:

Адреса токенов в `constants.ts` могут указывать на несуществующие контракты:

```typescript
'USDC': { address: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8', decimals: 6, symbol: 'USDC' },
'USDT': { address: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', decimals: 6, symbol: 'USDT' }
```

## 🔗 ПРОВЕРКА В ETHERSCAN:

### USDC: https://sepolia.etherscan.io/address/0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8
### USDT: https://sepolia.etherscan.io/address/0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0

## ✅ ЕСЛИ КОНТРАКТЫ НЕ СУЩЕСТВУЮТ:

Нужно задеплоить MockERC20 контракты на Sepolia:

```bash
# 1. Деплой USDC
npx hardhat run scripts/deploy-mock-usdc.js --network sepolia

# 2. Деплой USDT  
npx hardhat run scripts/deploy-mock-usdt.js --network sepolia

# 3. Обновить адреса в constants.ts
```

## 🚀 БЫСТРОЕ РЕШЕНИЕ:

Используем реальные тестовые токены на Sepolia:

```typescript
// Реальные тестовые токены Sepolia
'USDC': { address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', decimals: 6, symbol: 'USDC' },
'USDT': { address: '0x509Ee0d083DdF8AC028f2a56731412edD63223B9', decimals: 6, symbol: 'USDT' }
```

## 🎯 ПЛАН ДЕЙСТВИЙ:

1. **Проверить Etherscan** - существуют ли контракты
2. **Если НЕТ** - задеплоить новые Mock контракты  
3. **Если ДА** - проверить есть ли функция `mint`
4. **Обновить адреса** в constants.ts если нужно

## 💡 АЛЬТЕРНАТИВА:

Создать API endpoint для минтинга:
- Серверная функция с приватным ключом
- Безопасный минтинг через Vercel Functions
- Лимиты на пользователя
