# 🎉 ГОТОВО! Два режима в одном Vercel проекте

## ✅ Что настроено:

### 🧪 Testnet ветка (безопасное тестирование)
- **Ветка**: `testnet`  
- **Сеть**: Sepolia тестнет
- **Ссылка**: `crypto-exchanger-git-testnet-yourname.vercel.app`
- **ETH**: Бесплатные тестовые с кранов

### 🔴 Main ветка (реальная торговля)
- **Ветка**: `main`
- **Сеть**: Ethereum Mainnet  
- **Ссылка**: `crypto-exchanger.vercel.app`
- **ETH**: Настоящие криптовалюты

## 🚀 Настройка в Vercel:

### 1. Импортировать проект (если еще не сделано)
- Vercel подхватит обе ветки автоматически

### 2. Настроить переменные для Production (main ветка):
```
NEXT_PUBLIC_PROJECT_ID = dummy-project-id-for-local-dev
NEXT_PUBLIC_RPC_URL = https://mainnet.infura.io/v3/2643d99854284063b2852bea3af7e04a
NEXT_PUBLIC_CHAIN_ID = 1
```

### 3. Настроить переменные для Preview (testnet ветка):
```
NEXT_PUBLIC_PROJECT_ID = dummy-project-id-for-local-dev  
NEXT_PUBLIC_RPC_URL = https://sepolia.infura.io/v3/2643d99854284063b2852bea3af7e04a
NEXT_PUBLIC_CHAIN_ID = 11155111
```

### 4. Git Settings в Vercel:
- **Production Branch**: `main` (mainnet)
- **Preview Branches**: `testnet` (sepolia)

## 🎯 Результат:

### Для пользователей:
1. **Тестовая ссылка**: Пробуют функционал с бесплатными ETH
2. **Продакшн ссылка**: Реальная торговля с прибылью для вас

### Для вас:
- 📊 **Единая панель** управления в Vercel
- 🔄 **Автоматические деплои** для каждой ветки
- 💰 **Один проект** вместо двух
- 📈 **Общая аналитика** и статистика

## 🔧 Деплой контрактов:

### Для тестнета:
```bash
git checkout testnet
npm run deploy:sepolia
git add . && git commit -m "Обновил адрес контракта Sepolia"
git push origin testnet
```

### Для продакшена:
```bash  
git checkout main
npm run deploy:mainnet
git add . && git commit -m "Обновил адрес контракта Mainnet"
git push origin main
```

## 🎉 Готово!

**Один проект - максимум возможностей:**
- ✅ Безопасное тестирование
- ✅ Реальная торговля  
- ✅ Автоматические деплои
- ✅ Простое управление

---
**Пользователи сначала тестируют, потом переходят к реальной торговле! 🚀**
