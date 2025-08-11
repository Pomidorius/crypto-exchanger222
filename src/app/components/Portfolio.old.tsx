// src/app/components/Portfolio.tsx
'use client'

import { useAccount, useBalance } from 'wagmi'
import { TokenMap } from '../utils/constants'
import { useState, useEffect } from 'react'

export function Portfolio() {
  const { address, isConnected } = useAccount()
  const [totalValue, setTotalValue] = useState(0)

  // Получаем балансы всех токенов
  const { data: ethBalance } = useBalance({ address })
  const { data: usdcBalance } = useBalance({ 
    address, 
    token: TokenMap.USDC.address as `0x${string}` 
  })
  const { data: usdtBalance } = useBalance({ 
    address, 
    token: TokenMap.USDT.address as `0x${string}` 
  })
  const { data: wethBalance } = useBalance({ 
    address, 
    token: TokenMap.WETH.address as `0x${string}` 
  })

  useEffect(() => {
    if (isConnected && ethBalance && usdcBalance && usdtBalance && wethBalance) {
      // Примерные цены для расчета общей стоимости
      const ethPrice = 2000
      const usdcPrice = 1
      const usdtPrice = 1
      const wethPrice = 2000

      const total = 
        (Number(ethBalance.formatted) * ethPrice) +
        (Number(usdcBalance.formatted) * usdcPrice) +
        (Number(usdtBalance.formatted) * usdtPrice) +
        (Number(wethBalance.formatted) * wethPrice)

      setTotalValue(total)
    }
  }, [isConnected, ethBalance, usdcBalance, usdtBalance, wethBalance])

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Портфель</h2>
        <p className="text-gray-500">Подключите кошелек для просмотра портфеля</p>
      </div>
    )
  }

  const tokens = [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: ethBalance?.formatted || '0',
      value: Number(ethBalance?.formatted || 0) * 2000,
      price: 2000,
      change: '+2.34%',
      icon: '⟠'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: usdcBalance?.formatted || '0',
      value: Number(usdcBalance?.formatted || 0) * 1,
      price: 1,
      change: '+0.01%',
      icon: '💵'
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      balance: usdtBalance?.formatted || '0',
      value: Number(usdtBalance?.formatted || 0) * 1,
      price: 1,
      change: '-0.02%',
      icon: '💲'
    },
    {
      symbol: 'WETH',
      name: 'Wrapped ETH',
      balance: wethBalance?.formatted || '0',
      value: Number(wethBalance?.formatted || 0) * 2000,
      price: 2000,
      change: '+2.34%',
      icon: '🔗'
    }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Портфель</h2>
        <div className="text-right">
          <div className="text-2xl font-bold">${totalValue.toLocaleString('ru', { maximumFractionDigits: 2 })}</div>
          <div className="text-sm text-green-500">+$123.45 (+1.23%)</div>
        </div>
      </div>

      <div className="space-y-3">
        {tokens.map((token) => (
          <div key={token.symbol} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{token.icon}</div>
              <div>
                <div className="font-semibold">{token.symbol}</div>
                <div className="text-sm text-gray-500">{token.name}</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-semibold">
                {Number(token.balance).toFixed(token.symbol === 'ETH' || token.symbol === 'WETH' ? 4 : 2)} {token.symbol}
              </div>
              <div className="text-sm text-gray-500">
                ${token.value.toLocaleString('ru', { maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Доступно для торговли</span>
          <span>${totalValue.toLocaleString('ru', { maximumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  )
}
