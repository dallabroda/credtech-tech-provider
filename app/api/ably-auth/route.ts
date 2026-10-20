// Copyright (c) Meta Platforms, Inc. and affiliates.
//
// This source code is licensed under the MIT license found in the
// LICENSE file in the root directory of this source tree.

import { NextResponse } from 'next/server';

import Ably from 'ably';

import { userChannelName } from '@/app/ablyChannel';
import { ablyClientIdFor } from '@/app/api/ablyUtils';
import { withAuth } from '@/app/api/authWrapper';
import getPrivateConfig from '@/app/privateConfig';

export const dynamic = 'force-dynamic';

async function createTokenRequest(clientId: string) {
  const { ablyKey } = await getPrivateConfig();
  const ably = new Ably.Realtime(ablyKey);
  const r = await ably.auth.createTokenRequest(
    {
      ttl: 3600000,
      clientId: clientId,
      // Only the user's own channel, subscribe-only
      capability: { [userChannelName(clientId)]: ['subscribe'] },
    },
    {
      key: ablyKey,
    },
  );
  ably.close();
  return r;
}

export const GET = withAuth(async function createAblyToken(_, session) {
  try {
    const clientId = ablyClientIdFor(session.user.email);
    const tokenRequest = await createTokenRequest(clientId);
    return NextResponse.json(tokenRequest);
  } catch (error) {
    console.error('Failed to create Ably token:', error);
    return NextResponse.json({ error: 'Failed to create Ably token' }, { status: 500 });
  }
});
