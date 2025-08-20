# ⚡ Быстрое переключение на Sepolia тестнет

## 🎯 Для безопасного тестирования на Vercel

### 1. Обновить переменные в Vercel
В Settings → Environment Variables замените:

**NEXT_PUBLIC_RPC_URL:**
```
https://sepolia.infura.io/v3/2643d99854284063b2852bea3af7e04a
```

**NEXT_PUBLIC_CHAIN_ID:**
```
11155111
```

### 2. Деплой контракта на Sepolia (локально)
```bash
# Обновить .env.local:
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/2643d99854284063b2852bea3af7e04a
NEXT_PUBLIC_CHAIN_ID=11155111

# Деплоить контракт:
npm run deploy:sepolia
```

### 3. Redeploy на Vercel
После обновления переменных → Redeploy

## ✅ Результат:

### Для пользователей:
- 🧪 **Безопасное тестирование** без риска
- 💧 **Бесплатные ETH** с кранов
- ⚡ **Быстрые транзакции**
- 🎨 **Красивое уведомление** о тестовой сети

### Ссылки для пользователей:
- **Получить тестовые ETH**: https://sepoliafaucet.com/
- **Добавить Sepolia в MetaMask**: https://chainlist.org/chain/11155111

## 🔄 Переключение обратно на mainnet:

**NEXT_PUBLIC_RPC_URL:**
```
https://mainnet.infura.io/v3/2643d99854284063b2852bea3af7e04a
```

**NEXT_PUBLIC_CHAIN_ID:**
```
1
```

---
**🎉 Теперь пользователи могут безопасно тестировать функционал!**
