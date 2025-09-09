// src/app/utils/live-prices.ts
import { ethers } from 'ethers'
import { TokenMap } from './constants'

export interface TokenPrice {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  marketCap?: number
  lastUpdated: number
}

export interface PriceData {
  [symbol: string]: TokenPrice
}

class LivePriceService {
  private prices: PriceData = {}
  private subscribers: ((prices: PriceData) => void)[] = []
  private updateInterval: NodeJS.Timeout | null = null
  private isUpdating = false

  constructor() {
    this.startPriceUpdates()
  }

  /**
   * Подписка на обновления цен
   */
  subscribe(callback: (prices: PriceData) => void): () => void {
    this.subscribers.push(callback)
    
    // Отправляем текущие цены сразу
    if (Object.keys(this.prices).length > 0) {
      callback(this.prices)
    }

    // Возвращаем функцию отписки
    return () => {
      const index = this.subscribers.indexOf(callback)
      if (index > -1) {
        this.subscribers.splice(index, 1)
      }
    }
  }

  /**
   * Получение текущих цен
   */
  getCurrentPrices(): PriceData {
    return this.prices
  }

  /**
   * Получение цены конкретного токена
   */
  getTokenPrice(symbol: string): TokenPrice | null {
    return this.prices[symbol] || null
  }

  /**
   * Запуск периодических обновлений
   */
  private startPriceUpdates() {
    // Первое обновление сразу
    this.updatePrices()
    
    // Затем каждые 30 секунд
    this.updateInterval = setInterval(() => {
      this.updatePrices()
    }, 30000)
  }

  /**
   * Остановка обновлений
   */
  stopUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  /**
   * Обновление цен
   */
  private async updatePrices() {
    if (this.isUpdating) return
    
    this.isUpdating = true
    
    try {
      // Пробуем несколько источников данных
      const newPrices = await this.fetchFromMultipleSources()
      
      if (newPrices && Object.keys(newPrices).length > 0) {
        this.prices = newPrices
        this.notifySubscribers()
      }
    } catch (error) {
      console.error('Ошибка обновления цен:', error)
      
      // Если не удалось получить данные, используем fallback
      if (Object.keys(this.prices).length === 0) {
        this.prices = this.getFallbackPrices()
        this.notifySubscribers()
      }
    } finally {
      this.isUpdating = false
    }
  }

  /**
   * Получение данных из нескольких источников
   */
  private async fetchFromMultipleSources(): Promise<PriceData | null> {
    const sources = [
      () => this.fetchFromCoinGecko(),
      () => this.fetchFromCoinCap(),
      () => this.fetchFromUniswap(),
    ]

    for (const fetchFn of sources) {
      try {
        const result = await fetchFn()
        if (result) return result
      } catch (error) {
        console.warn('Источник данных недоступен:', error)
        continue
      }
    }

    return null
  }

  /**
   * CoinGecko API
   */
  private async fetchFromCoinGecko(): Promise<PriceData | null> {
    try {
      const symbols = Object.keys(TokenMap).filter(s => s !== 'ETH').map(s => {
        const mapping: Record<string, string> = {
          'WETH': 'weth',
          'USDC': 'usd-coin',
          'USDT': 'tether',
          'DAI': 'dai',
          'WBTC': 'wrapped-bitcoin'
        }
        return mapping[s] || s.toLowerCase()
      })

      symbols.push('ethereum') // для ETH

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbols.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
        { 
          headers: process.env.COINGECKO_API_KEY ? {
            'X-CG-Demo-API-Key': process.env.COINGECKO_API_KEY
          } : {}
        }
      )

      if (!response.ok) throw new Error(`CoinGecko API error: ${response.status}`)

      const data = await response.json()
      
      return this.transformCoinGeckoData(data)
    } catch (error) {
      console.error('CoinGecko fetch error:', error)
      return null
    }
  }

  /**
   * CoinCap API (fallback)
   */
  private async fetchFromCoinCap(): Promise<PriceData | null> {
    try {
      const response = await fetch('https://api.coincap.io/v2/assets?limit=10')
      if (!response.ok) throw new Error(`CoinCap API error: ${response.status}`)

      const data = await response.json()
      return this.transformCoinCapData(data.data)
    } catch (error) {
      console.error('CoinCap fetch error:', error)
      return null
    }
  }

  /**
   * Получение цен через Uniswap (для более точных данных)
   */
  private async fetchFromUniswap(): Promise<PriceData | null> {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        return null
      }

      const { getRealQuote } = await import('./uniswap-real')
      
      // Получаем цены относительно USDC
      const ethPrice = await this.getUniswapPrice('ETH', 'USDC', '1')
      const wethPrice = await this.getUniswapPrice('WETH', 'USDC', '1')
      
      const prices: PriceData = {}
      
      if (ethPrice > 0) {
        prices['ETH'] = {
          symbol: 'ETH',
          price: ethPrice,
          change24h: 0, // Uniswap не предоставляет исторические данные
          volume24h: 0,
          lastUpdated: Date.now()
        }
      }

      if (wethPrice > 0) {
        prices['WETH'] = {
          symbol: 'WETH',
          price: wethPrice,
          change24h: 0,
          volume24h: 0,
          lastUpdated: Date.now()
        }
      }

      // USDC всегда $1
      prices['USDC'] = {
        symbol: 'USDC',
        price: 1.0,
        change24h: 0,
        volume24h: 0,
        lastUpdated: Date.now()
      }

      // USDT примерно $1
      prices['USDT'] = {
        symbol: 'USDT',
        price: 1.0,
        change24h: 0,
        volume24h: 0,
        lastUpdated: Date.now()
      }

      return Object.keys(prices).length > 0 ? prices : null
    } catch (error) {
      console.error('Uniswap fetch error:', error)
      return null
    }
  }

  /**
   * Получение цены через Uniswap quote
   */
  private async getUniswapPrice(from: string, to: string, amount: string): Promise<number> {
    try {
      const { getRealQuote } = await import('./uniswap-real')
      const quote = await getRealQuote(from, to, amount, 0.5)
      
      const fromToken = TokenMap[from]
      const toToken = TokenMap[to]
      
      if (!fromToken || !toToken) return 0
      
      const quotedAmount = ethers.utils.formatUnits(quote.quotedAmount, toToken.decimals)
      return parseFloat(quotedAmount)
    } catch (error) {
      return 0
    }
  }

  /**
   * Трансформация данных CoinGecko
   */
  private transformCoinGeckoData(data: any): PriceData {
    const prices: PriceData = {}

    const mapping: Record<string, string> = {
      'ethereum': 'ETH',
      'weth': 'WETH',
      'usd-coin': 'USDC',
      'tether': 'USDT',
      'dai': 'DAI',
      'wrapped-bitcoin': 'WBTC'
    }

    Object.entries(data).forEach(([id, priceData]: [string, any]) => {
      const symbol = mapping[id]
      if (symbol) {
        prices[symbol] = {
          symbol,
          price: priceData.usd || 0,
          change24h: priceData.usd_24h_change || 0,
          volume24h: priceData.usd_24h_vol || 0,
          marketCap: priceData.usd_market_cap,
          lastUpdated: Date.now()
        }
      }
    })

    return prices
  }

  /**
   * Трансформация данных CoinCap
   */
  private transformCoinCapData(data: any[]): PriceData {
    const prices: PriceData = {}

    const mapping: Record<string, string> = {
      'ethereum': 'ETH',
      'wrapped-ethereum': 'WETH',
      'usd-coin': 'USDC',
      'tether': 'USDT',
      'multi-collateral-dai': 'DAI',
      'wrapped-bitcoin': 'WBTC'
    }

    data.forEach((asset: any) => {
      const symbol = mapping[asset.id] || asset.symbol?.toUpperCase()
      if (symbol && Object.keys(TokenMap).includes(symbol)) {
        prices[symbol] = {
          symbol,
          price: parseFloat(asset.priceUsd) || 0,
          change24h: parseFloat(asset.changePercent24Hr) || 0,
          volume24h: parseFloat(asset.volumeUsd24Hr) || 0,
          marketCap: parseFloat(asset.marketCapUsd),
          lastUpdated: Date.now()
        }
      }
    })

    return prices
  }

  /**
   * Fallback цены (если все API недоступны)
   */
  private getFallbackPrices(): PriceData {
    return {
      'ETH': {
        symbol: 'ETH',
        price: 3500,
        change24h: 0,
        volume24h: 0,
        lastUpdated: Date.now()
      },
      'WETH': {
        symbol: 'WETH',
        price: 3500,
        change24h: 0,
        volume24h: 0,
        lastUpdated: Date.now()
      },
      'USDC': {
        symbol: 'USDC',
        price: 1.0,
        change24h: 0,
        volume24h: 0,
        lastUpdated: Date.now()
      },
      'USDT': {
        symbol: 'USDT',
        price: 1.0,
        change24h: 0,
        volume24h: 0,
        lastUpdated: Date.now()
      }
    }
  }

  /**
   * Уведомление подписчиков
   */
  private notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback(this.prices)
      } catch (error) {
        console.error('Ошибка в callback подписчика:', error)
      }
    })
  }
}

// Глобальный экземпляр сервиса
export const livePriceService = new LivePriceService()

/**
 * React хук для использования живых цен
 */
export function useLivePrices() {
  const [prices, setPrices] = React.useState<PriceData>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setIsLoading(true)
    
    const unsubscribe = livePriceService.subscribe((newPrices) => {
      setPrices(newPrices)
      setIsLoading(false)
      setError(null)
    })

    // Получаем текущие цены если они есть
    const currentPrices = livePriceService.getCurrentPrices()
    if (Object.keys(currentPrices).length > 0) {
      setPrices(currentPrices)
      setIsLoading(false)
    }

    return unsubscribe
  }, [])

  return {
    prices,
    isLoading,
    error,
    getPrice: (symbol: string) => prices[symbol]?.price || 0,
    getChange: (symbol: string) => prices[symbol]?.change24h || 0,
    getVolume: (symbol: string) => prices[symbol]?.volume24h || 0
  }
}

// Импорт React для хука
import React from 'react'
