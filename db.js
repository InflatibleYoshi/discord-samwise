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

    getDBUser(user) {
        return this.db.get(USERS).get(user.id).promise((resolved) =>{
            console.log(user.username);
            console.log(resolved);
            if(resolved.put === undefined) {
                throw user.username + " has not registered with the Samwise App."
            }
            return resolved
        });
    }

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

    async requestToJoinFellowship(requestingUser, targetUser, successHandler, failureHandler) {
        console.log("dbRequest");
        await Promise.all([this.getDBUser(requestingUser), this.getDBUser(targetUser)]).then((users) => {
            const requester = users[0];
            const target = users[1];
            return target.get(REQUEST_LIST).get(requestingUser.id).promise((resolved) => {
                if (resolved.put === undefined) {
                    targetUser.get(REQUEST_LIST).set(requester.gun);
                    return targetUser;
                } else {
                    throw `You have already requested to join the fellowship of ${targetUser.username}`
                }
            })
        }).then(successHandler, failureHandler);
    }

    inviteToJoinFellowship(invitingId, targetId) {
        try {
            let invitingUser = this.getDBUser(invitingId);
            let targetUser = this.getDBUser(targetId);
            targetUser.get(INVITE_LIST).set(invitingUser);
        } catch (e) {
            return e
        }
        return "Invite sent to user %s"
    }

    answerRequest(requestingId, targetId, isAccept) {
        try {
            let requestingUser = this.getDBUser(requestingId);
            let targetUser = this.getDBUser(targetId);
            targetUser.get(REQUEST_LIST).get(requestingId)
                .not(() => {throw new Error("Request does not exist.")})
                .once(function () {
                    targetUser.get(REQUEST_LIST).unset(requestingUser);
                    if (isAccept) {
                        targetUser.get(FELLOWSHIP).set(requestingUser);
                        requestingUser.get(FELLOWSHIP_MEMBER_OF).set(targetUser);
                    }
                });
        } catch (e) {
            return e
        }
        if (isAccept) {
            return "You have accepted %s into your fellowship."
        } else {
            return "You have rejected %s from your fellowship"
        }
    }

    answerInvite(invitingId, targetId, isAccept) {
        try {
            let invitingUser = this.getDBUser(invitingId);
            let targetUser = this.getDBUser(targetId);
            targetUser.get(INVITE_LIST).get(invitingId)
                .not(() => {throw new Error("Invite does not exist.")})
                .once(function(){
                    targetUser.get(INVITE_LIST).unset(invitingUser);
                    if (isAccept) {
                        invitingUser.get(FELLOWSHIP).set(targetUser);
                        targetUser.get(FELLOWSHIP_MEMBER_OF).set(invitingUser)
                    }
                });
        } catch (e) {
            return e
        }
        if (isAccept) {
            return "You have accepted %s's invitation."
        } else {
            return "You have rejected %s's invitation."
        }
    }

    kickFromFellowship(kickedId, targetId) {
        try {
            let kickedUser = this.getDBUser(kickedId);
            let targetUser = this.getDBUser(targetId);
            targetUser.get(FELLOWSHIP).get(kickedId)
                .not(() => { throw new Error("User %s is not in your fellowship.")})
                .once(function () {
                    targetUser.get(FELLOWSHIP).unset(kickedUser);
                    kickedUser.get(FELLOWSHIP_MEMBER_OF).unset(targetUser);
                });
        } catch (e) {
            return e
        }
        return "You have kicked %s from your fellowship."
    }

    leaveFellowship(leavingId, targetId) {
        try{
            let leavingUser = this.getDBUser(leavingId);
            let targetUser = this.getDBUser(targetId);
            targetUser.get(FELLOWSHIP).get(leavingId)
                .not(() => {throw new Error("You are not in %s's fellowship")})
                .once(function () {
                    targetUser.get(FELLOWSHIP).unset(leavingUser);
                    leavingUser.get(FELLOWSHIP_MEMBER_OF).unset(targetUser);
                });
        } catch (e) {
            return e
        }
        return "You have left %s's fellowship."
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

    listAllUsers() {
        let users = [];
        this.db.get(USERS).map().once(v => users.push(v));
        return users;
    }

    listRequests(id) {
        let users = [];
        this.db.get(id).get(REQUEST_LIST).map().once(v => users.push(v));
        return users;
    }

    listInvites(id) {
        let users = [];
        this.db.get(id).get(INVITE_LIST).map().once(v => users.push(v));
        return users;
    }

    listFellowship(id) {
        let users = [];
        this.db.get(id).get(FELLOWSHIP).map().once(v => users.push(v));
        return users;
    }


}

module.exports = { database }