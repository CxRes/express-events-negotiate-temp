# Express-Events-Negotiate

A Connect/Express style middleware to provide to negotiate the appropriate notifications protocol and send notifications using it.

## Installation

Install **Express-Events-Negotiate** and **Express-Accept-Events** using your favourite package manager.

```sh
npm|pnpm|yarn add express-events-negotiate express-accept-events
```

Also install your the middleware for the notifications protocols you might want to support.

## Usage

### Setup

Add the following imports to your server:

```js
import acceptEvents from "express-accept-events";
import prep from "express-prep";
import events from "express-events-negotiate";
```

### Invocation

Now you are ready to invoke the middleware in your server. In case one is using an Express server:

```js
const app = express();

app.use(acceptEvents, events, prep);
```

### Sending Notifications

The middleware populates response object with a `sendEvents` function.

You must specify supported events for each protocol as a string using the `config` property of the argument. Default configuration is used when the value is falsy (but not when the protocol is not specified).

```js
app.get("/foo", (req, res) => {
  // Get the response body first
  const body = getContent(req.url);
  // Get the content-* headers
  const headers = getMediaType(responseBody);

  const failStatus = res.sendEvents({
    body,
    headers,
    config: {
      prep: '',
    },
  });

  if (!failStatus) return;

  // If notifications are not sent, send regular response
  res.setHeaders(new Headers(headers));
  res.write(responseBody);
  res.end();
});
```

### Advanced Configuration

You can customize notifications for each protocol by specifying an object specific to that protocol on the `modifiers` property.

```js
function negotiateEvents(defaultEvents) {
  // custom negotiation logic
  // must return in the structured-headers format
}

const failStatus = res.sendEvents({
  body,
  headers,
  config: {
    prep: `accept=("message/rfc822";delta="text/plain")`,
  },
  modifiers: {
    prep: {
      negotiateEvents,
    },
  },
});
```

## Copyright and License

Copyright © 2024, [Rahul Gupta](https://cxres.pages.dev/profile#i)

The source code in this repository is released under the [Mozilla Public License v2.0](./LICENSE).
