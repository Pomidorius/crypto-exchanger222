import { useNetwork } from 'wagmi'

export function NetworkInfo() {
  const { chain } = useNetwork()
  
  const getNetworkName = (chainId?: number) => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet'
      case 11155111: return 'Sepolia Testnet'
      case 31337: return 'Localhost'
      default: return 'Unknown Network'
    }
  }
  
  const getNetworkColor = (chainId?: number) => {
    switch (chainId) {
      case 1: return 'text-green-600'
      case 11155111: return 'text-yellow-600'
      case 31337: return 'text-blue-600'
      default: return 'text-red-600'
    }
  }
  
  const getNetworkIcon = (chainId?: number) => {
    switch (chainId) {
      case 1: return '🟢'
      case 11155111: return '🟡'
      case 31337: return '🔵'
      default: return '🔴'
    }
  }
  
  if (!chain) {
    return (
      <div className="network-info">
        <span className="text-gray-500">🔴 Не подключен к сети</span>
      </div>
    )
  }
  
  return (
    <div className="network-info">
      <span className={`font-medium ${getNetworkColor(chain.id)}`}>
        {getNetworkIcon(chain.id)} {getNetworkName(chain.id)}
      </span>
      {chain.id === 31337 && (
        <span className="text-sm text-gray-500 ml-2">
          (Разработка)
        </span>
      )}
      {chain.id === 11155111 && (
        <span className="text-sm text-gray-500 ml-2">
          (Тестирование)
        </span>
      )}
      {chain.id === 1 && (
        <span className="text-sm text-gray-500 ml-2">
          (Продакшен)
        </span>
      )}
    </div>
  )
}
