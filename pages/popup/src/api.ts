import type { CloudflareEmailRoutingSettings, CloudflareResonse, RuleName, UnusedRule, UsedRule } from './types';
import type Cloudflare from 'cloudflare';
import { type EmailRoutingRule } from 'cloudflare/resources/email-routing.mjs';
import { APP_RULE_PREFIX, EMPTY_LABEL, getRandomEmail, SEPARATOR, sleep } from './utils';

export const getEmailRoutingSettings = async (
  zoneId: string,
  apiKey: string,
): Promise<CloudflareResonse<CloudflareEmailRoutingSettings>> => {
  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/email/routing`;
  const res = await fetch(url, {
    headers: new Headers({
      Authorization: `Bearer ${apiKey}`,
    }),
  });

  const responseData = await res.json();
  return responseData as CloudflareResonse<CloudflareEmailRoutingSettings>;
};

export const getAllRules = async (cf: Cloudflare, zoneId: string): Promise<EmailRoutingRule[]> => {
  const existingRules: EmailRoutingRule[] = [];
  let page = 1;

  while (true) {
    const routingRules = await cf.emailRouting.rules.list({
      zone_id: zoneId,
      per_page: 50,
      page,
    });

    page += 1;

    existingRules.push(...routingRules.result);

    // @ts-expect-error "Missing prop"
    if (!routingRules.result_info.total_count || existingRules.length >= routingRules.result_info.total_count) {
      break;
    }
  }

  return existingRules;
};

export const getUsedAppRules = async (cf: Cloudflare, zoneId: string): Promise<UsedRule[]> => {
  const allRules = await getAllRules(cf, zoneId);
  const appRules = allRules.filter(r => r.name?.startsWith(APP_RULE_PREFIX) && parseName(r.name).name);
  const result: UsedRule[] = appRules.map(r => ({
    id: r.id!,
    name: parseName(r.name!),
    email: r.matchers![0].value,
    forwardsToEmail: r.actions![0].value[0],
  }));

  return result;
};

export const getUnusedAppRules = async (cf: Cloudflare, zoneId: string): Promise<UnusedRule[]> => {
  const allRules = await getAllRules(cf, zoneId);
  const appRules = allRules.filter(r => r.name?.startsWith(APP_RULE_PREFIX) && !parseName(r.name).name);
  const result: UnusedRule[] = appRules.map(r => ({
    id: r.id!,
    name: parseName(r.name!),
    email: r.matchers![0].value,
    forwardsoEmail: r.actions![0].value[0],
  }));

  result.sort((a, b) => a.name.createdAt.getTime() - b.name.createdAt.getTime());

  return result;
};

const parseName = (fullName: string): RuleName => {
  const parts = fullName.split(SEPARATOR);
  const createdAt = new Date(parseInt(parts[1], 10));
  const name = parts[2] !== EMPTY_LABEL ? parts[2] : undefined;
  const desc = parts[3] !== EMPTY_LABEL ? parts[3] : undefined;

  return {
    createdAt,
    name,
    desc,
  };
};

export const createForwardingRule = async (cf: Cloudflare, zoneId: string, destAddr: string, domain: string) => {
  await cf.emailRouting.rules.create({
    zone_id: zoneId,
    name: `${APP_RULE_PREFIX}${SEPARATOR}${new Date().getTime()}${SEPARATOR}${EMPTY_LABEL}${SEPARATOR}${EMPTY_LABEL}`,
    matchers: [
      {
        type: 'literal',
        field: 'to',
        value: getRandomEmail(domain),
      },
    ],
    actions: [
      {
        type: 'forward',
        value: [destAddr],
      },
    ],
  });
};

export const updateForwardingRule = async (cf: Cloudflare, zoneId: string, rule: UnusedRule, destAddr: string) => {
  await cf.emailRouting.rules.update(rule.id, {
    zone_id: zoneId,
    name: `${APP_RULE_PREFIX}${SEPARATOR}${new Date().getTime()}${SEPARATOR}${rule.name.name}${SEPARATOR}${rule.name.desc || EMPTY_LABEL}`,
    matchers: [
      {
        type: 'literal',
        field: 'to',
        value: rule.email,
      },
    ],
    actions: [
      {
        type: 'forward',
        value: [destAddr],
      },
    ],
  });
};

export async function waitForSettingsToSync({
  zoneId,
  apiKey,
  intervalMs = 1_000,
  timeoutMs = 18000_0,
}: {
  intervalMs?: number;
  timeoutMs?: number;
  zoneId: string;
  apiKey: string;
}): Promise<void> {
  const start = Date.now();

  while (true) {
    const settingsResponse = await getEmailRoutingSettings(zoneId, apiKey);
    if (settingsResponse.result?.synced) {
      return;
    }

    if (Date.now() - start > timeoutMs) {
      throw new Error('Timeout waiting for condition');
    }

    await sleep(intervalMs);
  }
}
