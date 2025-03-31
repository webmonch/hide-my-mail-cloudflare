import { useStorage } from '@extension/shared';
import { settingsStorage } from '@extension/storage';
import { useState } from 'react';
import type { Screen } from './Popup';
import { createForwardingRule, getAllRules, getEmailRoutingSettings, waitForSettingsToSync } from './api';
import { getCloudflare } from './utils';
import { InputPass } from './InputPass';

type SettingsProps = {
  setScreen: (screen: Screen) => void;
};

type SetupError = 'auth_error' | 'wrong_zone_id' | 'not_enabled' | 'not_ready' | 'not_verified';

type ErrorDetail = {
  title: string;
  desc: string;
};

const ErrorDetails: Partial<Record<SetupError, ErrorDetail>> = {
  auth_error: {
    title: 'Auth failed',
    desc: 'Make sure API key is correct and has all required permissions',
  },
  wrong_zone_id: {
    title: 'Wrong Zone ID',
    desc: 'Make sure your Zone ID is correct and matches API key',
  },
  not_verified: {
    title: 'Destination email not verified',
    desc: 'You should get an email with verification link soon.',
  },
  not_enabled: {
    title: 'Email Routing not enabled',
    desc: 'Please enable Email Routing in Cloudflare settings',
  },
  not_ready: {
    title: 'Email Routing not ready',
    desc: 'Please enable Email Routing in Cloudflare settings',
  },
};

export const Settings = (props: SettingsProps) => {
  const settings = useStorage(settingsStorage);
  const [apiKey, setApiKey] = useState(settings.cloudflareApiKey ?? '');
  const [destAddr, setDestAddr] = useState(settings.destinationEmail ?? '');
  const [zone, setZone] = useState(settings.zoneId ?? '');
  const [accountId, setAaccountId] = useState(settings.accountId ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState<ErrorDetail>();
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<string>();

  const waitForSync = async () => {
    setSyncing(true);
    setStatus('Waiting for settings to sync...');
    await waitForSettingsToSync({ apiKey, zoneId: zone });
    setSyncing(false);
  };

  const onOpenMainScreen = () => props.setScreen('main');

  const runSetupFlow = async (zoneId: string, apiKey: string, accountId: string): Promise<SetupError | undefined> => {
    setStatus('Checking settings...');

    const settingsResponse = await getEmailRoutingSettings(zoneId, apiKey);

    // Check auth and zone
    if (!settingsResponse.success) {
      for (const err of settingsResponse.errors) {
        if (err.code === 10001) {
          return 'auth_error';
        }

        if (err.code === 7003) {
          return 'wrong_zone_id';
        }
      }

      throw new Error('Unexpected error');
    }

    if (!settingsResponse.result) {
      throw new Error('Unexpected error');
    }

    const routingSettings = settingsResponse.result;

    if (!routingSettings.enabled) {
      return 'not_enabled';
    }

    if (routingSettings.status !== 'ready') {
      return 'not_ready';
    }

    if (!routingSettings.synced) {
      await waitForSync();
    }

    await settingsStorage.update({
      ...settings,
      accountDomain: routingSettings.name,
    });

    // At this point email settings are enabled, synced and ready to use

    setStatus('Checking addresses...');

    const cf = getCloudflare(apiKey);

    const destAddresses = await cf.emailRouting.addresses.list({
      account_id: accountId,
      per_page: 50,
    });

    let destUserAddress = destAddresses.result.find(x => x.email === destAddr);

    if (!destUserAddress) {
      setStatus('Adding destination address...');

      destUserAddress = await cf.emailRouting.addresses.create({
        account_id: accountId,
        email: destAddr,
      });
    }

    if (!destUserAddress.verified) {
      return 'not_verified';
    }

    const existingRules = await getAllRules(cf, zoneId);
    const maxRules = 180;
    const missingAppRules = maxRules - existingRules.length;

    if (missingAppRules > 0) {
      setStatus(`Creating app rules: 0/${missingAppRules}`);

      for (let i = 0; i < missingAppRules; ++i) {
        setStatus(`Creating app rules: ${i + 1}/${missingAppRules}`);

        await createForwardingRule(cf, zoneId, destAddr, routingSettings.name);
      }
    }

    await waitForSync();
  };

  const inited = settings.inited;
  const settingsTitle = inited ? 'Settings' : 'Configure';

  const canSave = apiKey && destAddr && zone && !isLoading && !syncing && accountId;

  const onSave = async () => {
    if (!canSave) {
      return;
    }

    setErr(undefined);
    setIsLoading(true);

    // Save values to user don't have to fill each time even if they are wrong
    await settingsStorage.update({
      ...settings,
      cloudflareApiKey: apiKey,
      destinationEmail: destAddr,
      zoneId: zone,
      accountId,
    });

    const setupError = await runSetupFlow(zone, apiKey, accountId);
    setStatus(undefined);

    if (setupError) {
      setErr(ErrorDetails[setupError]);
    } else {
      await settingsStorage.update({
        ...settings,
        inited: true,
      });
      onOpenMainScreen();
    }

    setIsLoading(false);
  };

  const onCloseSettings = () => {
    onOpenMainScreen();
  };

  const saveBtnLabel = inited ? 'Save' : 'Set up';

  return (
    <>
      <header className={`App-header text-gray-900`}>
        {inited && (
          <button onClick={onCloseSettings}>
            <img
              src={chrome.runtime.getURL('popup/back-arrow.svg')}
              className="w-[20px] h-[20px]"
              alt="settings button"
            />
          </button>
        )}

        {!inited && <div className="w-[20px]" />}
        <div className="font-bold text-[16px] py-1">{settingsTitle}</div>
        <div className="w-[20px]" />
      </header>
      <main className="flex flex-col flex-grow h-full gap-[6px] mt-4">
        <div>
          Cloudflare API key with{' '}
          <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank">
            <strong>proper permissions</strong>
          </a>{' '}
        </div>

        <InputPass val={apiKey} setVal={setApiKey} />

        <div className="mt-1">Zone ID</div>
        <InputPass val={zone} setVal={setZone} />

        <div className="mt-1">Account ID</div>
        <InputPass val={accountId} setVal={setAaccountId} />

        <div className="mt-1">Destination email address</div>
        <input
          type="text"
          value={destAddr}
          onChange={e => setDestAddr(e.target.value)}
          className="p-[6px] bg-slate-700 focus:rounded-none outline-none text-white placeholder:text-slate-300"
          placeholder="@..."
        />

        {settings.accountDomain && (
          <div className="mt-1">
            Mail domain: @<strong>{settings.accountDomain}</strong>
          </div>
        )}
      </main>

      <footer className="flex flex-col gap-1">
        {status && <div className="p-1/2 bg-gray-300 text-center">{status}</div>}
        {err && (
          <div className="p-1 bg-red-400 text-white flex flex-col gap-1 my-1">
            <div className="text-[14px] font-semibold">{err.title}</div>
            <div>{err.desc}</div>
          </div>
        )}
        <button
          onClick={onSave}
          disabled={!canSave}
          className="w-full bg-black hover:bg-slate-800 disabled:bg-gray-500 disabled:cursor-not-allowed py-[6px] text-white text-center text-[14px] font-bold flex items-center justify-center gap-2">
          {(syncing || isLoading) && (
            <img src={chrome.runtime.getURL('popup/spinner.svg')} className="w-[16px] h-[16px]" alt="spinner" />
          )}
          {isLoading ? 'Applying...' : saveBtnLabel}
        </button>
      </footer>
    </>
  );
};
