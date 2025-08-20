# 🧪 Настройка тестовой сети для безопасного тестирования

## 🎯 Цель: Пользователи могут тестировать без риска для кошелька

Настроим **Sepolia тестнет** для Vercel - пользователи смогут тестировать с бесплатными тестовыми ETH.

## 🔧 Настройка Sepolia для Vercel:

### 1. Обновить переменные в Vercel
В Settings → Environment Variables замените:

**Было (mainnet):**
```
NEXT_PUBLIC_RPC_URL = https://mainnet.infura.io/v3/2643d99854284063b2852bea3af7e04a
NEXT_PUBLIC_CHAIN_ID = 1
```

**Стало (Sepolia тестнет):**
```
NEXT_PUBLIC_RPC_URL = https://sepolia.infura.io/v3/2643d99854284063b2852bea3af7e04a
NEXT_PUBLIC_CHAIN_ID = 11155111
```

### 2. Деплой контракта на Sepolia
```bash
# Обновим .env.local для Sepolia:
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/2643d99854284063b2852bea3af7e04a
NEXT_PUBLIC_CHAIN_ID=11155111

# Деплоим на Sepolia:
npx hardhat run scripts/deploy-improved.js --network sepolia
```

### 3. Добавить Sepolia в hardhat.config.js
```javascript
networks: {
  // ... существующие сети
  sepolia: {
    url: process.env.NEXT_PUBLIC_RPC_URL,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY]
  }
}
```

## 💰 Как пользователи получат тестовые ETH:

### Бесплатные краны (faucets):
1. **Sepolia Faucet**: https://sepoliafaucet.com/
2. **Alchemy Faucet**: https://sepoliafaucet.com/
3. **Chainlink Faucet**: https://faucets.chain.link/sepolia

### Инструкция для пользователей:
1. Подключить MetaMask к Sepolia
2. Получить бесплатные ETH с крана
3. Тестировать обмены без риска

## 🎨 Добавим уведомление на сайт:

Создадим компонент-уведомление о тестовой сети:

```typescript
// TestNetBanner.tsx
export function TestNetBanner() {
  return (
    <div className="bg-yellow-100 border border-yellow-400 p-4 rounded mb-4">
      <h3 className="font-bold text-yellow-800">🧪 Тестовая версия</h3>
      <p className="text-yellow-700">
        Это Sepolia тестнет! Используйте бесплатные тестовые ETH.
        <a href="https://sepoliafaucet.com/" target="_blank" className="underline ml-2">
          Получить тестовые ETH →
        </a>
      </p>
    </div>
  )
}
```

## 🔄 Альтернативные варианты:

### Вариант 1: Два домена
- **Тест**: `crypto-exchanger-test.vercel.app` (Sepolia)  
- **Прод**: `crypto-exchanger.vercel.app` (Mainnet)

### Вариант 2: Переключатель сети
Добавить кнопку переключения между mainnet и testnet прямо в UI.

### Вариант 3: Моковые данные
Создать "демо режим" с фейковыми балансами для демонстрации.

## ✅ Преимущества Sepolia:

- 🔐 **Безопасно**: Тестовые ETH не имеют ценности
- 🆓 **Бесплатно**: ETH можно получить с кранов
- ⚡ **Быстро**: Транзакции подтверждаются быстрее
- 🔄 **Реалистично**: Полная имитация mainnet

## 🚀 План внедрения:

1. **Обновить конфигурацию** для Sepolia
2. **Деплоить контракт** на Sepolia  
3. **Добавить уведомление** на сайт
4. **Создать инструкции** для пользователей
5. **Redeploy на Vercel**

---
**Результат: Безопасная песочница для тестирования! 🧪**
