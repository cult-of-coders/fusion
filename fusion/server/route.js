import {Picker} from 'meteor/meteorhacks:picker';
import {EJSON} from 'meteor/ejson';
import {Meteor} from 'meteor/meteor';
import bodyParser from 'body-parser';

const rpcRoutes = Picker.filter(function () {
    return true;
});
rpcRoutes.middleware(bodyParser.raw({
    'type': 'application/ejson',
}));

function getUserIdByToken(token) {
    const user = Meteor.users.findOne({
        'services.resume.loginTokens.hashedToken': Accounts._hashLoginToken(token)
    }, {fields: {_id: 1}});

    return user && user._id;
}

rpcRoutes.route('/__meteor', function(params, req, res, next) {
    const body = req.body.toString();
    const data = EJSON.parse(body);

    const handler = Meteor.server.method_handlers[data.method];
    if (!handler) {
        res.statusCode = 404;
        res.end(EJSON.stringify({
            reason: 'Method not found',
        }));

        return;
    }

    try {
        let context = {
            userId: null,
            connection: {},
            unblock() {},
            setUserId(userId) { this.userId = userId }
        };
        if (req.headers['meteor-authorization']) {
            context.userId = getUserIdByToken(req.headers['meteor-authorization'])
        }

        const result = handler.apply(context, data.args);

        res.end(
            EJSON.stringify({
                result
            })
        )
    } catch (e) {
        console.error(e);

        res.statusCode = 500;
        res.end(EJSON.stringify({
            reason: e.reason || e.toString(),
        }));

        return;
    }
});