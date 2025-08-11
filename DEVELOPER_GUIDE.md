# 🚀 Crypto Exchanger - Инструкции для разработчика

## 📋 О проекте

Децентрализованная биржа для обмена криптовалют на Ethereum с функциями:
- Обмен ETH ↔ ERC20 токенов
- Подключение MetaMask через RainbowKit
- Работа с mainnet и localhost
- Система комиссий 0.1%
- Управление накопленными комиссиями

## 🛠 Технологии

- **Frontend:** Next.js 14, React 18, TypeScript
- **Web3:** wagmi, RainbowKit, ethers.js
- **Blockchain:** Hardhat, Solidity
- **Стили:** Кастомный CSS (без Tailwind)

## ⚡ Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка переменных окружения
Скопируйте `.env.local` и настройте:

**Для localhost:**
```bash
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_ID=31337
DEPLOYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Для mainnet:**
```bash
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_CHAIN_ID=1
DEPLOYER_PRIVATE_KEY=0xYOUR_REAL_PRIVATE_KEY_WITH_ETH
```

### 3. Локальная разработка
```bash
# Запуск Hardhat узла + Next.js одновременно
npm run dev:full

# Или по отдельности:
npm run node    # Hardhat узел (терминал 1)
npm run dev     # Next.js (терминал 2)
```

### 4. Деплой контрактов

**Localhost:**
```bash
npm run deploy:improved     # Улучшенный контракт с управлением комиссиями
npm run deploy:simple       # Простой контракт
```

**Mainnet:**
```bash
npm run mainnet:deploy-improved  # Деплой + автообновление адреса
```

## 📁 Структура проекта

```
├── contracts/              # Solidity контракты
│   ├── SimpleProxySwap.sol     # Базовый контракт
│   └── ImprovedProxySwap.sol   # Улучшенный с управлением комиссиями
├── scripts/                # Скрипты деплоя
│   ├── deploy-improved.js      # Деплой улучшенного контракта
│   ├── deploy-mainnet.js       # Деплой в mainnet
│   └── update-contract-address.js  # Автообновление адреса
├── src/app/                # Next.js приложение
│   ├── components/             # React компоненты
│   │   ├── ImprovedSwapForm.tsx    # Основная форма обмена
│   │   ├── Providers.tsx           # Web3 провайдеры
│   │   └── ...
│   ├── utils/                  # Утилиты и константы
│   │   ├── constants.ts            # Адреса токенов и контрактов
│   │   └── uniswap.ts             # Утилиты для работы с Uniswap
│   └── globals.css             # Кастомные стили
├── .env.local              # Переменные окружения
└── hardhat.config.js       # Конфигурация Hardhat
```

## 🔧 Основные компоненты

### ImprovedSwapForm.tsx
- Основная форма для обмена токенов
- Подключение к кошельку
- Отображение балансов
- Выполнение обменов

### Providers.tsx
- Настройка wagmi и RainbowKit
- Автоматическое переключение между localhost/mainnet
- Подключение к правильной сети

### constants.ts
- Адреса токенов для mainnet
- Адрес ProxySwap контракта
- Uniswap Router адреса

## 💰 Система комиссий

### Размер комиссии: 0.1%
- Удерживается с каждого обмена
- Накапливается в контракте (ImprovedProxySwap)
- Владелец может выводить в любое время

### Управление комиссиями:
```javascript
// Проверить накопленные ETH комиссии
const ethFees = await contract.getAccumulatedFees("0x0000000000000000000000000000000000000000");

// Вывести ETH комиссии
await contract.withdrawAllETHFees("YOUR_ADDRESS");

// Вывести токен комиссии
await contract.withdrawFees("TOKEN_ADDRESS", "YOUR_ADDRESS");
```

## 🌐 Поддерживаемые токены

**Mainnet:**
- ETH (нативный)
- WETH: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
- USDC: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
- USDT: 0xdAC17F958D2ee523a2206206994597C13D831ec7

**Uniswap Addresses:**
- V2 Router: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
- V3 Router: 0xE592427A0AEce92De3Edee1F18E0157C05861564
- V3 Quoter: 0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6

## 📋 Доступные команды

### Разработка
- `npm run dev` - Запуск Next.js
- `npm run build` - Сборка проекта
- `npm run node` - Запуск локального Hardhat узла

### Деплой
- `npm run deploy:simple` - Деплой базового контракта (localhost)
- `npm run deploy:improved` - Деплой улучшенного контракта (localhost)
- `npm run deploy:mainnet` - Деплой в mainnet
- `npm run deploy:improved-mainnet` - Деплой улучшенного в mainnet

### Комбинированные
- `npm run dev:full` - Hardhat + Next.js одновременно
- `npm run mainnet:deploy` - Деплой + обновление адреса
- `npm run mainnet:deploy-improved` - Улучшенный деплой + обновление

### Утилиты
- `npm run update:address` - Обновление адреса контракта в коде
- `npm run check:balances` - Проверка балансов

## ⚠️ Безопасность

### ❗ Критически важно:
- **НИКОГДА** не коммитить реальные приватные ключи
- **ВСЕГДА** использовать отдельный кошелек для деплоя
- **ТЕСТИРОВАТЬ** на небольших суммах
- **ПРОВЕРЯТЬ** адреса контрактов и токенов

### 🔐 Переменные окружения:
- `.env.local` добавлен в .gitignore
- Используйте тестовые ключи для разработки
- Для mainnet создайте отдельный .env файл

## 🚀 Деплой в production

### 1. Подготовка кошелька
- Создать новый кошелек
- Пополнить ETH (минимум 0.1 ETH)
- Экспортировать приватный ключ

### 2. Настройка .env.local
```bash
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_CHAIN_ID=1
DEPLOYER_PRIVATE_KEY=0xYOUR_REAL_KEY
```

### 3. Деплой
```bash
npm run mainnet:deploy-improved
```

### 4. Профинансировать контракт
- Отправить ETH для ликвидности
- Отправить токены для торговли

## 📚 Дополнительная документация

- `README.md` - Основная документация
- `FEE_MANAGEMENT.md` - Управление комиссиями
- `MAINNET_DEPLOY.md` - Инструкции по деплою
- `FINAL_STEPS.md` - Финальные шаги для запуска

## 🆘 Решение проблем

### Ошибки подключения:
- Проверить правильность RPC URL
- Убедиться в правильности CHAIN_ID
- Проверить баланс ETH для газа

### Ошибки компиляции:
- Очистить кэш: удалить `.next` папку
- Переустановить зависимости: `rm -rf node_modules && npm install`

### Проблемы с MetaMask:
- Проверить подключение к правильной сети
- Сбросить транзакции в MetaMask если нужно

## 📞 Контакты

При возникновении вопросов:
1. Проверить документацию в проекте
2. Изучить код компонентов
3. Протестировать на localhost перед mainnet

**Удачи в разработке!** 🚀
