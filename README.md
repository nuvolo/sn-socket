# A WebSocket Implementation for ServiceNow :rocket:

Have you ever wondered if you can use WebSockets in ServiceNow? Or how the `recordWatcher` works in Service Portal? This library simplifies ServiceNow's api and allow developers to leverage the functionality without any need or reference to Angular.js.

## How to install :t-rex:

This library is designed to use in a ServiceNow context. As such, it is a UMD module. Importing the script will attach it to the `window` object and make it available as `window.SNSocket`. Further, you need to include the `glide-amb-client-bundle.min.js` in your context as well, which is how ServiceNow loads and initializes `amb`.

You can include the minified bundle for this library from `unpkg`, If you are using this in a UI Page, it might look something like this

```js
<script src="./scripts/glide-amb-client-bundle.min.js" type="text/javascript"></script>
<script src="https://unpkg.com/@nuvolo/sn-socket/umd/sn-socket.min.js" type="text/javascript"></script>
```

or you copy that script bundle from `unpkg` into a UI Script of your choosing. In this example, we create a UI Script called `snSocket` with our company's unique scope name-

```js
<script src="./scripts/glide-amb-client-bundle.min.js" type="text/javascript"></script>
<script src="./x_your_scope_name.snSocket.jsdbx" type="text/javascript"></script>
```

If you are looking for the ESModule, you should be able to import the apis, though you will still need to handle the `amb` client separately

```js
npm install @nuvolo/sn-socket
```

```js
// you imported amb at the top-level somewhere
import { subscribe } from '@nuvolo/sn-socket';
```

## How to use :eagle:

There is one method - `subscribe`. See the [JSDoc for a description](/src/socket.ts#L100) or [Typescript types](/src/socket.ts#L52) for more clarity.

This function takes a JS object which has the `table` name that you want to watch, a filter (`sysparm_query` string), and the callback that you want to invoke.

```js
function callback(payload) {
  console.error('Look Ma, a ServiceNow socket', payload);
}
const params = { table: 'incident', filter: 'state=2', callback: callback };
```

`subscribe` is an `async` function that returns a Promise. This promise resolves to an `unsubscribe` function to deregister your subscription.

Something like this should get you started

```js
<script>
(async function(){
    function callback(payload){ console.error("Look Ma, a ServiceNow socket", payload) }
    const unsubscribe = await window.SNSocket.subscribe({table: 'incident', filter: 'state=2', callback: callback});
})();

</script>
```

## Advisory note :skull_and_crossbones:

This library wraps the `Amb` mechanism used by ServiceNow. As such, it is both reliable and production-ready. That said, it relies on ServiceNow apis that are not documented and subjected to change. Please be advised that you are on your own, there is no one else, YMMV, etc. etc. etc.

Further, since this is ServiceNow-owned functionality, you need to keep an eye on performance degredation. Consult `stats.do` as well as the [servlet performance tips](https://docs.servicenow.com/bundle/paris-platform-administration/page/administer/platform-performance/concept/c_ServiceNowServlet.html) for your specific implementation.

And just because you can use it doesn't mean you should.

## Contributing :pencil2:

Contributions welcome! We would love your help to develop this library further. Please search open issues for the functionality that you are looking for. If you don't find a relevant issue, please open a ticket and we can discuss the request before working on the actual implementation. Thanks!
