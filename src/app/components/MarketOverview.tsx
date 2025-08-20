// src/app/components/MarketOverview.tsx
'use client'

import { useState, useEffect } from 'react'

interface MarketPair {
  pair: string
  price: string
  change: string
  volume: string
  positive: boolean
  icon: string
  color: string
}

function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketPair[]>([])

  useEffect(() => {
    // Генерируем реалистичные данные рынка
    const generateMarketData = (): MarketPair[] => [
      { 
        pair: 'ETH/USDC', 
        price: '$3,500', 
        change: `${(Math.random() * 6 - 3).toFixed(2)}%`, 
        volume: '$45.2M', 
        positive: Math.random() > 0.5, 
        icon: '⟠',
        color: 'text-blue-500'
      },
      { 
        pair: 'BTC/USDT', 
        price: '$65,000', 
        change: `${(Math.random() * 6 - 3).toFixed(2)}%`, 
        volume: '$89.1M', 
        positive: Math.random() > 0.5, 
        icon: '₿',
        color: 'text-orange-500'
      },
      { 
        pair: 'BNB/USDC', 
        price: '$600', 
        change: `${(Math.random() * 6 - 3).toFixed(2)}%`, 
        volume: '$12.8M', 
        positive: Math.random() > 0.5, 
        icon: '🔸',
        color: 'text-yellow-500'
      },
      { 
        pair: 'ADA/USDT', 
        price: '$0.50', 
        change: `${(Math.random() * 6 - 3).toFixed(2)}%`, 
        volume: '$8.4M', 
        positive: Math.random() > 0.5, 
        icon: '🔷',
        color: 'text-blue-600'
      },
      { 
        pair: 'DOT/USDC', 
        price: '$7.00', 
        change: `${(Math.random() * 6 - 3).toFixed(2)}%`, 
        volume: '$5.6M', 
        positive: Math.random() > 0.5, 
        icon: '⚫',
        color: 'text-pink-500'
      },
      { 
        pair: 'LINK/USDT', 
        price: '$15.00', 
        change: `${(Math.random() * 6 - 3).toFixed(2)}%`, 
        volume: '$7.2M', 
        positive: Math.random() > 0.5, 
        icon: '🔗',
        color: 'text-indigo-500'
      },
      { 
        pair: 'UNI/USDC', 
        price: '$8.00', 
        change: `${(Math.random() * 6 - 3).toFixed(2)}%`, 
        volume: '$9.8M', 
        positive: Math.random() > 0.5, 
        icon: '🦄',
        color: 'text-purple-500'
      },
      { 
        pair: 'MATIC/USDT', 
        price: '$0.90', 
        change: `${(Math.random() * 6 - 3).toFixed(2)}%`, 
        volume: '$6.3M', 
        positive: Math.random() > 0.5, 
        icon: '🔮',
        color: 'text-purple-600'
      },
      { 
        pair: 'AVAX/USDC', 
        price: '$35.00', 
        change: `${(Math.random() * 6 - 3).toFixed(2)}%`, 
        volume: '$4.9M', 
        positive: Math.random() > 0.5, 
        icon: '🏔️',
        color: 'text-red-500'
      }
    ]

    // Обновляем данные с учетом положительных/отрицательных изменений
    const data = generateMarketData().map(item => ({
      ...item,
      positive: item.change.startsWith('-') ? false : parseFloat(item.change) > 0
    }))

    setMarketData(data)

    // Обновляем каждые 10 секунд
    const interval = setInterval(() => {
      const newData = generateMarketData().map(item => ({
        ...item,
        positive: item.change.startsWith('-') ? false : parseFloat(item.change) > 0
      }))
      setMarketData(newData)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
        📈 Обзор рынка
      </h2>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {marketData.map((item) => (
          <div 
            key={item.pair}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className={`text-2xl ${item.color}`}>
                {item.icon}
              </span>
              <div>
                <div className="font-semibold text-gray-800 dark:text-white">
                  {item.pair}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Объём: {item.volume}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-semibold text-gray-800 dark:text-white">
                {item.price}
              </div>
              <div className={`text-sm font-medium ${
                item.positive 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {item.positive ? '↗' : '↘'} {item.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Индикатор обновления */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Обновляется каждые 10 секунд
        </div>
      </div>
    </div>
  )
}

export default MarketOverview
