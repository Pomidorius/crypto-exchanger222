# 🚀 Деплой Crypto Exchanger на Vercel (Sepolia Testnet)

## 📋 Пошаговая инструкция

### 1. Подготовка проекта

```bash
# Клонируем репозиторий
git clone <your-repo>
cd crypto-exchanger

# Устанавливаем зависимости
npm install
```

### 2. Деплой контракта на Sepolia

```bash
# Получаем тестовые ETH
# Идем на https://sepoliafaucet.com/ и получаем ETH на свой адрес

# Создаем .env файл
cp .env.example .env
nano .env

# Добавляем приватный ключ в .env:
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Деплоим контракт на Sepolia
npm run deploy:sepolia
```

После успешного деплоя вы получите адрес контракта, например:
```
✅ Contract deployed!
📍 Address: 0x1234567890123456789012345678901234567890
```

### 3. Настройка Vercel

#### 3.1 Создание проекта в Vercel

1. Идем на [vercel.com](https://vercel.com)
2. Подключаем GitHub аккаунт
3. Импортируем репозиторий
4. Выбираем Framework: **Next.js**

#### 3.2 Environment Variables в Vercel

В настройках проекта Vercel добавляем переменные:

```bash
# Network Configuration
NEXT_PUBLIC_CHAIN_ID=11155111

# RPC URL (получить на infura.io или alchemy.com)
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Contract Address (из деплоя выше)
NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=0x1234567890123456789012345678901234567890

# WalletConnect Project ID (получить на cloud.walletconnect.com)
NEXT_PUBLIC_PROJECT_ID=your_walletconnect_project_id
```

#### 3.3 Build Settings

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build:vercel",
  "outputDirectory": ".next"
}
```

### 4. Получение необходимых ключей

#### 4.1 Infura RPC URL
1. Идем на [infura.io](https://infura.io)
2. Создаем аккаунт
3. Создаем новый проект
4. Копируем Sepolia endpoint: `https://sepolia.infura.io/v3/YOUR_KEY`

#### 4.2 WalletConnect Project ID
1. Идем на [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Создаем аккаунт
3. Создаем новый проект
4. Копируем Project ID

### 5. Деплой

```bash
# Запушиваем изменения в GitHub
git add .
git commit -m "Configure for Vercel deployment"
git push

# Vercel автоматически задеплоит проект
```

### 6. Проверка работы

После деплоя:

1. **Откройте приложение** - должно показать "Sepolia Testnet - Демо режим"
2. **Подключите MetaMask** - переключитесь на Sepolia network
3. **Получите тестовые ETH** - кнопка "Получить тестовые ETH"
4. **Попробуйте обмен** - любые суммы тестовых токенов

## 🔧 Troubleshooting

### Проблема: "Неправильная сеть"
**Решение**: Переключите MetaMask на Sepolia Testnet
- Chainlist: https://chainlist.org/chain/11155111

### Проблема: "Контракт не найден"
**Решение**: Проверьте переменную `NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA` в Vercel

### Проблема: "RPC ошибки"
**Решение**: Проверьте `NEXT_PUBLIC_RPC_URL` - должен быть валидный Infura/Alchemy URL

### Проблема: Кошелек не подключается
**Решение**: Проверьте `NEXT_PUBLIC_PROJECT_ID` от WalletConnect

## 📊 Мониторинг

- **Vercel Dashboard**: Логи деплоя и функций
- **Sepolia Etherscan**: https://sepolia.etherscan.io/
- **Contract Address**: https://sepolia.etherscan.io/address/YOUR_CONTRACT

## 🎯 Результат

После настройки у вас будет:

✅ Работающий DEX на Sepolia testnet  
✅ Деплой на Vercel с custom domain  
✅ Подключение MetaMask кошельков  
✅ Обмен тестовых токенов ETH ↔ USDC ↔ USDT  
✅ Полностью функциональная демо-версия для клиента  

## 🔗 Полезные ссылки

- [Sepolia Faucet](https://sepoliafaucet.com/) - получить тестовые ETH
- [Sepolia Etherscan](https://sepolia.etherscan.io/) - explorer
- [MetaMask](https://metamask.io/) - кошелек
- [Vercel Docs](https://vercel.com/docs) - документация
- [Infura](https://infura.io/) - RPC провайдер
- [WalletConnect](https://cloud.walletconnect.com/) - wallet connection
