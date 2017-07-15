/**
 * Created by bogdanmedvedev on 13.07.17.
 */
const os = require('os');
console.log('\n*******************************************************');
console.info('Abab.io Server started.\n\t'+os.cpus()[0].model+' x'+os.cpus().length+'\n\tProcess pid:'+process.pid+'\n\tPlatform OS:'+process.platform+'\n\tNodeJS version: '+process.version+'');
console.log('*******************************************************\n\n');
