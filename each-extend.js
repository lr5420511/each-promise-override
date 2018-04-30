'use strict';

const { presets } = require('./lib/each-overrider');

presets.every = async function(ar, handler, callback) {
    let finish = true;
    for (let i = 0; i < ar.length; i++) {
        if (!finish) break;
        const cur = ar[i];
        try {
            const cont = await new Promise((res, rej) => {
                handler(cur, i, ar, (err, cont) => {
                    if (err) return rej(err);
                    res(cont);
                });
            });
            cont || (finish = false);
        } catch (err) {
            return callback(err, false);
        }
    }
    callback(null, finish);
}