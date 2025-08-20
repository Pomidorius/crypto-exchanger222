@echo off
echo ========================================
echo 🚀 Crypto Exchanger - Auto Deploy Start
echo ========================================
echo.

echo 📡 Starting Hardhat node...
start "Hardhat Node" cmd /k "npx hardhat node"

echo ⏱️  Waiting for node to start...
timeout /t 5 /nobreak > nul

echo 🤖 Deploying contract...
call npx hardhat run scripts/auto-deploy.js --network localhost

if %ERRORLEVEL% EQU 0 (
    echo ✅ Contract deployed successfully!
    echo.
    echo 🌐 Starting Next.js...
    call npm run dev
) else (
    echo ❌ Contract deployment failed!
    echo.
    echo 💡 Try manual setup:
    echo    1. npm run node
    echo    2. npm run auto:deploy
    echo    3. npm run dev
    pause
)
