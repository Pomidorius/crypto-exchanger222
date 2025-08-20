# 🚀 Деплой контракта в Sepolia

## 📋 Шаги деплоя

### 1. Подготовка кошелька
1. **Получите приватный ключ MetaMask:**
   - Откройте MetaMask
   - Settings → Security & Privacy → Show Private Key
   - Скопируйте приватный ключ

2. **Настройте .env файл:**
   ```bash
   # Откройте .env файл и замените:
   DEPLOYER_PRIVATE_KEY=your_private_key_here
   # на ваш реальный приватный ключ
   ```

3. **Получите тестовые ETH:**
   - https://sepoliafaucet.com/
   - https://www.infura.io/faucet/sepolia
   - https://faucet.quicknode.com/ethereum/sepolia
   - Нужно минимум 0.01 ETH для газа

### 2. Проверка готовности
```bash
npm run check:deployment
```

### 3. Деплой контракта
```bash
npm run deploy:sepolia
```

## ⏱️ Время деплоя
- **Компиляция:** 30-60 секунд
- **Деплой транзакция:** 1-3 минуты
- **Подтверждение:** 15-30 секунд
- **Общее время:** 2-5 минут

## 🔍 Как понять что деплой завершился

### ✅ Успешный деплой:
```
🚀 Deploying ImprovedProxySwap with fee management...
📍 Deployer address: 0x...
💰 Deployer balance: 0.05 ETH
📦 Deploying ImprovedProxySwap contract...
✅ ImprovedProxySwap deployed to: 0x1234567890123456789012345678901234567890
🔧 Setting up basic exchange rates...
📈 Set ETH -> USDC rate
📈 Set ETH -> USDT rate
...
🎉 Deployment completed successfully!
📝 To update constants.ts:
export const PROXY_SWAP_ADDRESS = '0x1234567890123456789012345678901234567890';
```

### ❌ Ошибки деплоя:
- **"insufficient funds"** - нужно больше ETH
- **"nonce too high"** - попробуйте еще раз
- **"replacement transaction underpriced"** - увеличьте gas price

## 🔄 После деплоя

### 1. Обновите адрес контракта
Скопируйте адрес из вывода деплоя и обновите файл:
```typescript
// src/app/utils/constants.ts
export const PROXY_SWAP_ADDRESS = '0x_ВАШ_НОВЫЙ_АДРЕС_КОНТРАКТА_';
```

### 2. Коммит и push
```bash
git add .
git commit -m "Обновлен адрес контракта после деплоя в Sepolia"
git push origin testnet
```

### 3. Проверьте Vercel
Через 1-2 минуты на https://crypto-exchanger-testnet.vercel.app/ должно появиться:
- ✅ Исчезнет сообщение "Контракт не задеплоен"
- ✅ Кнопка "Обменять" станет активной
- ✅ Можно будет тестировать свапы

## 📊 Мониторинг контракта
- **Etherscan Sepolia:** https://sepolia.etherscan.io/address/ВАШ_АДРЕС
- **Транзакции деплоя:** сохраняются в файл `localhost-deployment.json`

## 🔧 Полезные команды после деплоя
```bash
# Проверить баланс контракта
npx hardhat run scripts/check-balances.js --network sepolia

# Проверить курсы обмена
npx hardhat console --network sepolia
```
