// Copyright (c) Meta Platforms, Inc. and affiliates.
//
// This source code is licensed under the MIT license found in the
// LICENSE file in the root directory of this source tree.

import type Ably from 'ably';

// Webhook events are published to a private channel per user. The Ably client id
// issued by /api/ably-auth identifies the user, and its token can only subscribe
// to that user's channel.
export function userChannelName(clientId: string): string {
  return `user:${clientId}`;
}

// Subscribes to the signed-in user's channel once the client id is known.
// Returns a function that removes the subscription.
export function subscribeUserChannel(
  ablyClient: Ably.Realtime,
  name: string,
  listener: (message: Ably.InboundMessage) => void,
): () => void {
  let channel: Ably.RealtimeChannel | undefined;
  let cancelled = false;
  ablyClient.connection.once('connected', () => {
    const clientId = ablyClient.auth.clientId;
    if (cancelled || !clientId) return;
    channel = ablyClient.channels.get(userChannelName(clientId));
    channel.subscribe(name, listener);
  });
  return () => {
    cancelled = true;
    channel?.unsubscribe();
  };
}
