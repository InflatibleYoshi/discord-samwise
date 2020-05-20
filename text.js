export const    BOT_DESCRIPTION = "A discord bot that brings community within arm's reach when dealing with destructive habits, or just for giving life updates.";
export const    BOT_OWNER = "InflatibleYoshi";

export const    COMMAND_SELECT_NO_USERS_ERROR = "You did not match any registered users with your command.";

export const    REGISTER_COMMAND = "register";
export const    REGISTER_COMMAND_RESPONSE = "If you would like to track the days you've spent dedicated towards a single goal such as being free from addiction or exercising daily, " +
    "\ntype '!register date \"timestamp\" filling" +
    "\n\"timestamp\" with the last day you partook in your habit or forgot a day in the format: " +
    "\n'DD Mon YYYY HH:mm:ss TZ' (!register date 01 Jan 1970 00:00:00 GMT).\"" +
    "Otherwise, type '!register silent' to register without tracking your day.";
export const    REGISTER_COMMAND_DESCRIPTION = "Register User";
export const    REGISTER_COMMAND_FULL_DESCRIPTION = "Register user to the database managed by the Samwise bot which contains all fellowship data.";

export const    REGISTER_SILENT_SUBCOMMAND = "silent";
export const    REGISTER_SILENT_SUBCOMMAND_DESCRIPTION = "Register User - Silent";
export const    REGISTER_SILENT_SUBCOMMAND_FULL_DESCRIPTION = "Register user to the Samwise bot without tracking.";

export const    REGISTER_DATE_SUBCOMMAND = "date";
export const    REGISTER_DATE_SUBCOMMAND_DESCRIPTION = "Register User - Date";
export const    REGISTER_DATE_SUBCOMMAND_FULL_DESCRIPTION = "If you would like to track the days you've spent dedicated towards a single goal such as being free from addiction or exercising daily, " +
    "\ntype '!register date \"timestamp\" filling" +
    "\n\"timestamp\" with the last day you partook in your habit or forgot a day in the format: " +
    "\n'DD Mon YYYY HH:mm:ss TZ' (!register date 01 Jan 1970 00:00:00 GMT).";
export const    REGISTER_DATE_SUBCOMMAND_ALREADY_REGISTERED_WARNING = "You have already registered so this command will only overwrite your settings and not your current fellowship data.";
export function REGISTER_DATE_SUBCOMMAND_RETURN_STREAK(streak) {return `This puts your current streak at ${streak} days.\n Do you want to proceed with these options?`}
export const    REGISTER_COMMAND_USER_CREATED = "Your user has been created/configured." +
    "\nInvite people to join your fellowship and/or ask people to join theirs!";
export const    REGISTER_COMMAND_USER_ABORTED = "The creation/configuration of your user was rejected.";

export const    RESET_COMMAND = "reset";

export const    REQUEST_COMMAND = "request";
export function REQUEST_COMMAND_ON_FELLOWSHIP_ADDING_RESPONSE(username) {return `You have been added to the fellowship of ${username}!`}
export function REQUEST_COMMAND_ON_FELLOWSHIP_TARGET_RESPONSE(username) {return `You have added ${username} to your fellowship!`}
export function REQUEST_COMMAND_ON_FELLOWSHIP_ADDING_REQUEST(username) {return `${username} has requested to join your fellowship!\nUse the reaction buttons to choose whether or not to accept or decline the request!`}
export function REQUEST_COMMAND_ON_FELLOWSHIP_TARGET_REQUEST(username) {return `${username} has requested to join your fellowship!\nUse the reaction buttons to choose whether or not to accept or decline the request!`}
export function REQUEST_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR(username) {return `${username} is already in your fellowship.`}
