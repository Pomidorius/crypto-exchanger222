# 🔧 ПЕРЕКЛЮЧЕНИЕ METAMASK НА SEPOLIA

## 🚨 ПРОБЛЕМА:
MetaMask подключен к Localhost, а приложение настроено на Sepolia Testnet

## ✅ РЕШЕНИЕ (3 минуты):

### СПОСОБ 1: Автоматическое добавление через Chainlist

1. **Открой сайт**: https://chainlist.org/chain/11155111
2. **Нажми "Connect Wallet"** - подключи MetaMask
3. **Нажми "Add to MetaMask"** - автоматически добавит Sepolia
4. **Подтверди в MetaMask** - согласись добавить сеть

### СПОСОБ 2: Ручное добавление в MetaMask

1. **Открой MetaMask**
2. **Нажми на dropdown сетей** (вверху, где написано "Localhost")
3. **Выбери "Add network"**
4. **Нажми "Add a network manually"**
5. **Заполни данные**:

```
Network Name: Sepolia
RPC URL: https://sepolia.infura.io/v3/2643d99854284063b2852bea3af7e04a
Chain ID: 11155111
Currency Symbol: SepoliaETH
Block Explorer: https://sepolia.etherscan.io
```

6. **Нажми "Save"**
7. **Переключись на Sepolia** в dropdown сетей

### СПОСОБ 3: Быстрое переключение (если Sepolia уже добавлена)

1. **Открой MetaMask**
2. **Нажми dropdown сетей** (где написано "Localhost")
3. **Выбери "Sepolia test network"**

## 🎯 РЕЗУЛЬТАТ:

После переключения на Sepolia вы увидите:
- ✅ "Sepolia Testnet - Демо режим" в приложении
- ✅ Исчезнет сообщение "Неправильная сеть!"
- ✅ Приложение заработает полностью

## 💰 НУЖНЫ ТЕСТОВЫЕ ТОКЕНЫ?

После переключения на Sepolia:

### Получить SepoliaETH для газа:
- **Faucet 1**: https://sepoliafaucet.com
- **Faucet 2**: https://sepolia-faucet.pk910.de
- **Faucet 3**: https://www.alchemy.com/faucets/ethereum-sepolia

### Как получить:
1. Скопируй адрес кошелька из MetaMask
2. Вставь на любом faucet
3. Нажми "Send Me ETH"
4. Жди 1-2 минуты

## 🔍 ПРОВЕРКА:

После переключения на Sepolia проверь:
1. **Название сети в MetaMask**: должно быть "Sepolia"
2. **Chain ID**: 11155111
3. **Баланс**: SepoliaETH (получи с faucet если нужно)
4. **Приложение**: должно показать "✅ Sepolia Testnet"

## ⚠️ ВАЖНО:

- **НЕ используй реальные ETH** на Sepolia - это testnet
- **Все операции бесплатные** - только тестовые токены
- **Приватные ключи в безопасности** - testnet не влияет на mainnet кошелек
