import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 Auto-deploy API triggered')
    
    // Проверяем, что это локальная разработка
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { success: false, error: 'Auto-deploy only available in development' },
        { status: 403 }
      )
    }

    // Запускаем скрипт автодеплоя
    const result = await runAutoDeploy()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        contractAddress: result.contractAddress,
        message: 'Contract deployed successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Auto-deploy API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function runAutoDeploy(): Promise<{ success: boolean; contractAddress?: string; error?: string }> {
  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'auto-deploy.js')
    
    // Определяем команду для Windows/Unix
    const isWindows = process.platform === 'win32'
    const npxCmd = isWindows ? 'npx.cmd' : 'npx'
    
    const deployProcess = spawn(npxCmd, ['hardhat', 'run', scriptPath, '--network', 'localhost'], {
      cwd: process.cwd(),
      stdio: 'pipe'
    })
    
    let output = ''
    let contractAddress = ''
    
    deployProcess.stdout.on('data', (data) => {
      const text = data.toString()
      output += text
      console.log('[Deploy]', text.trim())
      
      // Ищем адрес контракта в выводе
      const addressMatch = text.match(/deployed:\s*(0x[a-fA-F0-9]{40})/)
      if (addressMatch) {
        contractAddress = addressMatch[1]
      }
    })
    
    deployProcess.stderr.on('data', (data) => {
      const text = data.toString()
      output += text
      console.error('[Deploy Error]', text.trim())
    })
    
    deployProcess.on('close', (code) => {
      if (code === 0 && contractAddress) {
        resolve({
          success: true,
          contractAddress
        })
      } else {
        resolve({
          success: false,
          error: `Deployment failed with code ${code}`
        })
      }
    })
    
    // Таймаут на случай зависания
    setTimeout(() => {
      deployProcess.kill()
      resolve({
        success: false,
        error: 'Deployment timeout'
      })
    }, 120000) // 2 минуты
  })
}
