# 🔧 Решение ошибки 404: DEPLOYMENT_NOT_FOUND

## ❌ Проблема:
```
404: NOT_FOUND
Code: DEPLOYMENT_NOT_FOUND
ID: fra1::p52v6-1755687498072-92517b78397a
```

## ✅ Пошаговое решение:

### 1. Проверить статус проекта в Vercel
- Зайдите в [Vercel Dashboard](https://vercel.com/dashboard)
- Найдите ваш проект `crypto-exchanger`
- Проверьте статус последнего деплоя

### 2. Если проект еще не импортирован:

#### Вариант A: Импорт через Dashboard
1. **New Project** на vercel.com
2. **Import Git Repository**
3. Выберите `crypto-exchanger222` репозиторий
4. **Deploy**

#### Вариант B: Прямая ссылка импорта
Используйте эту ссылку для автоматического импорта:
```
https://vercel.com/new/git/external?repository-url=https://github.com/Pomidorius/crypto-exchanger222
```

### 3. Настроить переменные окружения:

#### Для Production (main ветка):
```
NEXT_PUBLIC_PROJECT_ID = dummy-project-id-for-local-dev
NEXT_PUBLIC_RPC_URL = https://mainnet.infura.io/v3/2643d99854284063b2852bea3af7e04a
NEXT_PUBLIC_CHAIN_ID = 1
```

#### Для Preview (testnet ветка):
```
NEXT_PUBLIC_PROJECT_ID = dummy-project-id-for-local-dev
NEXT_PUBLIC_RPC_URL = https://sepolia.infura.io/v3/2643d99854284063b2852bea3af7e04a
NEXT_PUBLIC_CHAIN_ID = 11155111
```

### 4. Если проект уже существует, но падает:

#### Проверить логи:
1. Vercel Dashboard → ваш проект
2. **Deployments** → кликнуть на последний деплой
3. **View Build Logs** - посмотреть ошибки

#### Часто встречающиеся проблемы:
- ❌ **Отсутствуют переменные окружения**
- ❌ **Ошибки сборки Next.js**
- ❌ **Неправильная конфигурация**

### 5. Принудительный редеплой:
1. Vercel Dashboard → ваш проект
2. **Deployments**
3. Найти последний деплой → **⋯** → **Redeploy**

## 🚀 Альтернативный метод - Vercel CLI:

### Установить Vercel CLI:
```bash
npm i -g vercel
```

### Деплой через CLI:
```bash
cd crypto-exchanger-main
vercel --prod
```

### Установить переменные через CLI:
```bash
vercel env add NEXT_PUBLIC_PROJECT_ID
vercel env add NEXT_PUBLIC_RPC_URL  
vercel env add NEXT_PUBLIC_CHAIN_ID
```

## 🔍 Диагностика проблемы:

### Проверить GitHub репозиторий:
- Убедитесь что репозиторий `crypto-exchanger222` публичный
- Или дайте Vercel доступ к приватным репозиториям

### Проверить package.json:
- Убедитесь что есть скрипт `"build": "next build"`
- Проверьте что все зависимости установлены

### Проверить Next.js конфигурацию:
- `next.config.js` должен быть валидным
- Нет синтаксических ошибок

## 💡 Быстрое решение:

1. **Удалить проект** из Vercel (если есть)
2. **Заново импортировать** через эту ссылку:
   ```
   https://vercel.com/new/git/external?repository-url=https://github.com/Pomidorius/crypto-exchanger222
   ```
3. **Добавить переменные окружения**
4. **Deploy**

## 📞 Если ничего не помогает:

### Создать минимальный проект:
```bash
# Создать простой тест:
npx create-next-app@latest test-deployment
cd test-deployment
vercel --prod
```

Если тестовый проект работает, значит проблема в конфигурации основного проекта.

---
**🎯 В 90% случаев помогает переимпорт проекта с правильными переменными!**
