const db = require('gun')({
    file: 'database.json'
});
const USERS = 'users';
const REQUEST_LIST = 'request_list';
const INVITE_LIST = 'invite_list';
const USER_FELLOWSHIPS = "user_fellowships"
const FELLOWSHIP = 'fellowship';

// All these functions return strings

function getUser(id) {
    let user = db.get(USERS).get(id).not(() => {
        throw new Error("Specified user %s does not exist.")
    });
}

function addUser(id, streak, isTracking) {
    db.get(USERS).get(id).not(function (id) {
        let user = db.get(id).put({
            streak: streak,
            isTracking: isTracking,
        });
        db.get(USERS).set(user);
        return "User added to database."
    });
    return "User already exists in database."
}

function deleteUser(id) {
    try {
        getUser(id).put(null);
    } catch (e) {
        return e
    }
    return "User %s was deleted."
}

function requestToJoinFellowship(requestingId, targetId) {
    try {
        let requestingUser = getUser(requestingId);
        let targetUser = getUser(targetId);
        targetUser.get(REQUEST_LIST).set(requestingUser);
    } catch (e) {
        return e
    }
    return "Request sent to user %s"
}

function inviteToJoinFellowship(invitingId, targetId) {
    try {
        let invitingUser = getUser(invitingId);
        let targetUser = getUser(targetId);
        targetUser.get(INVITE_LIST).set(invitingUser);
    } catch (e) {
        return e
    }
    return "Invite sent to user %s"
}

function answerRequest(requestingId, targetId, isAccept) {
    try {
        let requestingUser = getUser(requestingId);
        let targetUser = getUser(targetId);
        targetUser.get(REQUEST_LIST).get(requestingUser)
            .not(() => {throw new Error("Request does not exist.")})
            .once(function (targetUser, requestingUser) {
                targetUser.get(REQUEST_LIST).unset(requestingUser);
                if (isAccept) {
                    targetUser.get(FELLOWSHIP).set(requestingUser);
                    requestingUser.get(USER_FELLOWSHIPS).set(targetUser);
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

function answerInvite(invitingId, targetId, isAccept) {
    try {
        let invitingUser = getUser(invitingId);
        let targetUser = getUser(targetId);
        targetUser.get(INVITE_LIST).get(invitingUser)
            .not(() => {throw new Error("Invite does not exist.")})
            .once(function(INVITE_LIST, invitingUser){
                targetUser.get(INVITE_LIST).unset(invitingUser);
                if (isAccept) {
                    invitingUser.get(FELLOWSHIP).set(targetUser);
                    targetUser.get(USER_FELLOWSHIPS).set(invitingUser)
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

function kickFromFellowship(kickedId, targetId) {
    try {
        let kickedUser = getUser(kickedId);
        let targetUser = getUser(targetId);
        targetUser.get(FELLOWSHIP).get(kickedUser)
            .not(() => { throw new Error("User %s is not in your fellowship.")})
            .once(function (FELLOWSHIP, kickedUser, targetUser) {
                targetUser.get(FELLOWSHIP).unset(kickedUser);
                kickedUser.get(USER_FELLOWSHIPS).unset(targetUser);
            });
    } catch (e) {
        return e
    }
    return "You have kicked %s from your fellowship."
}

function leaveFellowship(leaveId, targetId) {
    try{
        let leavingUser = getUser(leaveId);
        let targetUser = getUser(targetId);
        targetUser.get(FELLOWSHIP).get(leavingUser)
            .not(() => {throw new Error("You are not in %s's fellowship")})
            .once(function (FELLOWSHIP, leavingUser) {
                targetUser.get(FELLOWSHIP).unset(leavingUser);
                leavingUser.get(USER_FELLOWSHIPS).unset(leavingUser);
        });
    } catch (e) {
        return e
    }
    return "You have left %s's fellowship."
}

function reset(id){
    try{
        getUser(id).put({
            streak: 0,
        });
    } catch(e){
        return e
    }
}

function listAllUsers() {
    let users = [];
    db.get(USERS).map().once(v => users.push(v));
    return users;
}

function listRequests(id) {
    let users = [];
    db.get(id).get(REQUEST_LIST).map().once(v => users.push(v));
    return users;
}

function listInvites(id) {
    let users = [];
    db.get(id).get(INVITE_LIST).map().once(v => users.push(v));
    return users;
}

function listFellowship(id) {
    let users = [];
    db.get(id).get(FELLOWSHIP).map().once(v => users.push(v));
    return users;
}

module.exports = { addUser, deleteUser, requestToJoinFellowship, inviteToJoinFellowship,
         answerRequest, answerInvite, kickFromFellowship, leaveFellowship,
         reset, listAllUsers, listRequests, listInvites, listFellowship }