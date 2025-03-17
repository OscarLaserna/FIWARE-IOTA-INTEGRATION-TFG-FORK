const fetch = require('node-fetch');
const networkConfig = require('./networkConfig.js');

// Dirección de recepción en IOTA Testnet
const receivingAddress = 'tst1qzxynkw7zxesjr2x50mre25dtva03tpgrwwtnfrmqcakwft7pd09jlj979x';

// URL del faucet desde networkConfig.js
const faucetApi = networkConfig.faucetApi;

async function run() {
  try {
    const request = await requestFunds(faucetApi, receivingAddress);
    console.log(`Funds were requested from faucet:`, request);
  } catch (error) {
    console.error('Error requesting funds:', error);
  }
}

// Función para solicitar fondos al faucet
async function requestFunds(faucetUrl, addressBech32) {
  const response = await fetch(faucetUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ address: addressBech32 }),
  });

  if (!response.ok) {
    throw new Error(`Faucet request failed: ${response.statusText}`);
  }

  return await response.json();
}

run();
