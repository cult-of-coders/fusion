# ddp-client -- Fusion Mode
[Source code of released version](https://github.com/meteor/meteor/tree/master/packages/ddp-client) | [Source code of development version](https://github.com/meteor/meteor/tree/devel/packages/ddp-client)

This package is an extension to DDP-Client, originally from Meteor.

How to install:
```js
cd packages;
git clone 

```

By default Meteor no longer requires an websocket connection. This means that subscriptions will not work out of the box.
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