@echo off
@echo off
echo Deploying SimpleProxySwap with funded tokens...
npm run deploy:simple
pause
npx hardhat run scripts/deploy.js --network localhost
pause
