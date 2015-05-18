var fs = require('fs');
var htmlmin = require('htmlmin');
var slice = Array.prototype.slice;
var core = {
    html2js : function (htmlStr, config) {
        config = config || {};
        htmlStr = htmlmin(htmlStr).trim()
           .replace(/[\r\n\t]/g, ' ')
           .replace(/\s+/g, ' ')
           .replace(/\\/g, '\\\\')
           .replace(/'/g, '\\x27')
           .replace(/"/g, '\\x22')
           .replace(/\//g, '\\/')
           .replace(/\n/g, '\\n')
           .replace(/\r/g, '\\r')
           .replace(/\t/g, '\\t');

        if(config.useWrite) {
            htmlStr =
                '(function(str){' +
                    'setTimeout(function(){' +
                        'document.documentElement ? document.documentElement.innerHTML = str : document.write(str);' +
                    '});' +
                '})("' +htmlStr+ '")';
        }
        return htmlStr;
    },
    log: function(/*level, msg1, msg2...*/) {
        var args = slice.call(arguments);
        var level = args.shift();
        var msg = args.join(' ');

        if (level == 'ok') {
            console.log('\x1b[32m%s\x1b[0m', '[V] '+ msg);
        } else if (level == 'err') {
            console.log('\x1b[31m%s\x1b[0m', '[X] '+ msg);
        } else {
            console.log('[i] '+ msg);
        }
    },

    urlTrim: function  (url, keys/*[callback, _t]*/) {
        keys = keys || [];
        keys.forEach(function(key){
            url = url.replace(new RegExp('[?&]' +key+ '=.[^&]*', 'g'), '');
        });
        if(url.indexOf('?') < 0) {
            url = url.replace('&', '?')
        }
        return url;
    },
    ip2long: function (ipv4) {
        if(!/^(\d{1,3}\.){3}\d{1,3}$/.test(ipv4)) {
            return -1;
        }
        var arr = ipv4.split('.');
        return arr[0] * 256 * 256 * 256 + arr[1] * 256 * 256 + arr[2] * 256  + arr[3] * 1;
    }
}

module.exports = core;