# DDP Client - Fusion Mode

This package is an extension to DDP-Client, originally from Meteor with the ability to conditionally start the ddp connection.

How to install:

```bash
# In your Meteor App
mkdir packages
cd packages
git clone https://github.com/cult-of-coders/fusion.git
```

The reason it is not on atmosphere is because we need to override the behavior of `ddp-client`.

If you add this package to Meteor, it no longer requires an websocket connection. This means that subscriptions will not work out of the box.
However you can start/stop the websocket conditionally:

```js
import {DDP} from 'meteor/ddp-client';

DDP.engage();
DDP.disengage();
```

And for your convenience we also export the Fusion class that lets components request an websocket connection,
and they can release that connection when no longer needed, and if there is no active "Requester" the websocket connection stops.

Sample:

```js
import {Fusion} from 'meteor/ddp-client';

const handler = Fusion.engage(() => {
    Meteor.subscribe('xxx');
})

// When you no longer need it:
handler.stop();
```

When all registered handlers are stopped, the websocket connection also stops.

`Meteor.call` will work as expected inside your app, because we create a server side route "/_meteor" that accepts RPC calls.

When sending HTTP RPC calls authorization is supported by default, meaning you can still use `this.userId` inside your methods.

This works with `accounts-password` but it needs further testing with other authentication methodologies.

