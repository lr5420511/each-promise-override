'use strict';

const assert = require('assert');

const Overrider = module.exports = function() {
    Object.keys(Overrider.presets).forEach(key => {
        assert(Array.prototype[key] instanceof Function,
            key + ' is not function in prototype of Array.'
        );
        Array.prototype[key] = (naive => {
            return function(callback, isAsync = false) {
                assert(callback instanceof Function,
                    'callback is not function.'
                );
                if (typeof isAsync !== 'boolean') {
                    isAsync = false;
                }
                if (isAsync) {
                    return new Promise((res, rej) => {
                        Overrider.presets[naive.name](
                            this, callback,
                            function(err) {
                                if (err) return rej(err);
                                const result = [].slice.call(arguments, 1);
                                res(result.length > 1 ? result : result[0]);
                            }
                        );
                    });
                } else {
                    return naive.call(this, callback);
                }
            };
        })([][key]);
    });
};

Overrider.presets = {
    forEach: async function(ar, handler, callback) {
        for (let i = 0; i < ar.length; i++) {
            const cur = ar[i];
            try {
                await new Promise((res, rej) => {
                    handler(cur, i, ar, err => {
                        if (err) return rej(err);
                        res();
                    });
                });
            } catch (err) {
                return callback(err);
            }
        }
        callback();
    },
    map: async function(ar, handler, callback) {
        const temp = [];
        for (let i = 0; i < ar.length; i++) {
            const cur = ar[i];
            try {
                temp.push(await new Promise((res, rej) => {
                    handler(cur, i, ar, (err, mapItem) => {
                        if (err) return rej(err);
                        res(mapItem);
                    });
                }));
            } catch (err) {
                return callback(err, temp);
            }
        }
        callback(null, temp);
    },
    reduce: async function(ar, handler, callback) {
        if (ar.length <= 1) return callback(null, ar[0]);
        let result = ar[0];
        for (let i = 1; i < ar.length; i++) {
            const cur = ar[i];
            try {
                result = await new Promise((res, rej) => {
                    handler(result, cur, i, ar, (err, newResult) => {
                        if (err) return rej(err);
                        res(newResult);
                    });
                });
            } catch (err) {
                return callback(err, result);
            }
        }
        callback(null, result);
    },
    filter: async function(ar, handler, callback) {
        const temp = [];
        for (let i = 0; i < ar.length; i++) {
            const cur = ar[i];
            try {
                const vaild = await new Promise((res, rej) => {
                    handler(cur, i, ar, (err, vaild) => {
                        if (err) return rej(err);
                        res(vaild);
                    });
                });
                if (vaild) temp.push(cur);
            } catch (err) {
                return callback(err, temp);
            }
        }
        callback(null, temp);
    },
    sort: async function(ar, handler, callback) {
        if (ar.length <= 1) return callback(null, ar);
        for (let i = 0; i < ar.length - 1; i++) {
            for (let j = i + 1; j < ar.length; j++) {
                try {
                    const value = await new Promise((res, rej) => {
                        handler(ar[i], ar[j], (err, value) => {
                            if (err) return rej(err);
                            res(value);
                        });
                    });
                    if (value > 0 || value === true) {
                        const temp = ar[i];
                        ar[i] = ar[j];
                        ar[j] = temp;
                    }
                } catch (err) {
                    return callback(err, ar);
                }
            }
        }
        callback(null, ar);
    }
};