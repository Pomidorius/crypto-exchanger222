// src/app/components/TokenInfoModal.tsx
'use client'

import { useState } from 'react'

interface TokenInfoModalProps {
  token: string
  isOpen: boolean
  onClose: () => void
}

export function TokenInfoModal({ token, isOpen, onClose }: TokenInfoModalProps) {
  if (!isOpen) return null

  const tokenInfo = {
    'ETH': {
      name: 'Ethereum',
      symbol: 'ETH',
      description: 'Ethereum — это децентрализованная платформа для смарт-контрактов.',
      price: '$2,000',
      marketCap: '$240B',
      volume24h: '$15B',
      supply: '120M ETH',
      icon: '⟠',
      website: 'https://ethereum.org',
      whitepaper: 'https://ethereum.org/whitepaper',
      features: ['Смарт-контракты', 'DeFi', 'NFT', 'Web3']
    },
    'USDC': {
      name: 'USD Coin',
      symbol: 'USDC',
      description: 'USD Coin — это стейблкоин, привязанный к доллару США.',
      price: '$1.00',
      marketCap: '$25B',
      volume24h: '$4B',
      supply: '25B USDC',
      icon: '💵',
      website: 'https://centre.io',
      whitepaper: 'https://centre.io/usdc',
      features: ['Стейблкоин', 'Регулируемый', 'Обеспеченный USD', 'Прозрачный']
    },
    'USDT': {
      name: 'Tether',
      symbol: 'USDT',
      description: 'Tether — крупнейший стейблкоин, привязанный к доллару США.',
      price: '$1.00',
      marketCap: '$75B',
      volume24h: '$25B',
      supply: '75B USDT',
      icon: '💲',
      website: 'https://tether.to',
      whitepaper: 'https://tether.to/whitepaper',
      features: ['Стейблкоин', 'Высокая ликвидность', 'Кроссчейн', 'Широкое принятие']
    },
    'WETH': {
      name: 'Wrapped Ethereum',
      symbol: 'WETH',
      description: 'Wrapped Ethereum — это токенизированная версия ETH для DeFi.',
      price: '$2,000',
      marketCap: '$4B',
      volume24h: '$500M',
      supply: '2M WETH',
      icon: '🔗',
      website: 'https://weth.io',
      whitepaper: 'https://weth.io/whitepaper',
      features: ['ERC-20 совместимость', '1:1 с ETH', 'DeFi интеграция', 'Автоматическая обертка']
    }
  }

  const info = tokenInfo[token as keyof typeof tokenInfo] || tokenInfo.ETH

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{info.icon}</div>
            <div>
              <h2 className="text-xl font-bold">{info.name}</h2>
              <p className="text-gray-500">{info.symbol}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Price info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="text-sm text-gray-500">Цена</div>
            <div className="text-lg font-semibold">{info.price}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="text-sm text-gray-500">Капитализация</div>
            <div className="text-lg font-semibold">{info.marketCap}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="text-sm text-gray-500">Объем 24ч</div>
            <div className="text-lg font-semibold">{info.volume24h}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="text-sm text-gray-500">Предложение</div>
            <div className="text-lg font-semibold">{info.supply}</div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Описание</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{info.description}</p>
        </div>

        {/* Features */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Особенности</h3>
          <div className="flex flex-wrap gap-2">
            {info.features.map((feature, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="flex gap-2">
          <a
            href={info.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Сайт
          </a>
          <a
            href={info.whitepaper}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
          >
            Whitepaper
          </a>
        </div>
      </div>
    </div>
  )
}
