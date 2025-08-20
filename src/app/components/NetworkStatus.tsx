'use client'

import { useChainId } from 'wagmi'

export function NetworkStatus() {
  const chainId = useChainId()
  const envChainId = process.env.NEXT_PUBLIC_CHAIN_ID
  
  const getNetworkInfo = (id: number | string) => {
    switch (id?.toString()) {
      case '1':
        return { name: 'Ethereum Mainnet', color: 'blue', icon: '🌐' }
      case '11155111':
        return { name: 'Sepolia Testnet', color: 'green', icon: '🧪' }
      case '31337':
        return { name: 'Localhost', color: 'yellow', icon: '⚡' }
      default:
        return { name: 'Unknown Network', color: 'gray', icon: '❓' }
    }
  }
  
  const expectedNetwork = getNetworkInfo(envChainId || '1')
  const currentNetwork = getNetworkInfo(chainId || 0)
  
  // Если сети совпадают
  if (chainId?.toString() === envChainId) {
    return (
      <div className={`bg-${expectedNetwork.color}-100 border border-${expectedNetwork.color}-400 p-3 rounded-lg mb-4`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{expectedNetwork.icon}</span>
          <div>
            <span className={`text-${expectedNetwork.color}-800 font-medium text-sm`}>
              Подключено к {expectedNetwork.name}
            </span>
          </div>
        </div>
      </div>
    )
  }
  
  // Если сети не совпадают
  if (chainId && chainId.toString() !== envChainId) {
    return (
      <div className="bg-red-100 border border-red-400 p-3 rounded-lg mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <div>
            <div className="text-red-800 font-medium text-sm">
              Неправильная сеть!
            </div>
            <div className="text-red-600 text-xs">
              Подключено: {currentNetwork.name} • Требуется: {expectedNetwork.name}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Если кошелек не подключен
  return (
    <div className="bg-gray-100 border border-gray-400 p-3 rounded-lg mb-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">💼</span>
        <div>
          <span className="text-gray-800 font-medium text-sm">
            Подключите кошелек
          </span>
        </div>
      </div>
    </div>
  )
}
