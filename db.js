const db = require('gun')();
const USERS = 'users';
const REQUEST_LIST = 'request_list';
const INVITE_LIST = 'invite_list';
const FELLOWSHIP = 'fellowship';

function addUser(id, streak) {
    let user = db.get(id).put({
        streak: streak,
    });
    db.get(USERS).set(user);
}

function deleteUser(id){
    db.get(USERS).get(id).put({null});
}

function requestToJoinFellowship(requestingId, targetId) {
    let requestingUser = db.get(USERS).get(requestingId);
    let targetUser = db.get(USERS).get(targetId);
    targetUser.get(REQUEST_LIST).set(requestingUser);
}

function inviteToJoinFellowship(invitingId, targetId){
    let invitingUser = db.get(USERS).get(invitingId);
    let targetUser = db.get(USERS).get(targetId);
    targetUser.get(INVITE_LIST).set(invitingUser);
}

function answerRequest(requestingId, targetId, isAccept){
    let requestingUser = db.get(USERS).get(requestingId);
    let targetUser = db.get(USERS).get(targetId);
    targetUser.get(REQUEST_LIST).unset(requestingUser);
    if(isAccept){
        targetUser.get(FELLOWSHIP).set(requestingUser);
    }
}

function answerInvite(invitingId, targetId, isAccept){
    let invitingUser = db.get(USERS).get(invitingId);
    let targetUser = db.get(USERS).get(targetId);
    targetUser.get(INVITE_LIST).unset(invitingUser);
    if(isAccept){
        invitingId.get(FELLOWSHIP).set(targetUser);
    }
}

function listUsers(){
    let users = [];
    db.get(USERS).map().once(v => users.push(v));
    return users;
}

function listRequests(){
    let users = [];
    db.get(REQUEST_LIST).map().once(v => users.push(v));
    return users;
}

function listInvites(){
    let users = [];
    db.get(INVITE_LIST).map().once(v => users.push(v));
    return users;
}

function listFellowship(){
    let users = [];
    db.get(FELLOWSHIP).map().once(v => users.push(v));
    return users;
}