// Copyright (c) Meta Platforms, Inc. and affiliates.
//
// This source code is licensed under the MIT license found in the
// LICENSE file in the root directory of this source tree.

import crypto from 'crypto';
import { sql } from '@vercel/postgres';

import { userChannelName } from '@/app/ablyChannel';

// Opaque, stable Ably client id for a user, so emails never appear in channel names
export function ablyClientIdFor(userId: string): string {
  return crypto.createHash('sha256').update(userId).digest('hex').slice(0, 32);
}

// Channels of every user who connected this WABA
export async function ownerChannelsForWaba(wabaId: string): Promise<string[]> {
  const { rows }: { rows: { user_id: string }[] } =
    await sql`SELECT DISTINCT user_id FROM wabas WHERE waba_id = ${wabaId}`;
  return rows.map((row) => userChannelName(ablyClientIdFor(row.user_id)));
}
