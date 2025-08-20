# 🚀 Vercel Deployment Configuration

## Environment Variables для Vercel

### Обязательные переменные:
```bash
# Network Configuration
NEXT_PUBLIC_CHAIN_ID=1                 # 1 для Mainnet, 11155111 для Sepolia
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY

# Contract Addresses (после деплоя)
NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET=0x...
NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=0x...

# WalletConnect (получить на https://cloud.walletconnect.com/)
NEXT_PUBLIC_PROJECT_ID=your_walletconnect_project_id
```

### Дополнительные переменные:
```bash
# RPC Backup
NEXT_PUBLIC_ALCHEMY_KEY=your_alchemy_key
NEXT_PUBLIC_QUICKNODE_URL=your_quicknode_url

# Analytics
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token
```

## Build Configuration

### package.json scripts:
```json
{
  "scripts": {
    "build": "next build",
    "build:prod": "NODE_ENV=production next build",
    "start": "next start"
  }
}
```

### next.config.js для Vercel:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Отключаем Hardhat-зависимые компоненты на production
  env: {
    DISABLE_HARDHAT_COMPONENTS: process.env.NODE_ENV === 'production' ? 'true' : 'false',
  },
  
  // Webpack конфигурация для Web3
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
```

## Компоненты для удаления/изменения

### 1. AutoDeployStatus.tsx
```typescript
// Отключаем на production
export function AutoDeployStatus() {
  if (process.env.DISABLE_HARDHAT_COMPONENTS === 'true') {
    return null;
  }
  
  // Остальной код...
}
```

### 2. TestFaucet.tsx
```typescript
export function TestFaucet() {
  // Показываем только на Sepolia testnet
  if (process.env.NEXT_PUBLIC_CHAIN_ID !== '11155111') {
    return null;
  }
  
  // Остальной код...
}
```

### 3. ContractStatus.tsx
```typescript
export function ContractStatus() {
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
  
  // Показываем статус только для deployed контрактов
  if (!chainId || chainId === '31337') {
    return (
      <div className="alert alert-warning">
        ⚠️ Тестовая сеть. Используйте Sepolia для тестирования.
      </div>
    );
  }
  
  // Проверяем что контракт задеплоен...
}
```

## Процесс деплоя

### 1. Подготовка контрактов (локально):
```bash
# Деплой на Sepolia для тестирования
npm run deploy:sepolia

# Деплой на Mainnet (ОСТОРОЖНО!)
npm run deploy:mainnet
```

### 2. Настройка Vercel:
```bash
# Установка Vercel CLI
npm i -g vercel

# Логин в Vercel
vercel login

# Деплой
vercel --prod
```

### 3. Environment Variables в Vercel Dashboard:
- Заходим в Vercel Project Settings
- Добавляем все переменные из списка выше
- Делаем redeploy

## Production Checklist

### ✅ Before Deploy:
- [ ] Контракт задеплоен на Mainnet/Sepolia
- [ ] RPC провайдер настроен (Infura/Alchemy)
- [ ] WalletConnect Project ID получен
- [ ] Environment variables добавлены в Vercel
- [ ] Тестирование на Sepolia

### ✅ After Deploy:
- [ ] Все компоненты загружаются
- [ ] Кошелек подключается
- [ ] Транзакции проходят
- [ ] Цены токенов актуальные
- [ ] Ошибки логируются

## Monitoring

### Vercel Analytics:
```typescript
// pages/_app.tsx
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

### Error Tracking:
```typescript
// utils/logger.ts
export const logError = async (error: Error, context: string) => {
  // Отправляем в Vercel или Sentry
  console.error(`[${context}]`, error);
  
  // Можно добавить API route для логирования
  await fetch('/api/errors', {
    method: 'POST',
    body: JSON.stringify({ error: error.message, context })
  });
};
```

## Costs на Vercel

### Free Plan:
- ✅ 100GB bandwidth
- ✅ Unlimited personal projects
- ❌ Только для некоммерческого использования

### Pro Plan ($20/месяц):
- ✅ 1TB bandwidth
- ✅ Commercial использование
- ✅ Analytics
- ✅ Priority support

### Enterprise:
- Custom pricing
- Advanced analytics
- SLA guarantees
