const Gun = require( "gun" );
require('gun/lib/then.js')
require('gun/lib/unset.js')
const USERS = 'users';
const REQUEST_LIST = 'request_list';
const INVITE_LIST = 'invite_list';
const FELLOWSHIP_MEMBER_OF = "fellowship_member_of"
const FELLOWSHIP = 'fellowship';

class database {
    constructor(){
        this.db = new Gun();
    }

    /**
     * Get a GUN user's information from the GUN database using a Discord User Object.
     *
     * @param user User
     * @returns {Promise<unknown>}
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
     * Adds a GUN user(addingUser) to the corresponding GUN user's set(owner) if isAddToSet=true.
     * If addingUser already is in that set, throw an error.
     *
     * @param owner
     * @param addingUser
     * @param addingUserId
     * @param set
     * @param isAddToSet
     * @param throwMessage
     * @returns {Promise<unknown>}
     */
    addIfUserNotInList(owner, addingUser, addingUserId, set, isAddToSet, throwMessage){
        return this.db.get(owner.gun).get(set).get(addingUserId).promise((resolved) => {
            if (resolved.put === undefined) {
                if(isAddToSet){
                    this.db.get(owner.gun).get(set).set(addingUser.gun);
                }
            } else {
                throw throwMessage
            }
            return [owner, addingUser];
        })
    }

    /**
     * Checks if a GUN user(movingUser) is in the set of the owner and removes it from the set.
     * Adds the GUN user(addingUser) to the owner's fellowship if isAddToSet=true.
     * If movingUser already is in that set, throw an error.
     *
     * @param owner
     * @param movingUser
     * @param movingUserId
     * @param set
     * @param isAccept
     * @param throwMessage
     * @returns {Promise<unknown>}
     */
    moveUserToFellowship(owner, movingUser, movingUserId, set, isAccept, throwMessage){
        return this.db.get(owner.gun).get(set).get(movingUserId).promise((resolved) => {
            if (resolved.put === undefined) {
                throw throwMessage;
            } else {
                this.db.get(owner.gun).get(set).unset(movingUser.gun);
                if(isAccept){
                    this.db.get(owner.gun).get(FELLOWSHIP).set(movingUser.gun);
                    this.db.get(movingUser.gun).get(FELLOWSHIP_MEMBER_OF).set(owner.gun);
                }
            }
            return [owner, movingUser];
        })
    }

    /**
     * Checks if a GUN user(removingUser) is in the set of the owner and removes it from the fellowship.
     * If movingUser is not in that set, throw an error.
     *
     * @param owner
     * @param removingUser
     * @param removingUserId
     * @param throwMessage
     * @returns {Promise<unknown>}
     */
    removeUserFromFellowship(owner, removingUser, removingUserId, throwMessage){
        return this.db.get(owner.gun).get(FELLOWSHIP).get(removingUserId).promise((resolved) => {
            if (resolved.put === undefined) {
                throw throwMessage;
            } else {
                this.db.get(owner.gun).get(FELLOWSHIP).unset(removingUser.gun);
                this.db.get(removingUser.gun).get(FELLOWSHIP_MEMBER_OF).unset(owner.gun);
            }
            return [owner, removingUser];
        })
    }

    /**
     * Registers a GUN user to the database with a int streak defined.
     *
     * @param user
     * @param streak
     * @param isTracking
     * @param successHandler
     * @param failureHandler
     * @returns {Promise<int>}
     */
    async addUser(user, streak, isTracking, successHandler, failureHandler) {
        console.log("dbAddUser");
        let db = this.db;
        await db.get(USERS).get(user.id).promise((resolved) => {
            if(resolved.put === undefined){
                let item = db.get(user.id).put({
                    streak: streak,
                    streak_max: streak,
                    isTracking: isTracking,
                    fellowship: {},
                    fellowship_member_of: {},
                    request_list: {},
                    invite_list: {},
                });
                db.get(USERS).set(item);
            } else {
                throw "User already exists in database."
            }
            return streak

        }).then(successHandler, failureHandler);
    }

    /**
     * INIT by requestingUser
     * Adds the GUN user (requestingUser) to the REQUESTS list of the specified GUN User (targetUser).
     * If the requestingUser is already in the REQUESTS or FELLOWSHIP list, an error message is thrown.
     *
     * @param requestingUser
     * @param targetUser
     * @param successHandler
     * @param failureHandler
     * @returns {Promise<void>}
     */
    async requestToJoinFellowship(requestingUser, targetUser, successHandler, failureHandler) {
        await Promise.all([this.getDBUser(requestingUser), this.getDBUser(targetUser)])
            .then((userInfo) => {
                let target = userInfo[0];
                let requesting = userInfo[1];
                // Check if requesting user is already in the fellowship of the target.
                return this.addIfUserNotInList(target, requesting, requestingUser.id, FELLOWSHIP, false, `You are already a member of ${targetUser.username}'s fellowship.`)
            })
            .then((userInfo) => {
                let target = userInfo[0];
                let requesting = userInfo[1];
                // Check if requesting user is already in the request list of the target, if not add it.
                return this.addIfUserNotInList(target, requesting, requestingUser.id, REQUEST_LIST, true, `You have already requested to join ${targetUser.username}'s fellowship.`)
            }).then(successHandler, failureHandler);
    }

    /**
     * INIT by invitingUser
     * Adds the GUN user (invitingUser) to the INVITE list of the specified GUN User (targetUser).
     * If the targetUser is already in the REQUESTS or FELLOWSHIP list, an error message is thrown.
     *
     * @param invitingUser
     * @param targetUser
     * @param successHandler
     * @param failureHandler
     * @returns {Promise<void>}
     */
    async inviteToJoinFellowShip(invitingUser, targetUser, successHandler, failureHandler){
        await Promise.all([this.getDBUser(invitingUser), this.getDBUser(targetUser)])
            .then((userInfo) => {
                let target = userInfo[0];
                let inviting = userInfo[1];
                // Check if target user is already in the fellowship of the inviting.
                this.addIfUserNotInList(inviting, target, targetUser.id, FELLOWSHIP, false,`${targetUser.username} is already a member of your fellowship.`)
            })
            .then((userInfo) => {
                // Notice the order switch because of the previous command.
                let target = userInfo[1];
                let inviting = userInfo[0];
                // Check if inviting user is already in the invite list of the target.
                this.addIfUserNotInList(target, inviting, invitingUser.id, FELLOWSHIP, false, `You have already invited ${targetUser.username} to join your fellowship.`)
            })
            .then(successHandler, failureHandler);
    }

    /**
     * INIT BY targetUser
     * Checks if the GUN user (requestingUser) is in the REQUESTS list of the specified GUN User (targetUser).
     * If the targetUser accepts the request with isAccept = true, the requestingUser
     *
     * @param requestingUser
     * @param targetUser
     * @param successHandler
     * @param failureHandler
     * @returns {Promise<void>}
     */
    async answerRequest(targetUser, requestingUser, isAccept, successHandler, failureHandler){
        await Promise.all([this.getDBUser(targetUser), this.getDBUser(requestingUser)])
            .then((userInfo) => {
                let target = userInfo[0];
                let requested = userInfo[1];
                // Check if target user is already in the fellowship of the inviting.
                this.moveUserToFellowship(target, requested, requestingUser.id, REQUEST_LIST, isAccept,`${targetUser.username} did not request to join your fellowship.`)
            })
            .then(successHandler, failureHandler);
    }

    /**
     * INIT BY targetUser
     * Checks if the GUN user (invitingUser) is in the INVITES list of the specified GUN User (targetUser).
     * If the targetUser accepts the request with isAccept = true, the requestingUser
     *
     * @param invitingUser
     * @param targetUser
     * @param successHandler
     * @param failureHandler
     * @returns {Promise<void>}
     */
    async answerInvite(targetUser, invitingUser, isAccept, successHandler, failureHandler){
        await Promise.all([this.getDBUser(targetUser), this.getDBUser(invitingUser)])
            .then((userInfo) => {
                let target = userInfo[0];
                let inviting = userInfo[1];
                // Check if target user is already in the fellowship of the inviting.
                this.moveUserToFellowship(inviting, target, targetUser.id, REQUEST_LIST, isAccept,`${targetUser.username} did not request to join your fellowship.`)
            })
            .then(successHandler, failureHandler);
    }


    reset(id){
        try{
            this.getDBUser(id).put({
                streak: 0,
            });
        } catch(e){
            return e
        }
    }

    getAllUsers() {
        let users = [];
        this.db.get(USERS).map().once(v => users.push(v));
        return users;
    }

    getRequests(id) {
        let users = [];
        this.db.get(id).get(REQUEST_LIST).map().once(v => users.push(v));
        return users;
    }

    getInvites(id) {
        let users = [];
        this.db.get(id).get(INVITE_LIST).map().once(v => users.push(v));
        return users;
    }

    getFellowship(id) {
        let users = [];
        this.db.get(id).get(FELLOWSHIP).map().once(v => users.push(v));
        return users;
    }


}

module.exports = { database }