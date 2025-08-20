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
В разделе "Environment Variables" добавьте (у вас уже есть эти ключи в .env.local):

```bash
# Обязательные переменные (ваши текущие значения):
NEXT_PUBLIC_PROJECT_ID = dummy-project-id-for-local-dev
NEXT_PUBLIC_RPC_URL = https://mainnet.infura.io/v3/2643d99854284063b2852bea3af7e04a
NEXT_PUBLIC_CHAIN_ID = 1

# ✅ Эти ключи уже настроены в вашем проекте!
# НЕ добавляйте приватный ключ на Vercel!
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

### 🌐 Мульти-сетевая архитектура

Ваш проект теперь поддерживает автоматическое переключение между сетями:

1. **Localhost (разработка):** Использует моковые токены
2. **Sepolia (тестирование):** Для безопасного тестирования на Vercel
3. **Mainnet (продакшен):** Реальные токены в production

### 📋 Настройка разных сред:

#### 🏠 Для Production (Mainnet):
```bash
# Environment Variables на Vercel:
NEXT_PUBLIC_PROJECT_ID = your-walletconnect-project-id
NEXT_PUBLIC_RPC_URL = https://mainnet.infura.io/v3/your-key  
NEXT_PUBLIC_CHAIN_ID = 1
```

#### 🧪 Для Preview/Testing (Sepolia):
```bash
# Environment Variables для preview ветки:
NEXT_PUBLIC_PROJECT_ID = your-walletconnect-project-id
NEXT_PUBLIC_RPC_URL = https://sepolia.infura.io/v3/your-key
NEXT_PUBLIC_CHAIN_ID = 11155111
```

### 🚀 Деплой контрактов:

#### Для Sepolia (безопасное тестирование):
```bash
# Сначала деплоим в Sepolia для тестов
npx hardhat run scripts/deploy-simple.js --network sepolia

# Обновляем адрес в constants.ts:
CONTRACT_ADDRESSES['11155111'] = 'новый_адрес_в_sepolia'
```

#### Для Mainnet (продакшен):
```bash  
# Деплоим в mainnet
npx hardhat run scripts/deploy-simple.js --network mainnet

# Обновляем адрес в constants.ts:
CONTRACT_ADDRESSES['1'] = 'новый_адрес_в_mainnet'
```

### 🔄 Автообновление:
```bash
git add .
git commit -m "Обновил адреса контрактов"
git push origin main  # Автоматический деплой на Vercel!
```

### 📊 Статусы сетей:

- ✅ **Localhost:** Показывает "Development - Local Network"
- 🧪 **Sepolia:** Показывает "Testing - Sepolia Testnet"  
- 🚀 **Mainnet:** Показывает "Production - Ethereum Mainnet"
- ⚠️ **Неподдерживаемая сеть:** Показывает предупреждение

Теперь любой пользователь на Vercel сможет:
1. **Безопасно тестировать** с тестовыми токенами (если подключится к Sepolia)
2. **Использовать реальные токены** (если подключится к Mainnet)
3. **Видеть статус сети** и понимать где он находится

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
