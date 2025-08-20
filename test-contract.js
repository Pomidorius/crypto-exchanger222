// Быстрый тест isContractDeployed
const { isContractDeployed, PROXY_SWAP_ADDRESS } = require('./src/app/utils/constants.ts');

console.log('Testing isContractDeployed...');
console.log('PROXY_SWAP_ADDRESS:', PROXY_SWAP_ADDRESS);
console.log('isContractDeployed():', isContractDeployed());

if (isContractDeployed()) {
  console.log('✅ Контракт задеплоен!');
} else {
  console.log('❌ Контракт не задеплоен');
}
