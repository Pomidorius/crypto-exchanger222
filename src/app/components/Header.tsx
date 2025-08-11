// src/app/components/Header.tsx
'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState } from 'react'

export function Header() {
  const [activeMenu, setActiveMenu] = useState('exchange')

  const menuItems = [
    { id: 'exchange', label: 'Обмен', icon: '🔄' },
    { id: 'portfolio', label: 'Портфель', icon: '📊' },
    { id: 'history', label: 'История', icon: '📋' },
    { id: 'settings', label: 'Настройки', icon: '⚙️' },
  ]

  return (
    <header className="header">
      <div className="header-content">
        {/* Логотип */}
        <div className="logo">
          <div className="logo-icon">
            <span>CE</span>
          </div>
          <div className="logo-text">
            <h1>CryptoExchanger</h1>
            <div className="version">v2.0 • Live</div>
          </div>
        </div>

        {/* Центральная навигация */}
        <nav className="nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Правая часть - Кошелек и статус */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3" style={{
            padding: '0.5rem 1rem',
            background: 'rgba(30, 41, 59, 0.5)',
            borderRadius: '9999px',
            border: '1px solid #475569'
          }}>
            <div style={{
              width: '0.5rem',
              height: '0.5rem',
              background: '#10b981',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
            <span style={{fontSize: '0.75rem', color: '#64748b'}}>Mainnet</span>
          </div>
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}
