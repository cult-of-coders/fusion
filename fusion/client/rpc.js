import {HTTP} from 'meteor/http';
import {Meteor} from 'meteor/meteor';

export function getToken() {
    return Accounts._storedLoginToken();
}

function apply(method, args, options, callback) {
    let headers = {'Content-Type': 'application/ejson'};
    try {
        headers['Meteor-Authorization'] = getToken();
    } catch (e) {
        // Accounts may not be defined at this stage
    }

    HTTP.post(Meteor.absoluteUrl('/__meteor'), {
        content: EJSON.stringify({method, args}),
        headers
    }, function (err, res) {
        if (callback) {
            if (err) {
                callback && callback(err);
            } else {
                const data = EJSON.parse(res.content);
                callback && callback(undefined, data.result);
            }
        }
    })
}

function call(method, ...args) {
    let callback;
    if (_.isFunction(_.last(args))) {
        callback = _.last(args);
        args = args.slice(0, args.length - 1);
    }

    return apply(method, args, {}, callback);
}


export { apply, call };