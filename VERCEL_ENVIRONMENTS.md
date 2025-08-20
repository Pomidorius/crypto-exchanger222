# 🚀 Настройка двух сред в одном Vercel проекте

## 🎯 Один проект - два режима работы

Вместо создания нового проекта, настроим **переключение сред** в существующем!

## ✅ Вариант 1: Environment Branches (РЕКОМЕНДУЕТСЯ)

### 1. Создать ветки для разных сред:
```bash
# Ветка для тестирования (Sepolia):
git checkout -b testnet
git push origin testnet

# Ветка для продакшена (Mainnet):
git checkout -b production  
git push origin production
```

### 2. Настроить в Vercel Settings → Git:
- **Production Branch**: `production` (Mainnet)
- **Preview Branches**: `testnet` (Sepolia)
- **Development Branch**: `main` (разработка)

### 3. Переменные для каждой ветки:
**Production (Mainnet):**
```
NEXT_PUBLIC_RPC_URL = https://mainnet.infura.io/v3/2643d99854284063b2852bea3af7e04a
NEXT_PUBLIC_CHAIN_ID = 1
```

**Preview/Testnet (Sepolia):**
```
NEXT_PUBLIC_RPC_URL = https://sepolia.infura.io/v3/2643d99854284063b2852bea3af7e04a
NEXT_PUBLIC_CHAIN_ID = 11155111
```

## ✅ Вариант 2: Переключатель в UI

Добавить кнопку переключения прямо в интерфейс:

```typescript
// NetworkSwitcher.tsx
export function NetworkSwitcher() {
  const [isTestnet, setIsTestnet] = useState(true)
  
  return (
    <div className="network-switcher">
      <button onClick={() => setIsTestnet(!isTestnet)}>
        {isTestnet ? '🧪 Тестнет' : '🔴 Mainnet'}
      </button>
    </div>
  )
}
```

## ✅ Вариант 3: Поддомены

Vercel автоматически создаст:
- `crypto-exchanger-testnet-branch.vercel.app` (тестнет)
- `crypto-exchanger.vercel.app` (продакшен)

## 🎯 Результат:

### Для пользователей:
1. **Тестовая ссылка**: Безопасное тестирование с Sepolia
2. **Продакшн ссылка**: Реальная работа с Mainnet
3. **Один проект**: Простота управления

### Для вас:
- 📊 **Единая аналитика** в Vercel
- 🔧 **Простое управление** переменными
- 🚀 **Автоматические деплои** для каждой ветки
- 💰 **Один биллинг** вместо двух проектов

## 🚀 Пошаговый план:

### Шаг 1: Создать ветки
```bash
# Создаем testnet ветку:
git checkout -b testnet
git push origin testnet

# Возвращаемся в main:
git checkout main
```

### Шаг 2: Настроить Vercel
- Settings → Git → Branch Configuration
- Добавить переменные для каждой среды

### Шаг 3: Деплоить контракты
```bash
# Для тестнета:
git checkout testnet
npm run deploy:sepolia

# Для продакшена:
git checkout main  
npm run deploy:mainnet
```

### Шаг 4: Получить ссылки
- Testnet: `crypto-exchanger-git-testnet-yourname.vercel.app`
- Production: `crypto-exchanger.vercel.app`

---
**🎉 Один проект - максимум возможностей!**
