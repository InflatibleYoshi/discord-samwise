const Eris = require('eris');
const Redis = require('ioredis');
const text = require('./app/text.js');
const db = require('./app/db.js');

class init{
    constructor(){
        const vault = require('node-vault-client');

        this.vault = vault.boot('main', {
            api: { url: process.env.VAULT_URL },
            auth: {
                type: 'appRole', // or 'token', 'iam'
                config: { role_id: process.env.VAULT_ROLE_ID }
            },
        });

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

        this.redis.on("message", function (channel, message) {
            console.log("Receive message %s from channel %s", message, channel);
        });

        this.redis = new db.database(redisClient);

        vaultClient.read('samwise/bot/token').then(v => {
            this.bot = new Eris.CommandClient(v, {}, {
                description: text.BOT_DESCRIPTION,
                deleteCommand: true,
                owner: text.BOT_OWNER,
                prefix: "!"
            });
        }).catch(e => console.error(e));
    }

    getDb() {
        return this.redis;
    }

    getBot() {
        return this.bot;
    }
}

module.exports = { init }