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

    getUser(id) {
        if(this.db.get(USERS).is(id)){
            return this.db.get(USERS).get(id).promise();
        }
    }

    addUser(id, streak, isTracking, successHandler, failureHandler) {
        let db = this.db;
        db.get(USERS).get(id).promise((resolved) => {
            if(resolved.put === undefined){
                let user = db.get(id).put({
                    streak: streak,
                    streak_max: streak,
                    isTracking: isTracking,
                    fellowship: {},
                    fellowship_member_of: {},
                    request_list: {},
                    invite_list: {},
                });
                db.get(USERS).set(user);
            } else {
                throw "User already exists in database."
            }
            return streak

        }).then(successHandler, failureHandler);
    }

    requestToJoinFellowship(requestingId, targetId) {
        try {
            let requestingUser = this.getUser(requestingId);
            let targetUser = this.getUser(targetId);
            targetUser.get(REQUEST_LIST).set(requestingUser);
        } catch (e) {
            throw e
        }
        return "Request sent to join %s's fellowship."
    }

    inviteToJoinFellowship(invitingId, targetId) {
        try {
            let invitingUser = this.getUser(invitingId);
            let targetUser = this.getUser(targetId);
            targetUser.get(INVITE_LIST).set(invitingUser);
        } catch (e) {
            return e
        }
        return "Invite sent to user %s"
    }

    answerRequest(requestingId, targetId, isAccept) {
        try {
            let requestingUser = this.getUser(requestingId);
            let targetUser = this.getUser(targetId);
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
            let invitingUser = this.getUser(invitingId);
            let targetUser = this.getUser(targetId);
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
            let kickedUser = this.getUser(kickedId);
            let targetUser = this.getUser(targetId);
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
            let leavingUser = this.getUser(leavingId);
            let targetUser = this.getUser(targetId);
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
            this.getUser(id).put({
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