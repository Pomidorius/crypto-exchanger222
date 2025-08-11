'use client'

import { Dispatch, SetStateAction, useState } from 'react'
import { TokenInfoModal } from './TokenInfoModal'

interface TokenSelectorProps {
  value: string
  onChange: Dispatch<SetStateAction<string>>
  label: string
}

const tokenList = [
  { symbol: 'ETH', name: 'Ethereum', icon: '⟠', color: 'text-blue-500' },
  { symbol: 'WETH', name: 'Wrapped ETH', icon: '🔗', color: 'text-blue-400' },
  { symbol: 'USDC', name: 'USD Coin', icon: '💵', color: 'text-green-500' },
  { symbol: 'USDT', name: 'Tether', icon: '💲', color: 'text-green-600' },
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿', color: 'text-orange-500' },
  { symbol: 'BNB', name: 'Binance Coin', icon: '🔸', color: 'text-yellow-500' },
  { symbol: 'ADA', name: 'Cardano', icon: '🔷', color: 'text-blue-600' },
  { symbol: 'DOT', name: 'Polkadot', icon: '⚫', color: 'text-pink-500' },
  { symbol: 'LINK', name: 'Chainlink', icon: '🔗', color: 'text-indigo-500' },
  { symbol: 'UNI', name: 'Uniswap', icon: '🦄', color: 'text-purple-500' },
  { symbol: 'MATIC', name: 'Polygon', icon: '🔮', color: 'text-purple-600' },
  { symbol: 'AVAX', name: 'Avalanche', icon: '🏔️', color: 'text-red-500' },
]

export function TokenSelector({ value, onChange, label }: TokenSelectorProps) {
  const [showModal, setShowModal] = useState(false)
  const [selectedToken, setSelectedToken] = useState('')

  const handleInfoClick = (token: string) => {
    setSelectedToken(token)
    setShowModal(true)
  }

  const selectedTokenInfo = tokenList.find(token => token.symbol === value)

  if (label === '') {
    // Компактная версия для улучшенной формы
    return (
      <>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleInfoClick(value)}
            className="text-xs text-gray-500 hover:text-blue-500 transition-colors"
          >
            ℹ️
          </button>
          <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="bg-transparent border-none text-lg font-semibold focus:outline-none cursor-pointer"
          >
            {tokenList.map(token => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol}
              </option>
            ))}
          </select>
          <span className={`text-2xl ${selectedTokenInfo?.color || 'text-gray-500'}`}>
            {selectedTokenInfo?.icon}
          </span>
        </div>
        
        <TokenInfoModal
          token={selectedToken}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      </>
    )
  }

  // Полная версия для обычного использования
  return (
    <>
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1">{label}</label>
        <div className="relative">
          <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full p-3 pr-10 border rounded-lg bg-white dark:bg-gray-700 appearance-none hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
          >
            {tokenList.map(token => (
              <option key={token.symbol} value={token.symbol}>
                {token.icon} {token.symbol} — {token.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => handleInfoClick(value)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
          >
            ℹ️
          </button>
        </div>
      </div>
      
      <TokenInfoModal
        token={selectedToken}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}
