import { DDP, LivedataTest } from '../../common/namespace';
import { call, apply } from './rpc';

let _methods = [];

export function engage() {
    if (Meteor.connection._isDummy) {
        createActualConnection();
    }
}

export function disengage() {
    if (!Meteor.connection || !Meteor.connection._isDummy) {
        createDummyConnection();
    }
}

function createActualConnection() {
    let ddpUrl = '/';
    if (typeof __meteor_runtime_config__ !== 'undefined') {
        if (__meteor_runtime_config__.DDP_DEFAULT_CONNECTION_URL)
            ddpUrl = __meteor_runtime_config__.DDP_DEFAULT_CONNECTION_URL;
    }

    let retry = new Retry();

    let onDDPVersionNegotiationFailure = function(description) {
        Meteor._debug(description);
        if (Package.reload) {
            let migrationData =
                Package.reload.Reload._migrationData('livedata') || {};
            let failures = migrationData.DDPVersionNegotiationFailures || 0;
            ++failures;
            Package.reload.Reload._onMigrate('livedata', function() {
                return [true, { DDPVersionNegotiationFailures: failures }];
            });
            retry.retryLater(failures, function() {
                Package.reload.Reload._reload();
            });
        }
    };

    Meteor.connection = DDP.connect(ddpUrl, {
        onDDPVersionNegotiationFailure: onDDPVersionNegotiationFailure
    });

    _mirrorMeteorObject();

    _methods.forEach(config => {
        Meteor.methods(config);
    })
}

export function createDummyConnection() {
    if (Meteor.connection) {
        Meteor.connection.disconnect();
    }

    Meteor.connection = {
        _isDummy: true,
        _userId: null,
        subscribe() {
            Meteor.isDevelopment && console.warn('You cannot subscribe, the connection is not engaged.');
        },
        methods(config) {
            _methods.push(config);
            Meteor.isDevelopment && console.warn('Does not work with .methods() client-side');
        },
        status() {
            return 'offline';
        },
        reconnect() {},
        disconnect() {},
        call,
        apply,
        setUserId(userId) {
            this._userId = userId;
        },
        userId() {
            return this._userId;
        }
    };

    _mirrorMeteorObject();
}

function _mirrorMeteorObject() {
    [
        'subscribe',
        'methods',
        'call',
        'apply',
        'status',
        'reconnect',
        'disconnect'
    ].forEach(name => {
        Meteor[name] = Meteor.connection[name].bind(Meteor.connection);
    });
}
