# Crypto Exchanger

Децентрализованная биржа для обмена токенов на Ethereum с поддержкой как локальной разработки, так и mainnet.

## ⚡ Быстрый деплой на Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ВАШ_USERNAME/crypto-exchanger)

*Замените ВАШ_USERNAME на ваш GitHub username после создания репозитория*

## 🚀 Быстрый старт

### 🤖 Автоматический запуск (Рекомендуется)

**Самый простой способ - автодеплой:**
```bash
npm run dev:auto
```
Это автоматически:
- ✅ Запустит локальный узел Hardhat
- ✅ Задеплоит контракт
- ✅ Обновит адрес в коде
- ✅ Запустит Next.js сервер

**Или используйте Windows батник:**
```batch
start-auto-deploy.bat
```

### 📱 Пошаговая разработка

1. **Установка зависимостей:**
```bash
npm install
```

2. **Автоматический запуск с деплоем:**
```bash
npm run dev:auto
```

3. **Открыть браузер:** http://localhost:3000

### 🔧 Ручной запуск (если нужен контроль)

1. **Запуск локального узла:**
```bash
npm run node
```

2. **Деплой контракта:**
```bash
npm run auto:deploy
```

3. **Запуск Next.js:**
```bash
npm run dev
```

### Mainnet деплой

1. **Настройка .env.local:**
   - Убедитесь, что NEXT_PUBLIC_CHAIN_ID=1
   - Проверьте Infura RPC URL
   - **ВАЖНО:** Замените DEPLOYER_PRIVATE_KEY на реальный приватный ключ с ETH

2. **Деплой и обновление адреса:**
```bash
npm run mainnet:deploy
```

3. **Запуск для mainnet:**
```bash
npm run dev
```

## 📋 Доступные команды

### Разработка
- `npm run dev` - Запуск Next.js
- `npm run build` - Сборка проекта
- `npm run node` - Запуск локального Hardhat узла

### Деплой
- `npm run deploy:local` - Деплой в localhost
- `npm run deploy:mainnet` - Деплой в mainnet
- `npm run update:address` - Обновление адреса контракта в коде

### Комбинированные
- `npm run dev:full` - Запуск узла + Next.js одновременно
- `npm run mainnet:deploy` - Деплой в mainnet + обновление адреса

## 🌐 Поддерживаемые токены (Mainnet)

- **ETH** - Нативный Ethereum
- **WETH** - Wrapped Ethereum (0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2)
- **USDC** - USD Coin (0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48)
- **USDT** - Tether USD (0xdAC17F958D2ee523a2206206994597C13D831ec7)

## 🔧 Конфигурация

### Переключение между localhost/mainnet

Отредактируйте `.env.local`:

**Для localhost:**
```bash
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_ID=31337
```

**Для mainnet:**
```bash
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/your-infura-key
NEXT_PUBLIC_CHAIN_ID=1
```

## ⚠️ Безопасность

- **Никогда не коммитьте реальные приватные ключи!**
- Используйте отдельный кошелек для деплоя
- Проверяйте адреса контрактов перед использованием
- Тестируйте на небольших суммах

## 🛠 Технологии

- **Frontend:** Next.js 14, React 18, TypeScript
- **Web3:** wagmi, RainbowKit, ethers.js
- **Blockchain:** Hardhat, Solidity
- **Стили:** Кастомный CSS

## 📁 Структура проекта

```
├── contracts/          # Solidity контракты
├── scripts/            # Скрипты деплоя
├── src/app/            # Next.js приложение
│   ├── components/     # React компоненты
│   └── utils/          # Константы и утилиты
├── .env.local          # Переменные окружения
└── hardhat.config.js   # Конфигурация Hardhat
```

## 🎯 Основные функции

- ✅ Обмен ETH ↔ ERC20 токенов
- ✅ Обмен ERC20 ↔ ERC20 токенов  
- ✅ Подключение MetaMask
- ✅ Отображение балансов
- ✅ Поддержка localhost и mainnet
- ✅ Автоматический деплой и настройка

## 📞 Поддержка

При возникновении проблем:
1. Проверьте подключение к MetaMask
2. Убедитесь в правильности сети (localhost/mainnet)
3. Проверьте баланс ETH для газа
4. Обновите адрес контракта после деплоя
