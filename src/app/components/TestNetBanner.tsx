'use client'

import { useChainId } from 'wagmi'

export function TestNetBanner() {
  const chainId = useChainId()
  
  // Показываем баннер для тестовых сетей
  const isSepoliaTestnet = chainId === 11155111
  const isLocalhost = chainId === 31337
  const envChainId = process.env.NEXT_PUBLIC_CHAIN_ID
  
  // Если подключен к неправильной сети
  if (envChainId === '11155111' && chainId !== 11155111 && chainId !== undefined) {
    return (
      <div className="bg-gradient-to-r from-red-100 to-pink-100 border border-red-400 p-4 rounded-lg mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <h3 className="font-bold text-red-800 text-lg">Неправильная сеть!</h3>
            <p className="text-red-700 text-sm mt-1">
              Переключитесь на Sepolia Testnet для работы с приложением.
            </p>
          </div>
        </div>
        
        <div className="mt-3">
          <a 
            href="https://chainlist.org/chain/11155111" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
          >
            🔗 Переключиться на Sepolia
          </a>
        </div>
      </div>
    )
  }
  
  // Баннер для Sepolia testnet
  if (isSepoliaTestnet || envChainId === '11155111') {
    return (
      <div className="bg-gradient-to-r from-green-100 to-blue-100 border border-green-400 p-4 rounded-lg mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧪</span>
          <div className="flex-1">
            <h3 className="font-bold text-green-800 text-lg">Sepolia Testnet - Демо режим</h3>
            <p className="text-green-700 text-sm mt-1">
              Безопасная тестовая сеть! Все операции бесплатны и безопасны.
            </p>
          </div>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2">
          <a 
            href="https://sepoliafaucet.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors"
          >
            💧 Получить тестовые ETH
          </a>
          
          <a 
            href="https://sepolia.etherscan.io/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            🔍 Sepolia Explorer
          </a>
        </div>
        
        <div className="mt-2 text-xs text-green-600">
          💡 Тестовые токены не имеют реальной ценности - экспериментируйте свободно!
        </div>
      </div>
    )
  }
  
  // Баннер для localhost
  if (isLocalhost || envChainId === '31337') {
    return (
      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-400 p-4 rounded-lg mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div className="flex-1">
            <h3 className="font-bold text-yellow-800 text-lg">Локальная разработка</h3>
            <p className="text-yellow-700 text-sm mt-1">
              Hardhat localhost network. Убедитесь что контракты задеплоены.
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  // Показываем для любой другой сети
  return (
    <div className="bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-400 p-4 rounded-lg mb-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🌐</span>
        <div className="flex-1">
          <h3 className="font-bold text-blue-800 text-lg">Производственная сеть</h3>
          <p className="text-blue-700 text-sm mt-1">
            Подключена к основной сети. Соблюдайте осторожность при проведении операций!
          </p>
        </div>
      </div>
    </div>
  )
}
