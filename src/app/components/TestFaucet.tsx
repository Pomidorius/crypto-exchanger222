'use client'

import { useState } from 'react'
import { useChainId, useAccount } from 'wagmi'

export function TestFaucet() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const chainId = useChainId()
  const { address, isConnected } = useAccount()
  
  // Показываем только для Sepolia testnet
  const isSepoliaTestnet = chainId === 11155111 || process.env.NEXT_PUBLIC_CHAIN_ID === '11155111'
  
  if (!isSepoliaTestnet) return null

  const handleGetTestTokens = async () => {
    if (!isConnected || !address) {
      setMessage('❌ Подключите кошелек для получения тестовых токенов')
      return
    }
    
    setIsLoading(true)
    setMessage('🔄 Запрос тестовых токенов...')
    
    try {
      // Имитируем запрос тестовых токенов
      // В реальном приложении здесь будет вызов API или контракта
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setMessage(`✅ Тестовые токены отправлены на ${address.slice(0,6)}...${address.slice(-4)}!`)
    } catch (error) {
      console.error('Ошибка при получении тестовых токенов:', error)
      setMessage('❌ Ошибка при получении тестовых токенов. Попробуйте позже.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-400 p-4 rounded-lg mb-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🚰</span>
        <div className="flex-1">
          <h3 className="font-bold text-blue-800 text-lg">Тестовый кран токенов</h3>
          <p className="text-blue-700 text-sm mt-1">
            Получите бесплатные тестовые токены USDC и USDT для экспериментов.
          </p>
        </div>
      </div>
      
      <div className="mt-4 flex flex-col gap-3">
        {!isConnected ? (
          <div className="text-sm text-blue-700 p-2 bg-blue-50 rounded border border-blue-200">
            💡 Подключите кошелек для получения тестовых токенов
          </div>
        ) : (
          <button
            onClick={handleGetTestTokens}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Получение токенов...
              </span>
            ) : (
              '💧 Получить 1000 USDC + 1000 USDT'
            )}
          </button>
        )}
        
        {message && (
          <div className={`text-sm p-2 rounded ${
            message.includes('✅') 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : message.includes('❌')
              ? 'bg-red-100 text-red-700 border border-red-300'
              : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
          }`}>
            {message}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <a
            href="https://sepoliafaucet.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            💧 ETH Faucet
          </a>
          <a
            href={`https://sepolia.etherscan.io/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            🔍 Etherscan
          </a>
        </div>
        
        <div className="text-xs text-blue-600">
          💡 Тестовые токены не имеют реальной ценности и предназначены только для демонстрации
        </div>
      </div>
    </div>
  )
}
