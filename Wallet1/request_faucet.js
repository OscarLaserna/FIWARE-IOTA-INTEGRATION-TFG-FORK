// Importar las bibliotecas necesarias
const fetch = require('node-fetch');

// Importa la configuración de red desde networkConfig.js
const networkConfig = require('./networkConfig.js');
const faucetApi = networkConfig.faucetApi;

// Define la dirección de recepción en formato Bech32
const receivingAddress = 'rms1qqphz3plmrx8p86kfvq00cs3rcn5p78edjh90hue0tcsae854esrjghl5nz';
//const receivingAddress = 'rms1qpun0fuekhvjvyhesrnehuvuxq6p2rlwapflg073vtx450ntderdjqjr74w';
//const receivingAddress = 'rms1qqedg4l5g6sxr5k6zs96k6vm66arpgnl0zzx0e9n7j9frtwtmmwzsev0nw4';
// Función asincrónica principal
async function run() {
  // Llama a la función para solicitar fondos desde el faucet y espera su resultado
  const request = await requestFunds(faucetApi, receivingAddress);

  // Imprime un mensaje en la consola indicando que los fondos fueron solicitados desde el faucet
  console.log(`Funds were requested from faucet:`);
  console.log(request, '\n');
}

// Función asincrónica para solicitar fondos desde el faucet
async function requestFunds(faucetUrl, addressBech32) {
  // Realiza una solicitud POST a la URL del faucet
  const requestFunds = await fetch(faucetUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ address: addressBech32 }),
  });
  return await requestFunds.json();
}
run();
