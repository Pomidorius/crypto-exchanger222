// src/app/components/ImprovedSwapForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { quoteExactInput, TokenMap } from '../utils/uniswap'
import toast from 'react-hot-toast'

// Список доступных токенов
const TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', icon: '⟠', color: '#627eea' },
  { symbol: 'USDC', name: 'USD Coin', icon: '💵', color: '#2775ca' },
  { symbol: 'USDT', name: 'Tether USD', icon: '💲', color: '#26a17b' },
  { symbol: 'WETH', name: 'Wrapped ETH', icon: '🔄', color: '#627eea' }
]

export function ImprovedSwapForm() {
  const { address, isConnected } = useAccount()

  // Состояние формы
  const [fromToken, setFromToken] = useState('ETH')
  const [toToken, setToToken] = useState('USDC')
  const [amount, setAmount] = useState('')
  const [quote, setQuote] = useState('0')
  const [slippage, setSlippage] = useState(0.5)
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Предустановленные значения slippage
  const slippageOptions = [0.1, 0.5, 1.0]

  // Функции для форматирования
  const formatTokenAmount = (amount: string, tokenSymbol: string) => {
    if (!amount || amount === '0') return '0'
    const tokenInfo = TokenMap[tokenSymbol]
    if (!tokenInfo) return '0'
    const formatted = Number(amount) / Math.pow(10, tokenInfo.decimals)
    return formatted.toFixed(tokenInfo.decimals === 18 ? 6 : tokenInfo.decimals)
  }

  const getExchangeRate = () => {
    if (!amount || amount === '0' || !quote || quote === '0') return '0'
    const amountNum = Number(amount)
    const quoteFormatted = Number(formatTokenAmount(quote, toToken))
    return (quoteFormatted / amountNum).toFixed(6)
  }

  const getEstimatedOutput = () => {
    if (!quote || quote === '0') return '0'
    return formatTokenAmount(quote, toToken)
  }

  // Баланс пользователя для выбранного токена
  const { data: balanceData } = useBalance({
    address: mounted ? address : undefined,
    token: fromToken === 'ETH' ? undefined : (TokenMap[fromToken]?.address as `0x${string}`)
  })
  
  const balance = balanceData ? Number(balanceData.formatted) : 0

  // Валидация
  const amountNum = Number(amount)
  const isAmountValid = amountNum > 0 && amountNum <= balance
  const amountError = !amount ? '' :
    amountNum <= 0 ? 'Введите сумму больше нуля' :
    amountNum > balance ? `Недостаточно средств (макс. ${balance.toFixed(6)})` : ''

  // Получение котировки
  useEffect(() => {
    if (!mounted || !isConnected || !amount || amountNum <= 0) {
      setQuote('0')
      return
    }

    const getQuote = async () => {
      setIsLoading(true)
      try {
        const { quotedAmount } = await quoteExactInput(
          fromToken, toToken, amount, slippage
        )
        setQuote(quotedAmount)
      } catch (error) {
        console.error('Quote error:', error)
        setQuote('0')
        toast.error('Ошибка получения котировки')
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(getQuote, 500)
    return () => clearTimeout(debounceTimer)
  }, [fromToken, toToken, amount, slippage, isConnected, mounted, amountNum])

  // Функция обмена токенов местами
  const handleFlipTokens = () => {
    const tempToken = fromToken
    setFromToken(toToken)
    setToToken(tempToken)
    setAmount('')
    setQuote('0')
  }

  // Функция установки максимальной суммы
  const handleMaxAmount = () => {
    if (balance > 0) {
      // Оставляем немного ETH для газа
      const maxAmount = fromToken === 'ETH' ? Math.max(0, balance - 0.01) : balance
      setAmount(maxAmount.toString())
    }
  }

  // Основная функция свапа
  const handleSwap = async () => {
    if (!isConnected || !address) {
      toast.error('Подключите кошелёк')
      return
    }
    
    if (!isAmountValid) {
      toast.error(amountError)
      return
    }

    if (!quote || quote === '0') {
      toast.error('Нет доступной котировки')
      return
    }

    setIsSwapping(true)
    const toastId = toast.loading('Выполняется обмен...')

    try {
      // Импортируем функцию свапа
      const { executeSwap } = await import('../utils/swap')
      
      const txHash = await executeSwap({
        fromToken,
        toToken,
        amount,
        slippage,
        userAddress: address
      })
      
      toast.success(`Обмен выполнен! Транзакция: ${txHash.slice(0, 10)}...`, { 
        id: toastId,
        duration: 5000
      })
      
      // Очищаем форму после успешного свапа
      setAmount('')
      setQuote('0')
      
      // Записываем транзакцию в лог
      const swapLog = {
        id: Date.now().toString(),
        type: 'swap',
        from: `${amount} ${fromToken}`,
        to: `${getEstimatedOutput()} ${toToken}`,
        amount: `$${(Number(amount) * (fromToken === 'ETH' ? 3500 : 1)).toFixed(2)}`,
        timestamp: new Date().toLocaleString('ru-RU'),
        status: 'success',
        txHash
      }
      
      // Сохраняем в localStorage для отображения в истории
      const existingLogs = JSON.parse(localStorage.getItem('swapLogs') || '[]')
      existingLogs.unshift(swapLog)
      localStorage.setItem('swapLogs', JSON.stringify(existingLogs.slice(0, 50))) // Храним последние 50
      
    } catch (error: unknown) {
      console.error('Swap error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при выполнении обмена'
      toast.error(errorMessage, { id: toastId })
    } finally {
      setIsSwapping(false)
    }
  }

  if (!mounted) {
    return (
      <div className="swap-form">
        <div className="loading-placeholder">
          <div className="loading-shimmer"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="swap-form">
      {/* FROM Section */}
      <div className="swap-section">
        <div className="section-header">
          <span className="section-label">Вы отдаёте</span>
          {isConnected && (
            <span className="balance-info">
              Баланс: {balance.toFixed(6)} {fromToken}
            </span>
          )}
        </div>
        
        <div className="token-input-container">
          <div className="token-selector">
            <select 
              value={fromToken} 
              onChange={(e) => setFromToken(e.target.value)}
              className="token-select"
            >
              {TOKENS.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.icon} {token.symbol}
                </option>
              ))}
            </select>
          </div>
          
          <div className="amount-input-container">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="amount-input"
              step="any"
              min="0"
            />
            {isConnected && balance > 0 && (
              <button 
                onClick={handleMaxAmount}
                className="max-button"
              >
                MAX
              </button>
            )}
          </div>
        </div>
        
        {amountError && (
          <div className="error-message">{amountError}</div>
        )}
      </div>

      {/* Flip Button */}
      <div className="flip-container">
        <button 
          onClick={handleFlipTokens}
          className="flip-button"
          disabled={isLoading || isSwapping}
        >
          🔄
        </button>
      </div>

      {/* TO Section */}
      <div className="swap-section">
        <div className="section-header">
          <span className="section-label">Вы получаете</span>
          {isLoading && <span className="loading-text">Загрузка...</span>}
        </div>
        
        <div className="token-input-container">
          <div className="token-selector">
            <select 
              value={toToken} 
              onChange={(e) => setToToken(e.target.value)}
              className="token-select"
            >
              {TOKENS.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.icon} {token.symbol}
                </option>
              ))}
            </select>
          </div>
          
          <div className="amount-input-container">
            <input
              type="text"
              value={getEstimatedOutput()}
              readOnly
              placeholder="0.0"
              className="amount-input readonly"
            />
          </div>
        </div>
      </div>

      {/* Exchange Rate */}
      {amount && quote !== '0' && (
        <div className="exchange-rate">
          <span className="rate-text">
            1 {fromToken} = {getExchangeRate()} {toToken}
          </span>
        </div>
      )}

      {/* Advanced Settings */}
      <div className="advanced-section">
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="advanced-toggle"
        >
          ⚙️ Дополнительные настройки
        </button>
        
        {showAdvanced && (
          <div className="advanced-content">
            <div className="slippage-section">
              <label className="slippage-label">Допустимое проскальзывание</label>
              <div className="slippage-options">
                {slippageOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => setSlippage(option)}
                    className={`slippage-option ${slippage === option ? 'active' : ''}`}
                  >
                    {option}%
                  </button>
                ))}
                <input
                  type="number"
                  value={slippage}
                  onChange={(e) => setSlippage(Number(e.target.value))}
                  className="slippage-custom"
                  step="0.1"
                  min="0.1"
                  max="50"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={!isConnected || !isAmountValid || !quote || quote === '0' || isLoading || isSwapping}
        className="swap-button"
      >
        {!isConnected ? 'Подключите кошелёк' :
         isSwapping ? 'Выполняется обмен...' :
         !amount ? 'Введите сумму' :
         !isAmountValid ? 'Недостаточно средств' :
         isLoading ? 'Загрузка котировки...' :
         'Обменять'}
      </button>
    </div>
  )
}
