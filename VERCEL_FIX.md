# 🔧 Исправление ошибки переменных окружения в Vercel

## ❌ Проблема:
```
Environment Variable "NEXT_PUBLIC_PROJECT_ID" references Secret "next_public_project_id", which does not exist.
```

## ✅ Решение:

### 1. Очистили vercel.json
Убрали автоматические ссылки на секреты - теперь переменные нужно добавить вручную.

### 2. Добавить переменные вручную в Vercel:

1. **Откройте ваш проект в Vercel Dashboard**
2. **Перейдите в Settings → Environment Variables**
3. **Добавьте каждую переменную по отдельности:**

#### Переменная 1:
```
Name: NEXT_PUBLIC_PROJECT_ID
Value: dummy-project-id-for-local-dev
```

#### Переменная 2:
```
Name: NEXT_PUBLIC_RPC_URL  
Value: https://mainnet.infura.io/v3/2643d99854284063b2852bea3af7e04a
```

#### Переменная 3:
```
Name: NEXT_PUBLIC_CHAIN_ID
Value: 1
```

### 3. Redeploy проект
После добавления переменных:
1. **Перейдите в Deployments**
2. **Нажмите на последний деплой**
3. **Нажмите "Redeploy"**

## 🎯 Альтернативный способ:

Можете также добавить переменные при самом первом деплое:
1. При импорте проекта в Vercel
2. В разделе "Environment Variables" 
3. Добавить все три переменные сразу

## ✅ После исправления:
- Ошибка исчезнет
- Проект успешно задеплоится
- Все функции будут работать

---
**Проблема решена! Теперь можно деплоить без ошибок.**
