// src/app/api/swaps/route.ts
import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { join } from 'path'

const LOG_FILE = join(process.cwd(), 'swap-log.json')

export async function GET() {
  try {
    // Если файл ещё не создан — вернём пустой массив
    let data = '[]'
    try {
      data = await fs.readFile(LOG_FILE, 'utf8')
    } catch {}
    const arr = JSON.parse(data)
    return NextResponse.json(arr)
  } catch (e) {
    return NextResponse.json({ error: 'Cannot read log' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { success, fromToken, toToken, amount, slippage, error } = await req.json()
    const logEntry = {
      timestamp: new Date().toISOString(),
      success,
      fromToken,
      toToken,
      amount,
      slippage,
      error: error || null,
    }
    let arr = []
    try {
      const prev = await fs.readFile(LOG_FILE, 'utf8')
      arr = JSON.parse(prev)
    } catch {}
    arr.push(logEntry)
    await fs.writeFile(LOG_FILE, JSON.stringify(arr, null, 2))
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 })
  }
}
