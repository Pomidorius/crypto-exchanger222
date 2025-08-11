// src/app/components/TokenInfoModal.tsx
'use client'

import { TokenMap } from '../utils/constants'

interface TokenInfoModalProps {
  token: string
  isOpen: boolean
  onClose: () => void
}

interface TokenInfo {
  name: string
  symbol: string
  address: string
  description: string
  price: string
  marketCap: string
  volume24h: string
  supply: string
  icon: string
  color: string
  website: string
  whitepaper?: string
  features: string[]
}

export function TokenInfoModal({ token, isOpen, onClose }: TokenInfoModalProps) {
  if (!isOpen) return null

  const tokenData: Record<string, TokenInfo> = {
    'ETH': {
      name: 'Ethereum',
      symbol: 'ETH',
      address: '0x0000000000000000000000000000000000000000',
      description: 'Ethereum - ведущая платформа для смарт-контрактов и децентрализованных приложений.',
      price: '$3,500',
      marketCap: '$420B',
      volume24h: '$15B',
      supply: '120M ETH',
      website: 'https://ethereum.org',
      whitepaper: 'https://ethereum.org/whitepaper',
      icon: '⟠',
      color: 'text-blue-500',
      features: ['Смарт-контракты', 'DeFi', 'NFT', 'Web3']
    },
    'WETH': {
      name: 'Wrapped Ethereum',
      symbol: 'WETH',
      address: TokenMap.WETH.address,
      description: 'Wrapped Ethereum - токенизированная версия ETH для использования в DeFi протоколах.',
      price: '$3,500',
      marketCap: '$420B',
      volume24h: '$2.1B',
      supply: '3.2M WETH',
      website: 'https://weth.io',
      icon: '🔗',
      color: 'text-blue-400',
      features: ['DeFi Compatible', 'ERC-20', 'Wrapping']
    },
    'USDC': {
      name: 'USD Coin',
      symbol: 'USDC',
      address: TokenMap.USDC.address,
      description: 'USD Coin - полностью обеспеченный долларом стейблкоин от Centre.',
      price: '$1.00',
      marketCap: '$42B',
      volume24h: '$8.5B',
      supply: '42B USDC',
      website: 'https://centre.io',
      icon: '💵',
      color: 'text-green-500',
      features: ['Стейблкоин', 'Регулируемый', 'Аудит']
    },
    'USDT': {
      name: 'Tether',
      symbol: 'USDT',
      address: TokenMap.USDT.address,
      description: 'Tether - крупнейший стейблкоин, привязанный к доллару США.',
      price: '$1.00',
      marketCap: '$95B',
      volume24h: '$65B',
      supply: '95B USDT',
      website: 'https://tether.to',
      icon: '💲',
      color: 'text-green-600',
      features: ['Стейблкоин', 'Ликвидность', 'Мульти-чейн']
    },
    'BTC': {
      name: 'Bitcoin',
      symbol: 'BTC',
      address: TokenMap.BTC.address,
      description: 'Bitcoin - первая и самая популярная криптовалюта в мире.',
      price: '$65,000',
      marketCap: '$1.2T',
      volume24h: '$45B',
      supply: '19.7M BTC',
      website: 'https://bitcoin.org',
      whitepaper: 'https://bitcoin.org/bitcoin.pdf',
      icon: '₿',
      color: 'text-orange-500',
      features: ['Цифровое золото', 'Store of Value', 'PoW']
    },
    'BNB': {
      name: 'Binance Coin',
      symbol: 'BNB',
      address: TokenMap.BNB.address,
      description: 'BNB - нативный токен экосистемы Binance, используемый для снижения комиссий.',
      price: '$600',
      marketCap: '$87B',
      volume24h: '$1.8B',
      supply: '144M BNB',
      website: 'https://binance.com',
      icon: '🔸',
      color: 'text-yellow-500',
      features: ['Exchange Token', 'BSC', 'Burning']
    },
    'ADA': {
      name: 'Cardano',
      symbol: 'ADA',
      address: TokenMap.ADA.address,
      description: 'Cardano - блокчейн третьего поколения с фокусом на устойчивость и исследования.',
      price: '$0.50',
      marketCap: '$17B',
      volume24h: '$850M',
      supply: '35B ADA',
      website: 'https://cardano.org',
      whitepaper: 'https://cardano.org/ouroboros/',
      icon: '🔷',
      color: 'text-blue-600',
      features: ['PoS', 'Peer Review', 'Sustainability']
    },
    'DOT': {
      name: 'Polkadot',
      symbol: 'DOT',
      address: TokenMap.DOT.address,
      description: 'Polkadot - протокол, позволяющий различным блокчейнам взаимодействовать.',
      price: '$7.00',
      marketCap: '$9B',
      volume24h: '$420M',
      supply: '1.4B DOT',
      website: 'https://polkadot.network',
      whitepaper: 'https://polkadot.network/whitepaper/',
      icon: '⚫',
      color: 'text-pink-500',
      features: ['Interoperability', 'Parachains', 'Governance']
    },
    'LINK': {
      name: 'Chainlink',
      symbol: 'LINK',
      address: TokenMap.LINK.address,
      description: 'Chainlink - децентрализованная сеть оракулов для смарт-контрактов.',
      price: '$15.00',
      marketCap: '$8B',
      volume24h: '$680M',
      supply: '1B LINK',
      website: 'https://chain.link',
      whitepaper: 'https://chain.link/whitepaper',
      icon: '🔗',
      color: 'text-indigo-500',
      features: ['Oracles', 'Real-world Data', 'DeFi']
    },
    'UNI': {
      name: 'Uniswap',
      symbol: 'UNI',
      address: TokenMap.UNI.address,
      description: 'Uniswap - ведущий децентрализованный обменник на Ethereum.',
      price: '$8.00',
      marketCap: '$4.8B',
      volume24h: '$320M',
      supply: '1B UNI',
      website: 'https://uniswap.org',
      icon: '🦄',
      color: 'text-purple-500',
      features: ['DEX', 'AMM', 'Liquidity Mining']
    },
    'MATIC': {
      name: 'Polygon',
      symbol: 'MATIC',
      address: TokenMap.MATIC.address,
      description: 'Polygon - решение масштабирования для Ethereum с низкими комиссиями.',
      price: '$0.90',
      marketCap: '$8.1B',
      volume24h: '$440M',
      supply: '10B MATIC',
      website: 'https://polygon.technology',
      whitepaper: 'https://polygon.technology/papers/',
      icon: '🔮',
      color: 'text-purple-600',
      features: ['Layer 2', 'Scaling', 'Low Fees']
    },
    'AVAX': {
      name: 'Avalanche',
      symbol: 'AVAX',
      address: TokenMap.AVAX.address,
      description: 'Avalanche - высокопроизводительная платформа для DeFi и dApps.',
      price: '$35.00',
      marketCap: '$13B',
      volume24h: '$580M',
      supply: '365M AVAX',
      website: 'https://avax.network',
      whitepaper: 'https://avalabs.org/whitepapers',
      icon: '🏔️',
      color: 'text-red-500',
      features: ['Fast Finality', 'Subnets', 'Eco-friendly']
    }
  }

  const info = tokenData[token]
  if (!info) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`text-3xl ${info.color}`}>{info.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {info.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {info.symbol}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Price Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">Цена</div>
              <div className="text-lg font-semibold text-gray-800 dark:text-white">
                {info.price}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">Объём 24ч</div>
              <div className="text-lg font-semibold text-gray-800 dark:text-white">
                {info.volume24h}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">Рын. кап.</div>
              <div className="text-lg font-semibold text-gray-800 dark:text-white">
                {info.marketCap}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">Предложение</div>
              <div className="text-lg font-semibold text-gray-800 dark:text-white">
                {info.supply}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              Описание
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {info.description}
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
              Особенности
            </h3>
            <div className="flex flex-wrap gap-2">
              {info.features.map((feature, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Contract Address */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              Адрес контракта
            </h3>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <code className="text-xs text-gray-600 dark:text-gray-300 break-all">
                {info.address}
              </code>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={info.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              🌐 Сайт
            </a>
            {info.whitepaper && (
              <a
                href={info.whitepaper}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                📄 Whitepaper
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
