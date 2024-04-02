/*!
 *  Copyright (c) 2024, Rahul Gupta
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 *  SPDX-License-Identifier: MPL-2.0
 */
import { serializeDictionary } from "structured-headers";

import Debug from "debug";
const debug = Debug("events");

/**
 *  A middleware function that parses the `Accept-Events` header. It adds an
 *  `acceptEvent` property to the request object.
 */
function eventsNegotiationMiddleware(req, res, next) {
  function send({
    body, // can also be a stream
    headers,
    modifiers,
    config: configs,
  }) {
    let failStatus;
    for (const [protocol, config] of Object.entries(configs)) {
      const status = res.events?.[protocol].configure({ config });

      if (status) {
        debug(
          `Failed to configure notifications for Protocol "${protocol}" on path "${req.path}"`,
        );
        // Record the first failure only
        failStatus ??= status;
      }
    }

    if (!Object.values(res.events).some((v) => v.config)) {
      debug(`Failed configuration for any notification protocol`);
      return failStatus;
    }

    failStatus = undefined;

    for (const [protocol, params] of req.acceptEvents || []) {
      // Only run for configured protocols where middlewares are available
      if (res.events?.[protocol]?.config) {
        const eventsStatus = res.events[protocol].send({
          body,
          headers,
          params,
          modifiers: modifiers?.[protocol],
        });

        // if notifications are sent, you can quit
        if (!eventsStatus) {
          debug(
            `Successfully sent events for Protocol "${protocol}" on path "${req.path}"`,
          );
          return;
        }

        debug(
          `Failed to initiate notifications for Protocol "${protocol}" on path "${req.path}"`,
        );

        // Record the first failure only
        if (!failStatus) {
          failStatus = eventsStatus;
        }
      }
    }

    if (failStatus) {
      res.setHeader("Events", serializeDictionary(failStatus));
    }
    return failStatus || true;
  }

  res.sendEvents = send;

  return next && next();
}

export default eventsNegotiationMiddleware;