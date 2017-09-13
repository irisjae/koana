var casual = require ('casual');
var write = require ('test/utils/write')	
var read = require ('test/utils/read')	
                
write ('user', {
    email: casual .email,
    password: casual .password
});
write ('invalid-user', {
    email: read ('user') .email,
    password: casual .password
});
write ('non-user', {
    email: casual .email,
    password: casual .password
});