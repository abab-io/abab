/**
 * Created by bogdanmedvedev on 09.01.17.
 */
"use strict";
var fs = require('fs'),
    xml2js = require('xml2js');

var parser = new xml2js.Parser();
var xml_string = fs.readFileSync("./web/config.xml");

var nw_update_conf = {
    "name": "Abab io",
    "version": "0.0.2",
    "author": "Abab io LLC <development@Abab.io>",
    "manifestUrl": "https://Abab.io/Abab.io/web/appUpdate.json",
    "packages": {
        "mac": {
            "url": "https://Abab.io/Abab.io/web/macos.zip"
        },
        "win": {
            "url": "https://Abab.io/Abab.io/web/updapp.zip"
        }
    }
};
parser.parseString(xml_string, function (err, result) {
    fs.writeFile("./web/config-xml-backup/config-version-" + result.widget['$'].version + ".xml", xml_string);
    var ver = result.widget['$'].version.split('.');
    if (+ver[2] < 99) {
        ver[2] = +ver[2];
        ver[2]++;
        if(ver[2] <10) ver[2] = '0'+''+ver[2]
    } else {
        if (+ver[1] < 99) {
            ver[1] = +ver[1];
            ver[1]++;
            if(ver[1] <10) ver[1] = '0'+''+ver[1]

        } else {
            ver[0]++;
            ver[1] = '0';
        }
        ver[2] = '0';
    }


    result.widget['$'].version = ver.join('.');
    nw_update_conf.version =result.widget['$'].version;
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(result);

    fs.writeFile("./config.xml", xml);
    fs.writeFile("./web/appUpdate.json", JSON.stringify(nw_update_conf));
    fs.writeFile("./web/version.js", 'var _version_app = "'+result.widget['$'].version+'";');
});