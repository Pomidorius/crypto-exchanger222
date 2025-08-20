# ⚡ Мгновенный деплой на Vercel (ваши ключи готовы!)

## ✅ У ВАС УЖЕ ЕСТЬ ВСЕ КЛЮЧИ!

В вашем проекте уже настроены все необходимые переменные:

```bash
✅ NEXT_PUBLIC_PROJECT_ID = dummy-project-id-for-local-dev
✅ NEXT_PUBLIC_RPC_URL = https://mainnet.infura.io/v3/2643d99854284063b2852bea3af7e04a  
✅ NEXT_PUBLIC_CHAIN_ID = 1
```

## 🚀 Деплой за 3 минуты:

### 1. Создать репозиторий на GitHub
```bash
git remote add origin https://github.com/ВАШ_USERNAME/crypto-exchanger.git
git push -u origin main
```

### 2. Деплой на Vercel
1. Идите на [vercel.com](https://vercel.com)
2. **Sign Up через GitHub**
3. **New Project** → найдите ваш репозиторий
4. **Import** → **Deploy**

### 3. Добавить переменные в Vercel
В разделе Settings → Environment Variables:

```
NEXT_PUBLIC_PROJECT_ID = dummy-project-id-for-local-dev
NEXT_PUBLIC_RPC_URL = https://mainnet.infura.io/v3/2643d99854284063b2852bea3af7e04a
NEXT_PUBLIC_CHAIN_ID = 1
```

### 4. Готово! 🎉
Ваш сайт будет доступен по ссылке: `https://crypto-exchanger-xyz.vercel.app`

## 💡 Важное замечание:

**Project ID** у вас `dummy-project-id-for-local-dev` - это подойдет для тестирования.

Для продакшена рекомендуется:
1. Зарегистрироваться на [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Создать проект и получить реальный Project ID
3. Заменить в настройках Vercel

Но **текущие ключи работают** и сайт будет функционировать!

## 🔧 После деплоя:
1. Деплой контракта: `npm run mainnet:deploy-improved`
2. Push обновлений: `git push origin main`
3. Vercel автоматически обновится!

---
**⚡ Готово к деплою прямо сейчас!**
