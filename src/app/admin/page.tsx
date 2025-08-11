// src/app/admin/page.tsx
'use client'

import { useEffect, useState } from 'react'

interface SwapLog {
  timestamp: string
  success: boolean
  fromToken: string
  toToken: string
  amount: string
  slippage: number
  error: string | null
}

export default function AdminPage() {
  const [logs, setLogs] = useState<SwapLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/swaps')
      .then(res => res.json())
      .then((data: SwapLog[]) => setLogs(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Загрузка…</p>
  if (!logs.length) return <p>Лог пуст.</p>

  return (
    <main style={{ padding: 20 }}>
      <h1>История свапов</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr>
            <th>Время</th>
            <th>Пара</th>
            <th>Сумма</th>
            <th>Slippage</th>
            <th>Статус</th>
            <th>Ошибка</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i} style={{ background: i % 2 ? '#f9f9f9' : '#fff' }}>
              <td style={{ padding: 8 }}>{new Date(log.timestamp).toLocaleString()}</td>
              <td style={{ padding: 8 }}>{log.fromToken} → {log.toToken}</td>
              <td style={{ padding: 8 }}>{log.amount}</td>
              <td style={{ padding: 8 }}>{log.slippage}%</td>
              <td style={{ padding: 8 }}>{log.success ? '✅' : '❌'}</td>
              <td style={{ padding: 8 }}>{log.error || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
