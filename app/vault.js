const VaultClient = require('node-vault-client');

const vaultClient = VaultClient.boot('main', {
    api: { url: 'https://127.0.0.1:8200/' },
    auth: {
        type: 'appRole', // or 'token', 'iam'
        config: { role_id: '637c065f-c644-5e12-d3d1-e9fa4363af61' }
    },
});

vaultClient.read('samwise/bot/token').then(v => {
    console.log(v);
}).catch(e => console.error(e));