exports.api =function (message,type,stack,level) {
    // level 1-9
    return {message:message,error_type:type,object:stack,level:level}
};