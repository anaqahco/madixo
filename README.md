import type { MadixoPlan } from '@/lib/madixo-plans';
import { parsePlan } from '@/lib/madixo-plans';
type SafeMetadata = Record<string, unknown>;
type UserLike = {
id?: string | null;
email?: string | null;
user_metadata?: Record<string, unknown> | null;
};
export type MadixoComplimentaryAccess = {
plan: Exclude<MadixoPlan, 'free'>;
source: 'metadata' | 'env_email' | 'env_user_id';
expiresAt: string | null;
};
function toMetadataRecord(value: unknown): SafeMetadata {
if (!value || typeof value !== 'object' || Array.isArray(value)) {
return {};
}
return value as SafeMetadata;
}
function getString(value: unknown) {
return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}
function normalizeIdentity(value: string | null | undefined) {
return typeof value === 'string' ? value.trim().toLowerCase() : '';
}
function parseCsvList(value: string | undefined) {
return new Set(
(value ?? '')
.split(',')
.map((item) => normalizeIdentity(item))
.filter(Boolean)
);
}
function isFutureIsoDate(value: string | null) {
if (!value) return true;
const timestamp = Date.parse(value);
if (!Number.isFinite(timestamp)) {
return false;
}
return timestamp > Date.now();
}
function readComplimentaryPlanFromMetadata(
metadata: SafeMetadata
): MadixoComplimentaryAccess | null {
const plan = parsePlan(getString(metadata.madixo_comp_plan));
if (plan !== 'pro' && plan !== 'team') {
return null;
}
const expiresAt = getString(metadata.madixo_comp_expires_at);
if (!isFutureIsoDate(expiresAt)) {
return null;
}
return {
plan,
source: 'metadata',
expiresAt,
};
}
function readComplimentaryPlanFromEnv(user: UserLike): MadixoComplimentaryAccess | null {
const metadata = toMetadataRecord(user.user_metadata);
const email = normalizeIdentity(user.email ?? getString(metadata.madixo_user_email_for_comp));
const userId = normalizeIdentity(user.id ?? getString(metadata.madixo_user_id_for_comp));
const teamEmails = parseCsvList(process.env.MADIXO_COMP_TEAM_EMAILS);
const teamUserIds = parseCsvList(process.env.MADIXO_COMP_TEAM_USER_IDS);
const proEmails = parseCsvList(process.env.MADIXO_COMP_PRO_EMAILS);
const proUserIds = parseCsvList(process.env.MADIXO_COMP_PRO_USER_IDS);
if (email && teamEmails.has(email)) {
return { plan: 'team', source: 'env_email', expiresAt: null };
}
if (userId && teamUserIds.has(userId)) {
return { plan: 'team', source: 'env_user_id', expiresAt: null };
}
if (email && proEmails.has(email)) {
return { plan: 'pro', source: 'env_email', expiresAt: null };
}
if (userId && proUserIds.has(userId)) {
return { plan: 'pro', source: 'env_user_id', expiresAt: null };
}
return null;
}
export function getMadixoComplimentaryAccess(user: unknown): MadixoComplimentaryAccess | null {
if (!user || typeof user !== 'object') {
return null;
}
const typedUser = user as UserLike;
const metadata = toMetadataRecord(typedUser.user_metadata);
return readComplimentaryPlanFromMetadata(metadata) ?? readComplimentaryPlanFromEnv(typedUser);
}

Complimentary paid access (manual Pro / Team access)
This project now supports giving specific accounts paid access without charging them.
Use one of these environment variables:
```bash
MADIXO_COMP_PRO_EMAILS=person1@example.com,person2@example.com
MADIXO_COMP_PRO_USER_IDS=
MADIXO_COMP_TEAM_EMAILS=
MADIXO_COMP_TEAM_USER_IDS=
```
How it works:
if a logged-in user's email or Supabase user id matches one of the lists above, Madixo treats that account as `pro` or `team`
the account keeps paid feature access without going through checkout
real Paddle billing data is not faked
Optional metadata method:
`madixo_comp_plan=pro` or `team`
`madixo_comp_expires_at=2026-12-31T23:59:59.000Z`
The complimentary access overrides the normal saved plan while it is active.
