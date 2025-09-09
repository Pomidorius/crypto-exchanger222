'use client'

import { Header } from './components/Header'
import { ImprovedSwapForm } from './components/ImprovedSwapForm'
import { PortfolioBar } from './components/PortfolioBar'
import { Footer } from './components/Footer'
import { NetworkStatus } from './components/NetworkStatus'

export default function Home() {
  return (
    <div className="page-layout">
      {/* Header с навигацией - фиксированный */}
      <Header />
      
      {/* Main Content - Центральный блок с обменником */}
      <main className="main">
        <div className="swap-container">
          {/* Статус подключения к сети */}
          <NetworkStatus />
          
          <div className="swap-card">
            <div className="swap-header">
              <h2>Криптообменник</h2>
              <p>Мгновенный обмен криптовалют</p>
            </div>
            
            <ImprovedSwapForm />
          </div>
        </div>
      </main>

      {/* Portfolio Bar - Нижняя строка с состоянием портфеля */}
      <PortfolioBar />
      
      {/* Footer - Рынок и история транзакций */}
      <Footer />
    </div>
  )
}
