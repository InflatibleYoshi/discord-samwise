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
        console.log("dbGetUser");
        console.log(user.id.toString());
        await this.client.hexists(user.id.toString(), "streak_max").then((result) => {
            return result === 1
        });
    }

    async isUserInFellowship(user, target){
        console.log("dbIsUserInFellowship");
        await this.client.sismember(target.id.toString() + FELLOWSHIP, user.id.toString()).then((result) => {
            return result === 1
        });
    }

    getDaysDifference(timestamp){
        return Math.floor((Date.now() - timestamp) / (1000 * 3600 * 24));
    }

    async addUser(user) {
        console.log("dbAddUser");
        await this.client.hset(user.id.toString(), "streak_current", -1, "streak_max", -1);
        await this.client.sadd(USERS, user.id.toString());
    }

    async addUser(user, streak_start, streak_length) {
        console.log("dbAddUser");
        await this.client.hset(user.id.toString(), "streak_current", streak_start, "streak_max", streak_length);
        await this.client.sadd(USERS, user.id.toString());
    }

    async addToFellowship(target, user, successHandler, failureHandler){
        console.log("dbAddToFellowship");
        this.client.sadd(user.id.toString() + FELLOWSHIP, target.id.toString()).then((result) => {
            if(result === 0) throw ''
            return this.client.sadd(target.id.toString() + MEMBERSHIP, user.id.toString());
        }).then((result) =>{
            if(result === 0) throw '';
        }).then(successHandler, failureHandler);
    }

    async removeFromFellowship(target, user, successHandler, failureHandler){
        console.log("dbRemoveFromFellowship")
        await this.client.srem(user.id.toString() + FELLOWSHIP, target.id.toString()).then((result) => {
            if(result === 0) throw ''

            return this.client.srem(target.id.toString() + MEMBERSHIP, user.id.toString());
        }).then((result) =>{
            if(result === 0) throw '';
        }).then(successHandler, failureHandler);
    }

    async reset(user, successHandler, failureHandler){
        this.isUserExists(user).then( (exists) => {
            if(!exists){
                throw 'Your user has not been registered in the bot.'
            }
            return this.client.hget(user.id.toString(), "streak_max");
        }).then(async (result) => {
            const streak = parseInt(result, 10);
            if (streak === -1) {
                throw 'Your user options are set to silent, register again in order to get this functionality.'
            }
            const streak_current = await this.client.hget(user.id.toString(), "streak_current");
            const timestamp = parseInt(streak_current, 10);
            const streak_new = this.getDaysDifference(timestamp);
            const streak_max = Math.max(streak, streak_new);
            this.client.hset(user.id.toString(), "streak_current", Date.now().getTime(), "streak_max", streak_max);
        }).then(successHandler, failureHandler)
    }

    async getAllUsers(){
        await this.client.smembers(USERS)
    }
    async getMembership(user){
        await this.client.smembers(user.id.toString() + MEMBERSHIP)
    }
    async getFellowship(user){
        await this.client.smembers(user.id.toString() + FELLOWSHIP)
    }
}

module.exports = { database }