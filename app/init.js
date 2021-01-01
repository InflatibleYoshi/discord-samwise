const Eris = require('eris');
const Redis = require('ioredis');
const text = require('./text.js');
const db = require('./db.js');

export default class Init{
    static bot;
    static redis;

    constructor(){
        const vault = require('node-vault-client');

        const vaultClient = vault.boot('main', {
            api: { url: process.env.VAULT_URL },
            auth: {
                type: 'appRole',
                config: { role_id: process.env.VAULT_ROLE_ID }
            },
        });
        console.log("Initialized vault.");

        let redisClient;

        vaultClient.read('samwise/redis/password').then(v => {
            redisClient = new Redis({
                port: 6379, // Redis port
                host: process.env.REDIS_HOST, // Redis host
                family: 4, // 4 (IPv4) or 6 (IPv6)
                password: v,
                db: 0,
            });
        }).catch(e => console.error(e));

        console.log("Initialized redis client.");

        this.redis = new db.database(redisClient);

        vaultClient.read('samwise/bot/token').then(v => {
            this.bot = new Eris.CommandClient(v, {}, {
                description: text.BOT_DESCRIPTION,
                deleteCommand: true,
                owner: text.BOT_OWNER,
                prefix: "!"
            });
        }).catch(e => console.error(e));

        console.log("Initialized bot client.");
    }

    static getDb() {
        return this.redis;
    }

    static getBot() {
        return this.bot;
    }
}