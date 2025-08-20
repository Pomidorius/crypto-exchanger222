# PowerShell script for auto-deploy
Write-Host "🚀 Crypto Exchanger - Auto Deploy Start" -ForegroundColor Green
Write-Host "========================================"
Write-Host ""

# Функция для проверки запущенных процессов
function Test-ProcessRunning {
    param($ProcessName)
    Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
}

# Проверяем, что мы в правильной директории
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found. Please run from project root." -ForegroundColor Red
    exit 1
}

Write-Host "📡 Starting Hardhat node..." -ForegroundColor Yellow

# Запускаем Hardhat node в отдельном окне
$hardhatJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npx hardhat node
}

Write-Host "⏱️  Waiting for node to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

Write-Host "🤖 Deploying contract..." -ForegroundColor Cyan
try {
    $deployResult = npx hardhat run scripts/auto-deploy.js --network localhost
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Contract deployed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Starting Next.js..." -ForegroundColor Blue
        npm run dev
    } else {
        throw "Deployment failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Host "❌ Contract deployment failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Try manual setup:" -ForegroundColor Yellow
    Write-Host "   1. npm run node" -ForegroundColor Gray
    Write-Host "   2. npm run auto:deploy" -ForegroundColor Gray
    Write-Host "   3. npm run dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Press any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
} finally {
    # Очистка: останавливаем Hardhat node job
    if ($hardhatJob) {
        Stop-Job $hardhatJob -ErrorAction SilentlyContinue
        Remove-Job $hardhatJob -ErrorAction SilentlyContinue
    }
}
