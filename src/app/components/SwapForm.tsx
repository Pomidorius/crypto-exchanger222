// src/app/components/SwapForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { quoteExactInput, TokenMap } from '../utils/uniswap'
import { PROXY_SWAP_ADDRESS, ProxySwapAbi, isContractDeployed } from '../utils/constants'
import { providers, Contract, BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import toast from 'react-hot-toast'

// Минимальный ABI ERC20 для allowance/approve
const ERC20_ABI = [
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)'
]

export function SwapForm() {
  const { address, isConnected } = useAccount()

  // Отладочная информация
  console.log('🔍 SwapForm: isContractDeployed =', isContractDeployed())
  console.log('🔍 SwapForm: PROXY_SWAP_ADDRESS =', PROXY_SWAP_ADDRESS)

  // Состояние формы
  const [fromToken, setFromToken] = useState('ETH')
  const [toToken, setToToken]     = useState('USDT')
  const [amount, setAmount]       = useState('1')
  const [quote, setQuote]         = useState('0')
  const [slippage, setSlippage]   = useState(0.3)
  const [fee, setFee]             = useState('0')

  // Функции для форматирования
  const formatTokenAmount = (amount: string, tokenSymbol: string) => {
    if (!amount || amount === '0') return '0'
    const tokenInfo = TokenMap[tokenSymbol]
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

  const getFeeAmount = () => {
    if (!fee || fee === '0') return '0'
    return formatTokenAmount(fee, fromToken)
  }

  // Баланс пользователя
  const { data: balanceData } = useBalance({
    address,
    token: fromToken === 'ETH'
      ? undefined
      : (TokenMap[fromToken].address as `0x${string}`),
  })
  const balance = balanceData ? Number(balanceData.formatted) : 0

  // Валидация суммы
  const amountNum     = Number(amount)
  const isAmountValid = amountNum > 0 && amountNum <= balance
  const amountError   = amountNum <= 0
    ? 'Введите сумму больше нуля'
    : amountNum > balance
      ? `Недостаточно средств (макс. ${balance.toFixed(6)})`
      : ''

  // Получение котировки
  useEffect(() => {
    if (!isConnected || amountNum <= 0) return
    ;(async () => {
      try {
        const { quotedAmount, protocolFee } = await quoteExactInput(
          fromToken, toToken, amount, slippage
        )
        setQuote(quotedAmount)
        setFee(protocolFee)
      } catch (e: unknown) {
        console.error('Quote error', e)
        setQuote('0')
        setFee('0')
      }
    })()
  }, [fromToken, toToken, amount, slippage, isConnected, amountNum])

  const handleSwap = async () => {
    if (!isConnected) {
      toast.error('Пожалуйста, подключите кошелёк')
      return
    }
    if (!isContractDeployed()) {
      toast.error('Контракт не задеплоен. Обмен временно недоступен.')
      return
    }
    if (!isAmountValid) {
      toast.error(amountError)
      return
    }
    if (slippage > 2 && !confirm(`Вы указали slippage ${slippage}%. Продолжить?`)) {
      return
    }

    let success = false
    let errMsg = ''

    try {
      const web3Provider = new providers.Web3Provider(window.ethereum as providers.ExternalProvider)
      const signer       = web3Provider.getSigner()
      const proxy        = new Contract(
        PROXY_SWAP_ADDRESS,
        ProxySwapAbi,
        signer
      )

      // подготавливаем данные свапа
      const tokenInInfo = TokenMap[fromToken]
      const amountIn    = parseUnits(amount, tokenInInfo.decimals)
      const quotedBn    = BigInt(quote)
      const minOutBn    = (quotedBn * BigInt(10000 - slippage * 100)) / BigInt(10000)

      // Для ERC-20: проверяем allowance
      if (fromToken !== 'ETH') {
        const erc20 = new Contract(
          tokenInInfo.address,
          ERC20_ABI,
          signer
        )
        const currentAllowance: BigNumber = await erc20.allowance(
          await signer.getAddress(),
          PROXY_SWAP_ADDRESS
        )
        if (currentAllowance.lt(amountIn)) {
          // Запрашиваем approve
          toast('Запрашиваем разрешение (approve)…', { icon: '⏳' })
          const approveTx = await erc20.approve(
            PROXY_SWAP_ADDRESS,
            amountIn.toString()
          )
          await approveTx.wait()
          toast.success('Разрешение получено!')
        }
      }

      // Выполняем сам свап
      let tx
      if (fromToken === 'ETH') {
        tx = await proxy.swapExactETHForTokens(
          TokenMap[toToken].address,
          minOutBn.toString(),
          { value: amountIn }
        )
      } else if (toToken === 'ETH') {
        tx = await proxy.swapExactTokensForETH(
          tokenInInfo.address,
          amountIn,
          minOutBn.toString()
        )
      } else {
        tx = await proxy.swapExactInputSingle(
          tokenInInfo.address,
          TokenMap[toToken].address,
          amountIn,
          minOutBn.toString()
        )
      }

      toast('Ожидаем подписи…', { icon: '⏳' })
      await tx.wait()
      success = true
      toast.success('Свап выполнен успешно!')
    } catch (e: unknown) {
      const error = e as { code?: number | string; message?: string }
      if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        errMsg = 'Пользователь отменил транзакцию'
        toast('Транзакция отменена', { icon: '⚠️' })
      } else {
        errMsg = error.message || 'Неизвестная ошибка'
        toast.error(`Ошибка: ${errMsg}`)
      }
    } finally {
      // Логируем в бэкенд
      fetch('/api/swaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success,
          fromToken,
          toToken,
          amount,
          slippage,
          error: errMsg,
        }),
      }).catch(console.error)
    }
  }

  return (
    <main className="container">
      <h1 className="text-center mb-4">Обмен токенов</h1>
      <p>Баланс {fromToken}: <strong>{balance.toFixed(6)}</strong></p>

      <form onSubmit={e => { e.preventDefault(); handleSwap() }}>
        <label htmlFor="fromToken">From</label>
        <select
          id="fromToken"
          value={fromToken}
          onChange={e => setFromToken(e.target.value)}
        >
          {Object.keys(TokenMap).map(sym => (
            <option key={sym} value={sym}>{sym}</option>
          ))}
        </select>

        <label htmlFor="toToken">To</label>
        <select
          id="toToken"
          value={toToken}
          onChange={e => setToToken(e.target.value)}
        >
          {Object.keys(TokenMap).map(sym => (
            <option key={sym} value={sym}>{sym}</option>
          ))}
        </select>

        <label htmlFor="amount">Сумма</label>
        <input
          id="amount"
          type="number"
          step="any"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <p style={{ color: 'red', minHeight: '1.25em' }}>
          {!isAmountValid ? amountError : null}
        </p>

        <label htmlFor="slippage">Slippage ({slippage}%)</label>
        <input
          id="slippage"
          type="range"
          min="0.1" max="5" step="0.1"
          value={slippage}
          onChange={e => setSlippage(Number(e.target.value))}
        />

        <div className="exchange-info">
          <p><strong>Курс:</strong> 1 {fromToken} = {getExchangeRate()} {toToken}</p>
          <p><strong>Вы получите:</strong> {getEstimatedOutput()} {toToken}</p>
          <p><strong>Комиссия протокола:</strong> {getFeeAmount()} {fromToken} (0.1%)</p>
          <p><strong>Слиппаж:</strong> {slippage}%</p>
        </div>

        <button
          className="btn-exchange"
          type="submit"
          disabled={!isAmountValid || !isContractDeployed()}
        >
          {!isContractDeployed() ? 'Контракт не задеплоен' : 'Обменять'}
        </button>
      </form>
    </main>
  )
}
