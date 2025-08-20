# Требования для работы с реальной криптой

## 🔥 КРИТИЧНО - Интеграция с реальными DEX

### 1. Замена mock контракта на реальный Uniswap

```solidity
// Нужно переписать ImprovedProxySwap.sol
contract RealProxySwap {
    ISwapRouter public immutable uniswapRouter;
    IQuoter public immutable quoter;
    
    // Реальные свапы через Uniswap
    function swapExactInputSingle(...) external {
        // Получаем quote из Uniswap Quoter
        uint256 amountOut = quoter.quoteExactInputSingle(...);
        
        // Выполняем реальный свап
        amountOutActual = uniswapRouter.exactInputSingle(...);
    }
}
```

### 2. Замена mock курсов на реальные API

```typescript
// src/app/utils/uniswap-real.ts
export async function getRealQuote(tokenIn: string, tokenOut: string, amountIn: string) {
  // Подключение к реальному Uniswap Quoter контракту
  const quoter = new Contract(UNISWAP_V3_QUOTER, QUOTER_ABI, provider);
  
  const quote = await quoter.quoteExactInputSingle(
    tokenIn,
    tokenOut,
    3000, // fee tier
    amountIn,
    0
  );
  
  return quote;
}
```

## 🛡️ БЕЗОПАСНОСТЬ

### 1. Приватные ключи
- ❌ НЕ хранить в .env файлах
- ✅ Использовать Hardware Wallet (Ledger/Trezor)
- ✅ Multisig кошельки для владения контрактами

### 2. RPC провайдеры
```bash
# .env.production (НЕ коммитить!)
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/YOUR_PRIVATE_KEY
NEXT_PUBLIC_ALCHEMY_KEY=your_alchemy_key
```

### 3. Валидация адресов
```typescript
function validateContractAddress(address: string): boolean {
  // Проверка что адрес существует и содержит контракт
  const code = await provider.getCode(address);
  return code !== '0x';
}
```

## 📊 ЛИКВИДНОСТЬ

### 1. Начальная ликвидность
- Нужно $10,000+ для минимальной ликвидности
- Для каждой пары токенов

### 2. Управление слиппажем
```typescript
const slippage = 0.5; // 0.5% максимальный слиппаж
const minAmountOut = expectedOut * (1 - slippage/100);
```

## 🌐 VERCEL DEPLOYMENT

### Что МОЖНО деплоить на Vercel:
✅ Frontend (Next.js app)
✅ API routes для логов и статистики
✅ Статические данные

### Что НЕЛЬЗЯ на Vercel:
❌ Hardhat node (нужен отдельный сервер)
❌ Приватные ключи
❌ Долгие процессы (timeout 10s)

### Конфигурация для Vercel:
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build:prod",
  "env": {
    "NEXT_PUBLIC_CHAIN_ID": "1",
    "NEXT_PUBLIC_RPC_URL": "@rpc_url",
    "NEXT_PUBLIC_CONTRACT_ADDRESS": "@contract_address"
  }
}
```

## 🔧 INFRASTRUCTURE

### 1. RPC Infrastructure
- Infura Pro: $50/месяц
- Alchemy Growth: $199/месяц
- QuickNode: от $9/месяц

### 2. Monitoring
- Etherscan API для транзакций
- Grafana для метрик
- Sentry для ошибок

### 3. Резервные контракты
```solidity
contract ProxyUpgradeable {
    address public implementation;
    
    function upgrade(address newImplementation) external onlyOwner {
        implementation = newImplementation;
    }
}
```

## 💰 COSTS

### Разработка:
- Smart contract audit: $15,000-50,000
- Devops/Infrastructure: $2,000/месяц
- Insurance (в случае взлома): $100,000+

### Gas costs:
- Deploy контракта: ~$500-2000 (зависит от gas price)
- Каждый swap: $10-100 (зависит от сети)

### Legal:
- Регистрация как crypto business
- KYC/AML compliance
- Лицензии в разных юрисдикциях

## ⚠️ РИСКИ

1. **Smart contract bugs** - потеря всех средств
2. **Regulatory changes** - блокировка в странах
3. **MEV attacks** - фронтраннинг транзакций
4. **Price manipulation** - flash loan атаки
5. **Infrastructure failures** - RPC провайдеры

## 📋 CHECKLIST перед PRODUCTION

### Technical:
- [ ] Smart contract audit
- [ ] Real Uniswap integration
- [ ] Slippage protection
- [ ] MEV protection
- [ ] Circuit breakers
- [ ] Emergency pause functionality

### Legal:
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Regulatory compliance
- [ ] Insurance coverage

### Operations:
- [ ] Monitoring dashboard
- [ ] Incident response plan
- [ ] Backup infrastructure
- [ ] Multi-sig wallet setup
