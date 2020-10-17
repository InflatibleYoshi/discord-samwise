const Redis = require('ioredis');
const USERS = 'users';
const FELLOWSHIP = "_fellowship";
const MEMBERSHIP = "_membership";

class database {
    constructor(){
        this.client = new Redis();
        this.client.on("message", function (channel, message) {
            console.log("Receive message %s from channel %s", message, channel);
        });
    }

    async isUserExists(user){
        console.log("dbisUserExists");
        console.log(`HEXISTS ${user.id.toString()} "streak_max"`);
        return this.client.hexists(user.id.toString(), "streak_max").then((result) => {
            return result == 1
        });
    }

    async isUserInFellowship(user, owner){
        if(user.id === owner.id){
            return false;
        }
        console.log("dbIsUserInFellowship");
        console.log(`SISMEMBER ${owner.id.toString() + FELLOWSHIP} ${user.id.toString()}`);
        return this.client.sismember(owner.id.toString() + FELLOWSHIP, user.id.toString()).then((result) => {
            return result == 1
        });
    }

    getDaysDifference(timestamp){
        return Math.floor((Date.now() - timestamp) / (1000 * 3600 * 24));
    }

    async addUser(user, streak_start, streak_length) {
        console.log("dbAddUser");
        console.log(`HSET ${user.id.toString()} streak_current ${streak_start} streak_max ${streak_length}`);
        await this.client.hset(user.id.toString(), "streak_current", streak_start, "streak_max", streak_length);
        console.log(`SADD users ${user.id.toString()}`);
        await this.client.sadd(USERS, user.id.toString());

    }

    async addToFellowship(user, owner, successHandler, failureHandler){
        console.log("dbAddToFellowship");
        console.log(`SADD ${owner.id.toString() + FELLOWSHIP} ${user.id.toString()}`);
        await this.client.sadd(owner.id.toString() + FELLOWSHIP, user.id.toString()).then((result) => {
            if(result == 0) throw '';
            console.log(`SADD ${user.id.toString() + MEMBERSHIP} ${owner.id.toString()}`);
            return this.client.sadd(user.id.toString() + MEMBERSHIP, owner.id.toString());
        }).then((result) =>{
            if(result == 0) throw '';
        }).then(successHandler, failureHandler);
    }

    async removeFromFellowship(user, owner, successHandler, failureHandler){
        console.log("dbRemoveFromFellowship");
        console.log(`SREM ${owner.id.toString() + FELLOWSHIP} ${user.id.toString()}`);
        await this.client.srem(owner.id.toString() + FELLOWSHIP, user.id.toString()).then((result) => {
            if(result == 0) throw ''
            console.log(`SREM ${user.id.toString() + MEMBERSHIP} ${owner.id.toString()}`);
            return this.client.srem(user.id.toString() + MEMBERSHIP, owner.id.toString());
        }).then((result) =>{
            if(result == 0) throw '';
        }).then(successHandler, failureHandler);
    }

    async reset(user, successHandler, failureHandler) {
        await this.isUserExists(user).then((exists) => {
            if (!exists) {
                throw 'Your user has not been tracked. Type !track help for more information.';
            }
            console.log(`HGET ${user.id.toString()} streak_max`);
            return this.client.hget(user.id.toString(), "streak_max");
        }).then(async (result) => {
            const streak = parseInt(result, 10);
            console.log(`HGET ${user.id.toString()} streak_current`);
            const streak_current = await this.client.hget(user.id.toString(), "streak_current");
            const timestamp = parseInt(streak_current, 10);
            const streak_new = this.getDaysDifference(timestamp);
            const streak_max = Math.max(streak, streak_new);
            console.log(`HSET ${user.id.toString()} streak_current ${Date.now()} streak_max ${streak_max}`);
            return this.client.hset(user.id.toString(), "streak_current", Date.now(), "streak_max", streak_max);
        }).then(successHandler, failureHandler);
    }

    async getMembership(user, successHandler, failureHandler){
        console.log(`SMEMBERS ${user.id.toString() + MEMBERSHIP}`);
        await this.client.smembers(user.id.toString() + MEMBERSHIP).then((array) =>{
            if(array.length === 0) throw ''
        }).then(successHandler, failureHandler);
    }
    async getFellowship(user, successHandler, failureHandler){
        console.log(`SMEMBERS ${user.id.toString() + FELLOWSHIP}`);
        await this.client.smembers(user.id.toString() + FELLOWSHIP).then((array) =>{
            if(array.length === 0) throw ''
        }).then(successHandler, failureHandler);
    }
}

module.exports = { database }