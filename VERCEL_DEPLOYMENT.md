# 🚀 Деплой на Vercel - Пошаговая инструкция

## 📋 Что такое Vercel?
Vercel - это платформа для деплоя Next.js приложений. Идеально подходит для вашего crypto-exchanger!

## 🎯 Преимущества Vercel:
- ✅ Автоматический деплой из GitHub
- ✅ Бесплатный план (достаточно для старта)
- ✅ Автоматические HTTPS сертификаты
- ✅ CDN по всему миру
- ✅ Простая настройка переменных окружения

## 📝 Пошаговая инструкция:

### 1. Подготовка GitHub репозитория
```bash
# Если еще не создали репозиторий:
git remote add origin https://github.com/ВАШ_USERNAME/crypto-exchanger.git
git push -u origin main
```

### 2. Регистрация на Vercel
1. Идите на https://vercel.com
2. Нажмите "Sign Up"
3. Выберите "Continue with GitHub" 
4. Авторизуйтесь через GitHub

### 3. Импорт проекта
1. На главной странице Vercel нажмите "New Project"
2. Найдите ваш репозиторий `crypto-exchanger`
3. Нажмите "Import"

### 4. Настройка проекта
```
Project Name: crypto-exchanger
Framework Preset: Next.js (автоматически определится)
Root Directory: ./
Build Command: npm run build (автоматически)
Output Directory: .next (автоматически)
Install Command: npm install (автоматически)
```

### 5. Настройка переменных окружения
В разделе "Environment Variables" добавьте:

```bash
# Обязательные переменные:
NEXT_PUBLIC_PROJECT_ID = ваш-проект-id-от-walletconnect
NEXT_PUBLIC_RPC_URL = https://mainnet.infura.io/v3/ВАШ_КЛЮЧ
NEXT_PUBLIC_CHAIN_ID = 1

# НЕ добавляйте приватный ключ на Vercel!
# Деплой контрактов делайте локально
```

### 6. Деплой!
1. Нажмите "Deploy"
2. Ждите 2-3 минуты
3. Получите ссылку вида: `https://crypto-exchanger-xyz.vercel.app`

## ⚙️ Автоматическая настройка переменных

Давайте создадим правильный .env.example для Vercel:

```bash
# .env.local для разработки
NEXT_PUBLIC_PROJECT_ID=your-walletconnect-project-id
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/your-infura-key
NEXT_PUBLIC_CHAIN_ID=1
DEPLOYER_PRIVATE_KEY=0x... # НЕ загружать на Vercel!

# .env.production для Vercel
NEXT_PUBLIC_PROJECT_ID=your-production-project-id
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/your-production-infura-key
NEXT_PUBLIC_CHAIN_ID=1
```

## 🔧 Автоматические деплои

После настройки каждый push в main ветку будет автоматически деплоить новую версию!

```bash
# Внесли изменения:
git add .
git commit -m "Обновил UI"
git push origin main

# Vercel автоматически задеплоит обновление!
```

## 📊 Мониторинг

В панели Vercel вы сможете:
- ✅ Смотреть логи деплоев
- ✅ Мониторить трафик
- ✅ Настраивать домены
- ✅ Смотреть аналитику

## 🎯 После деплоя на Vercel:

1. **Деплоим контракт локально:**
```bash
npm run mainnet:deploy-improved
```

2. **Обновляем адрес контракта в коде**
3. **Пушим изменения:**
```bash
git add .
git commit -m "Обновил адрес контракта"
git push origin main
```

4. **Vercel автоматически обновит сайт!**

## 💡 Полезные советы:

### Кастомный домен (опционально)
- Можете привязать свой домен типа `crypto-exchange.com`
- Vercel автоматически настроит HTTPS

### Переменные для production
- Используйте отдельные ключи для production
- Никогда не загружайте приватные ключи на Vercel

### Мониторинг ошибок
- Vercel показывает все ошибки в реальном времени
- Логи доступны в панели управления

---

**🎉 Готово! Ваш crypto-exchanger будет доступен по ссылке Vercel через несколько минут!**
