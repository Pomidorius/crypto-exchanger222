# 🎯 ДЛЯ КЛИЕНТА: Что нужно сделать перед деплоем

## 🚨 ТЕКУЩИЙ СТАТУС: НЕ ГОТОВ

Проект настроен, но нужно выполнить 4 простых шага для полной готовности.

## 📋 ЧТО НУЖНО СДЕЛАТЬ:

### 1️⃣ ПОЛУЧИТЬ API КЛЮЧИ (5 минут)

#### Infura RPC:
1. Идем на https://infura.io/register
2. Создаем бесплатный аккаунт  
3. Create New Project → Web3 API
4. Копируем: **Sepolia** endpoint URL
   ```
   https://sepolia.infura.io/v3/abc123def456...
   ```

#### WalletConnect:
1. Идем на https://cloud.walletconnect.com/
2. Создаем бесплатный аккаунт
3. Create Project
4. Копируем: **Project ID**
   ```
   a1b2c3d4-e5f6-7890-abcd-ef1234567890
   ```

### 2️⃣ ПОЛУЧИТЬ ТЕСТОВЫЕ ETH (2 минуты)

1. Идем на https://sepoliafaucet.com/
2. Подключаем MetaMask
3. Переключаемся на Sepolia Network
4. Запрашиваем 0.5 ETH (бесплатно)

### 3️⃣ ЗАДЕПЛОИТЬ КОНТРАКТ (5 минут)

```bash
# В корне проекта создать файл .env:
echo "DEPLOYER_PRIVATE_KEY=your_metamask_private_key" > .env

# Как получить приватный ключ:
# MetaMask → Account Details → Export Private Key → Скопировать

# Деплой контракта:
npm run deploy:sepolia

# Результат:
# ✅ Contract deployed!
# 📍 Address: 0x1234567890123456789012345678901234567890
# Скопировать этот адрес!
```

### 4️⃣ НАСТРОИТЬ VERCEL (2 минуты)

В Vercel Dashboard → Project Settings → Environment Variables:

```bash
NEXT_PUBLIC_CHAIN_ID = 11155111
NEXT_PUBLIC_RPC_URL = https://sepolia.infura.io/v3/ВАШ_КЛЮЧ_ИЗ_ШАГА_1
NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA = 0xАДРЕС_ИЗ_ШАГА_3  
NEXT_PUBLIC_PROJECT_ID = ВАШ_ID_ИЗ_ШАГА_1
```

Затем:
```bash
git push origin main  # Vercel автоматически задеплоит
```

## ✅ РЕЗУЛЬТАТ:

После выполнения получите:
- 🌐 Рабочую ссылку: `your-project.vercel.app`
- 🧪 Полностью функциональный DEX на Sepolia testnet
- 💼 Готовую демо-версию для показа клиентам/инвесторам
- ⚡ Мгновенные обмены ETH ↔ USDC ↔ USDT

## 🛟 ЕСЛИ ЧТО-ТО НЕ РАБОТАЕТ:

### Проблема: Build fails
**Решение**: Проверьте все 4 environment variables в Vercel

### Проблема: Contract not found  
**Решение**: Убедитесь что `NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA` правильный

### Проблема: RPC errors
**Решение**: Проверьте `NEXT_PUBLIC_RPC_URL` от Infura

### Проблема: Wallet not connecting
**Решение**: Проверьте `NEXT_PUBLIC_PROJECT_ID` от WalletConnect

## 🎯 ОЦЕНКА ВРЕМЕНИ:

- **API ключи**: 5 минут
- **Тестовые ETH**: 2 минуты  
- **Деплой контракта**: 5 минут
- **Настройка Vercel**: 2 минуты
- **Тестирование**: 5 минут

**ИТОГО: ~20 минут до полностью рабочего продукта!**

---

## 📞 ПОДДЕРЖКА:

Если нужна помощь - читайте подробные инструкции в `VERCEL_READY_CHECKLIST.md`
