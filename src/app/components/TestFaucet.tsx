'use client'

import { useState } from 'react'
import { useChainId, useAccount } from 'wagmi'

export function TestFaucet() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [txHash, setTxHash] = useState('')
  const chainId = useChainId()
  const { address, isConnected } = useAccount()
  
  // Показываем только для Sepolia testnet
  const isSepoliaTestnet = chainId === 11155111 || process.env.NEXT_PUBLIC_CHAIN_ID === '11155111'
  
  if (!isSepoliaTestnet) return null

  const handleMintToken = async (token: 'USDC' | 'USDT' | 'ETH') => {
    if (!isConnected || !address) {
      setMessage('❌ Подключите кошелек для получения тестовых токенов')
      return
    }
    
    setIsLoading(true)
    setMessage(`🔄 Запрос ${token === 'ETH' ? 'SepoliaETH' : token + ' токенов'}...`)
    setTxHash('')
    
    try {
      const response = await fetch('/api/mint-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          token
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`✅ ${data.message}`)
        setTxHash(data.txHash)
      } else {
        setMessage(`❌ Ошибка: ${data.error}`)
      }
      
    } catch (error: unknown) {
      console.error('Ошибка при запросе токенов:', error)
      setMessage(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetUSDC = () => handleMintToken('USDC')
  const handleGetUSDT = () => handleMintToken('USDT')
  const handleGetETH = () => handleMintToken('ETH')

  return (
    <div className="bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-400 p-4 rounded-lg mb-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🚰</span>
        <div className="flex-1">
          <h3 className="font-bold text-blue-800 text-lg">Демо: Тестовый кран токенов</h3>
          <p className="text-blue-700 text-sm mt-1">
            Демонстрация интерфейса получения токенов. Для реальных токенов используйте внешние faucet&apos;ы.
          </p>
        </div>
      </div>
      
      <div className="mt-4 flex flex-col gap-3">
        {!isConnected ? (
          <div className="text-sm text-blue-700 p-2 bg-blue-50 rounded border border-blue-200">
            💡 Подключите кошелек для получения тестовых токенов
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleGetETH}
              disabled={isLoading}
              className="px-3 py-2 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-1">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ...
                </span>
              ) : (
                '🎭 Демо: 0.1 ETH'
              )}
            </button>
            <button
              onClick={handleGetUSDC}
              disabled={isLoading}
              className="px-3 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-1">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ...
                </span>
              ) : (
                '🎭 Демо: 1000 USDC'
              )}
            </button>
            <button
              onClick={handleGetUSDT}
              disabled={isLoading}
              className="px-3 py-2 bg-green-500 text-white rounded-md font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-1">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ...
                </span>
              ) : (
                '🎭 Демо: 1000 USDT'
              )}
            </button>
          </div>
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
            {txHash && message.includes('✅') && (
              <div className="mt-2">
                <div className="text-xs text-orange-600 mb-1">
                  ⚠️ Демо-хэш: {txHash.slice(0,10)}...{txHash.slice(-4)}
                </div>
                <div className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                  🚫 ВНИМАНИЕ: Баланс в кошельке НЕ изменится! Это только демонстрация интерфейса.
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  💡 В демо-режиме транзакции симулируются. В продакшене будут реальные Sepolia транзакции.
                </div>
              </div>
            )}
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
        
        <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded border border-blue-200">
          <div className="font-bold mb-2">⚠️ ВАЖНО - Демо режим:</div>
          <div className="space-y-1">
            <div>• 🎭 <strong>Кнопки работают</strong> - но токены НЕ добавляются в кошелек</div>
            <div>• 💫 <strong>Это симуляция</strong> - показывает как будет выглядеть интерфейс</div>
            <div>• 💰 <strong>Для реальных токенов</strong> - используйте faucet&apos;ы ниже</div>
            <div>• 🚀 <strong>В продакшене</strong> - будут настоящие транзакции</div>
          </div>
        </div>
        
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded">
          <div className="text-sm font-bold text-yellow-800 mb-2">
            🎯 Для получения РЕАЛЬНЫХ токенов:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <a
              href="https://sepoliafaucet.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              💧 SepoliaETH Faucet
            </a>
            <a
              href="https://faucet.quicknode.com/ethereum/sepolia"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              🚰 QuickNode Faucet
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
