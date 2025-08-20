// Быстрая диагностика конфигурации
console.log('🔍 Диагностика конфигурации:');
console.log('NEXT_PUBLIC_CHAIN_ID:', process.env.NEXT_PUBLIC_CHAIN_ID);
console.log('NEXT_PUBLIC_RPC_URL:', process.env.NEXT_PUBLIC_RPC_URL);

// Импортируем константы
const constants = require('./src/app/utils/constants.ts');
console.log('PROXY_SWAP_ADDRESS:', constants.PROXY_SWAP_ADDRESS);
console.log('isContractDeployed():', constants.isContractDeployed());

// Проверяем сеть
const network = {
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID || '1'
};
console.log('Current network chainId:', network.chainId);

const CONTRACT_ADDRESSES = {
  '31337': '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  '11155111': '0x0000000000000000000000000000000000000001',
  '1': '0x0000000000000000000000000000000000000001'
};

const address = CONTRACT_ADDRESSES[network.chainId];
console.log('Selected contract address:', address);
console.log('Is deployed:', address !== '0x0000000000000000000000000000000000000001');
