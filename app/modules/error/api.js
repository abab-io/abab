exports.api =function (message,type,stack,level,pos) {
    // level 1-9
    return {message:message,error_type:type,object:stack,level:level,stack:(new Error()).stack}
};