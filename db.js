const Schedule = require('node-schedule');
const Gun = require( "gun" );
require('gun/lib/then.js')
require('gun/lib/unset.js')
const USERS = 'users';
const FELLOWSHIP_MEMBER_OF = "fellowship_member_of"
const FELLOWSHIP = 'fellowship';

const trackedUsers = new Map();

class database {
    constructor(){
        this.db = new Gun();
    }

    /**
     * Get a GUN user's information from the GUN database using a Discord User Object.
     *
     * @param user User
     * @returns {Promise<>}
     */
    getDBUser(user) {
        return this.db.get(USERS).get(user.id).promise((resolved) =>{
            if(resolved.put === undefined) {
                throw user.username + " has not registered with the Samwise App."
            }
            return resolved
        });
    }

    /**
     * Registers a GUN user to the database with a int streak and date of starting point defined.
     *
     * @param user
     * @param streak_duration
     * @param utc_streak_hour
     * @param utc_streak_min
     * @param isTracking
     */
    addUser(user, streak_duration, streak_start, utc_streak_hour, utc_streak_min, isTracking) {
        console.log("dbAddUser");
        let item;
        if(this.isUserExists(user)){
            item = this.db.get(user.id).put({
                id: user.id,
                streak: streak_duration,
                streak_date: streak_start,
                utc_streak_hour: utc_streak_hour,
                utc_streak_min: utc_streak_min,
                streak_max: streak_duration,
                isTracking: isTracking,
                fellowship: {},
                fellowship_member_of: {},
            });
        } else {
            item = this.db.get(user.id).put({
                id: user.id,
                streak: streak_duration,
                streak_date: streak_start,
                utc_streak_hour: utc_streak_hour,
                utc_streak_min: utc_streak_min,
                isTracking: isTracking,
            });
        }
        this.db.get(USERS).set(item);
    }

    isUserExists(user){
        return Gun.node.is(this.db.get(USERS).get(user.id))
    }

    isUserInFellowship(target, user){
        return Gun.node.is(this.db.get(USERS).get(target.id).get(FELLOWSHIP).get(user.id))
    }

    reset(user, streak_start, utc_streak_hour, utc_streak_min){
        this.db.get(user.id).put({
            streak: 0,
            streak_date: streak_start,
            utc_streak_hour: utc_streak_hour,
            utc_streak_min: utc_streak_min
        });
    }

    streakUpdate(user){
        let newMax;
        this.db.get(user.id).get('streak').once((currentStreak) => {
            this.db.get(user.id).put({
                streak: currentStreak + 1
            })
            newMax = currentStreak + 1;
        })
        this.db.get(user.id).get('streak_max').once((currentMax) => {
            if(currentMax < newMax){
                this.db.get(user.id).put({
                    streak_max: newMax
                })
            }
        })
    }

    scheduleStreakUpdate(){

    }

    /**
     * INIT BY either targetUser or addingUser
     * Checks if the GUN user (addingUser) is in the FELLOWSHIP of the specified GUN User (targetUser).
     * If there is a .
     *
     * @param addingUser
     * @param targetUser
     * @param errorChannel
     * @param successHandler
     * @param failureHandler
     * @returns {Promise<void>}
     */
    async addToFellowship(targetUser, addingUser, successHandler, failureHandler){
        let target = await this.getDBUser(targetUser);
        let adding = await this.getDBUser(addingUser);
        // Check if target user is already in the fellowship of the inviting.
        await this.db.get(target.gun).get(FELLOWSHIP).get(addingUser.id).promise((resolved) => {
            if (resolved.put === undefined) {
                throw "";
            } else {
                this.db.get(target.gun).get(FELLOWSHIP).set(adding.gun);
                this.db.get(adding.gun).get(FELLOWSHIP_MEMBER_OF).set(target.gun);
                return targetUser;
            }
        }).then(successHandler, failureHandler);
    }

    /**
     * INIT BY either targetUser or leavingUser
     * Checks if the GUN user (leavingUser) is in the fellowship of the specified GUN User (targetUser).
     * If so, the leavingUser is removed from the targetUser's fellowship.
     *
     * @param targetUser
     * @param leavingUser
     * @param successHandler
     * @param failureHandler
     * @returns {Promise<void>}
     */
    async removeFromFellowship(targetUser, leavingUser, successHandler, failureHandler){
        let target = await this.getDBUser(targetUser);
        let leaving = await this.getDBUser(leavingUser);
        // Check if target user is already in the fellowship of the inviting.
        await this.db.get(target.gun).get(FELLOWSHIP).get(leavingUser.id).promise((resolved) => {
            if (resolved.put === undefined) {
                throw ""
            } else {
                this.db.get(target.gun).get(FELLOWSHIP).unset(leaving.gun);
                this.db.get(leaving.gun).get(FELLOWSHIP_MEMBER_OF).unset(target.gun);
            }
        }).then(successHandler, failureHandler);
    }

    getAllUsers(id) {
        let users = [];
        this.db.get(id).get(USERS).map().once(v => users.push(v));
        return users;
    }

    getFellowship(id) {
        let users = [];
        this.db.get(id).get(FELLOWSHIP).map().once(v => users.push(v));
        return users;
    }

    getMembership(id) {
        let users = [];
        this.db.get(id).get(FELLOWSHIP_MEMBER_OF).map().once(v => users.push(v));
        return users;
    }
}

module.exports = { database }