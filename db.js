const Redis = require('ioredis');
const FELLOWSHIP = "_fellowship";
const MEMBERSHIP = "_membership";
const THRESHOLD = "_threshold";
const USERNAME = "_username";

class database {
    constructor(){
        this.client = new Redis();
        this.client.on("message", function (channel, message) {
            console.log("Receive message %s from channel %s", message, channel);
        });
    }

    async isUserTracked(user){
        console.log("dbIsUserTracked");
        console.log(`HEXISTS ${user.id.toString()} streak_max`);
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

    async trackUser(user, streak_start, streak_length) {
        console.log("dbTrackUser");
        console.log(`HSET ${user.id.toString()} streak_current ${streak_start} streak_max ${streak_length}`);
        await this.client.hset(user.id.toString(), "streak_current", streak_start, "streak_max", streak_length);
    }

    async getStreak(user, successHandler, failureHandler){
        console.log("dbGetStreak");
        await this.isUserTracked(user).then((exists) => {
            if (!exists) {
                throw 'Your user has not been tracked. Type !track help for more information.';
            }
            console.log(`HMGET ${user.id.toString()} streak_current streak_max`);
            this.client.hmget(user.id.toString(), "streak_current", "streak_max");
        }).then(successHandler, failureHandler);
    }

    async setFocus(user, focus, successHandler, failureHandler){
        console.log("dbSetFocus");
        await this.isUserTracked(user).then((exists) => {
            if (!exists) {
                throw 'Your user has not been tracked. Type !track help for more information.';
            }
            console.log(`HSET ${user.id.toString()} focus ${focus}`);
            this.client.hset(user.id.toString(), "focus", focus);
        }).then(successHandler, failureHandler);
    }

    async setThreshold(user, threshold, successHandler, failureHandler){
        console.log("dbSetThreshold");
        await this.isUserTracked(user).then((exists) => {
            if (!exists) {
                throw 'Your user has not been tracked. Type !track help for more information.';
            }
            console.log(`HSET ${user.id.toString()} threshold ${threshold}`);
            this.client.hset(user.id.toString(), "threshold", threshold);
        }).then(successHandler, failureHandler);
    }

    async trackedList(user, successHandler, failureHandler){
        let memberList;
        await this.client.smembers(user.id.toString() + MEMBERSHIP).then((array) => {
            if(array.length === 0) throw 'You are not a part of any fellowships.'
            memberList = array;
            console.log(memberList);
            return Promise.all(memberList.map((member) => {
                console.log(`HMGET ${member} streak_current threshold`);
                return this.client.hmget(member, "streak_current", "threshold");
            }));
        }).then((list) => {
            //The oneliner filters out all the entries for which the threshold is not greater than streak_current.
            console.log(list);
            console.log(this.getDaysDifference(list[0][0]))
            console.log(list[0][1]);
            memberList = memberList.filter((member, i) => parseInt(this.getDaysDifference(list[i][0], 10)) < parseInt(list[i][1], 10));
            console.log(memberList);
            if(memberList.length === 0){
                throw 'None of the fellowships you are a part of are tracked and within the threshold.'
            }
            return memberList;
        }).then(successHandler, failureHandler);
    }

    async reset(user, successHandler, failureHandler) {
        await this.isUserTracked(user).then((exists) => {
            if (!exists) {
                throw 'Your user has not been tracked. Type !track help for more information.';
            }
            console.log(`HMGET ${user.id.toString()} "streak_max" "streak_current"`);
            return this.client.hmget(user.id.toString(), "streak_max", "streak_current");
        }).then(async (result) => {
            const streak = parseInt(result[0], 10);
            const timestamp = parseInt(result[1], 10);
            const streak_new = this.getDaysDifference(timestamp);
            const streak_max = Math.max(streak, streak_new);
            console.log(`HSET ${user.id.toString()} "streak_current" ${Date.now()} "streak_max" ${streak_max}`);
            this.client.hset(user.id.toString(), "streak_current", Date.now(), "streak_max", streak_max);
            console.log(`HGET ${user.id.toString()} "focus"`);
            return this.client.hget(user.id.toString(), "focus");
        }).then(successHandler, failureHandler);
    }

    async addToFellowship(user, owner, successHandler, failureHandler){
        console.log("dbAddToFellowship");
        console.log(`SADD ${owner.id.toString() + FELLOWSHIP} ${user.id.toString()}`);
        await this.client.sadd(owner.id.toString() + FELLOWSHIP, user.id.toString()).then((result) => {
            if(result == 0) throw '';
            console.log(`SADD ${user.id.toString() + MEMBERSHIP} ${owner.id.toString()}`);
            return this.client.sadd(user.id.toString() + MEMBERSHIP, owner.id.toString());
        }).then(async (result) =>{
            if(result == 0) throw '';
            console.log(`SET ${user.id.toString() + USERNAME} ${user.username}`);
            await this.client.set(user.id.toString() + USERNAME, user.username);
            console.log(`SET ${owner.id.toString() + USERNAME} ${owner.username}`);
            await this.client.set(owner.id.toString() + USERNAME, owner.username);
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

    async getMembership(user, successHandler, failureHandler){
        console.log("dbGetMembership");
        console.log(`SMEMBERS ${user.id.toString() + MEMBERSHIP}`);
        await this.client.smembers(user.id.toString() + MEMBERSHIP).then((array) => {
            if(array.length === 0) throw ''
            return array
        }).then(successHandler, failureHandler);
    }

    async getFellowship(user, successHandler, failureHandler){
        console.log("dbGetFellowship");
        console.log(`SMEMBERS ${user.id.toString() + FELLOWSHIP}`);
        await this.client.smembers(user.id.toString() + FELLOWSHIP).then((array) => {
            if (array.length === 0) throw ''
            return array
        }).then(successHandler, failureHandler);
    }

    async getUsernames(array, returnHandler){
        await Promise.all(array.map((user) => {
            console.log(`GET ${user + USERNAME}`);
            return this.client.get(user + USERNAME)
        }))
            .then((usernames) => {
                console.log(usernames);
                return usernames.join("\n");
            }).then(returnHandler);
    }
}

module.exports = { database }