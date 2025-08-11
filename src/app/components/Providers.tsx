// src/app/components/Providers.tsx
'use client'

import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'
import '@rainbow-me/rainbowkit/styles.css'

import { WagmiProvider }                        from 'wagmi'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { mainnet, polygon, arbitrum, hardhat }  from 'wagmi/chains'
import { http }                                 from 'viem'

import { QueryClient, QueryClientProvider }      from '@tanstack/react-query'

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'dummy-project-id'
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545'
const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '31337')

// создаём один общий QueryClient
const queryClient = new QueryClient()

const wagmiConfig = getDefaultConfig({
  appName: 'Crypto Exchanger',
  projectId,
  chains: chainId === 1 ? [mainnet] : chainId === 31337 ? [hardhat] : [mainnet, polygon, arbitrum, hardhat],
  transports: chainId === 1 
    ? { [mainnet.id]: http(rpcUrl) }
    : chainId === 31337 
    ? { [hardhat.id]: http(rpcUrl) }
    : {
        [mainnet.id]: http(),
        [polygon.id]: http(),
        [arbitrum.id]: http(),
        [hardhat.id]: http('http://127.0.0.1:8545'),
      },
})

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white">Загрузка...</div>
    </div>
  }

  return (
    // ← восстанавливаем обёртку для React Query
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}
