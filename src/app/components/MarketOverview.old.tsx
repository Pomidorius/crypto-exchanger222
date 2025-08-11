// src/app/components/MarketOverview.tsx
'use client'

import { useState, useEffect } from 'react'

interface MarketData {
  symbol: string
  name: string
  price: number
  change24h: number
  volume: number
  icon: string
}

export function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketData[]>([])

  useEffect(() => {
    // Генерируем моковые данные для обзора рынка
    const generateMarketData = () => {
      const data: MarketData[] = [
        {
          symbol: 'ETH',
          name: 'Ethereum',
          price: 2000 + (Math.random() - 0.5) * 100,
          change24h: (Math.random() - 0.5) * 10,
          volume: 1234567890,
          icon: '⟠'
        },
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 45000 + (Math.random() - 0.5) * 2000,
          change24h: (Math.random() - 0.5) * 8,
          volume: 2345678901,
          icon: '₿'
        },
        {
          symbol: 'USDC',
          name: 'USD Coin',
          price: 1 + (Math.random() - 0.5) * 0.01,
          change24h: (Math.random() - 0.5) * 0.5,
          volume: 987654321,
          icon: '💵'
        },
        {
          symbol: 'USDT',
          name: 'Tether',
          price: 1 + (Math.random() - 0.5) * 0.01,
          change24h: (Math.random() - 0.5) * 0.5,
          volume: 3456789012,
          icon: '💲'
        }
      ]
      setMarketData(data)
    }

    generateMarketData()
    
    // Обновляем данные каждые 10 секунд
    const interval = setInterval(generateMarketData, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4">Обзор рынка</h2>
      
      <div className="space-y-3">
        {marketData.map((token) => (
          <div key={token.symbol} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{token.icon}</div>
              <div>
                <div className="font-semibold">{token.symbol}</div>
                <div className="text-sm text-gray-500">{token.name}</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-semibold">
                ${token.price.toLocaleString('ru', { 
                  minimumFractionDigits: token.symbol === 'BTC' || token.symbol === 'ETH' ? 0 : 4,
                  maximumFractionDigits: token.symbol === 'BTC' || token.symbol === 'ETH' ? 0 : 4
                })}
              </div>
              <div className={`text-sm ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
              </div>
            </div>
            
            <div className="text-right text-sm text-gray-500">
              <div>Объем 24ч</div>
              <div>${(token.volume / 1000000).toFixed(1)}M</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-500">Общая капитализация</div>
            <div className="font-semibold">$1.2T</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">24ч объем</div>
            <div className="font-semibold">$45.6B</div>
          </div>
        </div>
      </div>
    </div>
  )
}
