# ⚡ Мгновенный импорт в Vercel

## 🚀 Быстрый импорт проекта

**Кликните на кнопку ниже для автоматического импорта:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/Pomidorius/crypto-exchanger222&project-name=crypto-exchanger&repository-name=crypto-exchanger)

## 📋 Или ручной импорт:

### 1. Прямая ссылка:
```
https://vercel.com/new/git/external?repository-url=https://github.com/Pomidorius/crypto-exchanger222
```

### 2. Через Dashboard:
1. [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository**
3. Найти `crypto-exchanger222`
4. **Import**

## ⚙️ Переменные окружения:

**После импорта добавить в Settings → Environment Variables:**

### Production:
```
NEXT_PUBLIC_PROJECT_ID = dummy-project-id-for-local-dev
NEXT_PUBLIC_RPC_URL = https://mainnet.infura.io/v3/2643d99854284063b2852bea3af7e04a
NEXT_PUBLIC_CHAIN_ID = 1
```

### Preview (для testnet ветки):
```
NEXT_PUBLIC_PROJECT_ID = dummy-project-id-for-local-dev
NEXT_PUBLIC_RPC_URL = https://sepolia.infura.io/v3/2643d99854284063b2852bea3af7e04a
NEXT_PUBLIC_CHAIN_ID = 11155111
```

## ✅ Результат:

После импорта получите:
- **Production**: `crypto-exchanger.vercel.app` (Mainnet)
- **Preview**: `crypto-exchanger-git-testnet.vercel.app` (Sepolia)

---
**🎯 Импорт займет 2-3 минуты!**
