'use strict';

require('./each-extend');
require('./lib/each-overrider')();

const ar = [];
for (let i = 0; i < 100; i++) {
    ar.push(Math.floor(Math.random() * 100));
}

(async() => {
    await ar.sort((prev, cur, cb) => {
        setTimeout(() => {
            cb(null, cur - prev);
        }, 0);
    }, true);
    console.log(ar);
    console.log(
        await ar.every((cur, i, ar, cb) => {
            setTimeout(() => {
                cb(null, cur);
            }, 1);
        }, true)
    );
    console.log(
        await ar.map((cur, i, ar, cb) => {
            setTimeout(() => {
                cb(null, cur + 1);
            }, 1);
        }, true)
    );
    console.log(
        await ar.filter((cur, i, ar, cb) => {
            setTimeout(() => {
                cb(null, cur < 50);
            }, 1);
        }, true)
    );
    console.log(
        await ar.reduce((prev, cur, i, ar, cb) => {
            setTimeout(() => {
                cb(null, prev + cur);
            }, 1);
        }, true)
    );
})()

console.log('print begin.');