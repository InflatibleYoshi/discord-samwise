const Schedule = require('node-schedule');
const Gun = require( "gun" );
require('gun/lib/then.js');
require('gun/lib/unset.js');
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

    getDBUserFellowship(target, user) {
        return this.db.get(USERS).get(target.id).get(FELLOWSHIP).get(user.id).promise((resolved) =>{
            if(resolved.put === undefined) {
                return false
            }
            return true
        });
    }


    /**
     * Registers a GUN user to the database with a int streak and date of starting point defined.
     *
     * @param user
     * @param streak_duration
     * @param streak_start
     * @param utc_streak_hour
     * @param isTracking?
     */
    addUser(user, streak_duration, streak_start, utc_streak_hour, isTracking) {
        console.log("dbAddUser");
        let item = this.db.get(user.id).put({
            name: user.username,
            streak: streak_duration,
            streak_date: streak_start,
            utc_streak_hour: utc_streak_hour });
        this.db.get(USERS).set(item);
        if(isTracking){
            this.addTracker(user);
        }
    }

    reset(user, streak_start, utc_streak_hour){
        this.db.get(user.id).put({
            streak: 0,
            streak_date: streak_start,
            utc_streak_hour: utc_streak_hour,
        });
    }

    streakUpdate(user){
        let date = Date.now();
        this.db.get(user.id).get('date').once((timestamp) => {
            date = timestamp;
            let streak = Math.floor((Date.now() - timestamp) / (1000 * 3600 * 24));
            let newMax;
            this.db.get(user.id).put({
                streak: streak
            })
            this.db.get(user.id).get('streak_max').once((currentMax) => {
                if(currentMax < newMax){
                    this.db.get(user.id).put({
                        streak_max: newMax
                    })
                }
            })
        });
    }

    addTracker(user){
        console.log("addTracker")
        this.db.get(user.id).get('utc_streak_hour').once((hour) => {
            if(trackedUsers.has(user.id)){
                trackedUsers.get(user.id).reschedule(`* ${hour} * * *`);
                console.log("jobReScheduled")
            } else {
                let job = Schedule.scheduleJob(`* ${hour} * * *`, this.streakUpdate(user));
                trackedUsers.set(user.id, job);
                console.log("jobScheduled")
            }
        });
    }

    /**
     * INIT BY either targetUser or addingUser
     * Checks if the GUN user (addingUser) is in the FELLOWSHIP of the specified GUN User (targetUser).
     * If there is a .
     *
     * @param addingUser
     * @param targetUser
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
                return addingUser;
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
                throw leavingUser
            } else {
                this.db.get(target.gun).get(FELLOWSHIP).unset(leaving.gun);
                this.db.get(leaving.gun).get(FELLOWSHIP_MEMBER_OF).unset(target.gun);
                return leavingUser
            }
        }).then(successHandler, failureHandler);
    }

    getAllUsers() {
        let users = [];
        this.db.get(USERS).map().get('name').map(x => users.push(x));
        return users;
    }

    getFellowship(id) {
        let users = [];
        this.db.get(id).get(FELLOWSHIP).map().get('name').map(x => users.push(x));
        return users;
    }

    getFellowshipIDs(id){
        return this.db.get(id).get(FELLOWSHIP).map((value, key) => key)
    }

    getMembership(id) {
        let users = [];
        this.db.get(id).get(FELLOWSHIP_MEMBER_OF).map().get('name').map(x => users.push(x));
        return users;
    }
}

module.exports = { database }