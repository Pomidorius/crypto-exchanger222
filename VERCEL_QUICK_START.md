# 🚀 Быстрый деплой на Vercel

## 1-минутная инструкция для деплоя вашего crypto-exchanger на Vercel:

### 🔥 Экспресс-деплой:

1. **Заходим на [vercel.com](https://vercel.com)**
2. **Sign Up через GitHub**
3. **New Project → Import вашего репозитория**
4. **Добавляем переменные окружения:**
   ```
   NEXT_PUBLIC_PROJECT_ID = ваш-walletconnect-id
   NEXT_PUBLIC_RPC_URL = https://mainnet.infura.io/v3/ваш-ключ
   NEXT_PUBLIC_CHAIN_ID = 1
   ```
5. **Deploy!**

### 🎯 Результат:
- Ваш сайт будет доступен по ссылке `https://crypto-exchanger-xxx.vercel.app`
- Автоматические обновления при каждом push в GitHub
- Бесплатный HTTPS и CDN

### 📋 Что нужно:
- [x] GitHub аккаунт
- [x] WalletConnect Project ID (бесплатно на cloud.walletconnect.com)
- [x] Infura API Key (бесплатно на infura.io)

### ⚡ После деплоя:
1. Деплоите контракт локально: `npm run mainnet:deploy-improved`
2. Пушите обновленный адрес контракта
3. Vercel автоматически обновит сайт!

---
**🎉 Готово! Ваш криптообменник в интернете за 5 минут!**
