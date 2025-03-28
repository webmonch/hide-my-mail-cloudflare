import { useEffect, useState } from 'react';
import type { Screen } from './Popup';
import { useStorage } from '@extension/shared';
import { settingsStorage } from '@extension/storage';
import { type UnusedRule } from './types';
import { getUnusedAppRules, updateForwardingRule } from './api';
import { getCloudflare } from './utils';

type CreateEmailProsp = {
  setScreen: (screen: Screen) => void;
};

export const CreateEmail = (props: CreateEmailProsp) => {
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const settings = useStorage(settingsStorage);
  const [rules, setRules] = useState<UnusedRule[]>();

  useEffect(() => {
    if (settings.inited && settings.cloudflareApiKey && settings.zoneId) {
      const cf = getCloudflare(settings.cloudflareApiKey);
      setLoading(true);
      getUnusedAppRules(cf, settings.zoneId)
        .then(res => {
          setRules(res);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [settings]);

  const onBack = () => {
    if (loading) {
      return;
    }
    props.setScreen('main');
  };

  const onCreate = async () => {
    if (!rules || !label.trim()) {
      return;
    }

    setApplying(true);
    const cf = getCloudflare(settings.cloudflareApiKey!);

    const rule = rules[0];
    rule.name.name = label;

    await updateForwardingRule(cf, settings.zoneId!, rule, settings.destinationEmail!);

    props.setScreen('main');

    setApplying(false);
  };

  const onCopyAddress = () => {
    navigator.clipboard.writeText(rules![0].email);
  };

  const canSave = !!label.trim() && !applying && !loading;
  const buttonLabel = applying ? 'Creating...' : 'Create';

  return (
    <>
      <header className={`App-header text-gray-900`}>
        <button onClick={onBack}>
          <img
            src={chrome.runtime.getURL('popup/back-arrow.svg')}
            className="w-[20px] h-[20px]"
            alt="settings button"
          />
        </button>
        <div className="font-bold text-[16px] py-1">Create mailbox</div>
        <div className="w-[20px]" />
      </header>

      <main className="flex flex-col flex-grow h-full gap-[6px] items-center justify-center text-black">
        {loading && (
          <img src={chrome.runtime.getURL('popup/spinner.svg')} className="w-[16px] h-[16px]" alt="spinner" />
        )}
        {rules && !rules.length && (
          <div className="text-center">No empty rules left. Delete some before you can continue.</div>
        )}

        {rules && rules.length > 0 && (
          <div className="w-full flex flex-col gap-2">
            <div>Address ({rules.length} available)</div>
            <div className="bg-slate-200 text-[13px] text-center flex flex-row">
              <div className="text-center flex-grow py-1 px-2 ">{rules[0].email}</div>
              <button onClick={onCopyAddress} className="py-1 px-2 bg-slate-300 hover:bg-slate-400">
                <img src={chrome.runtime.getURL('popup/copy.svg')} className="w-[16px] h-[16px]" alt="copy button" />
              </button>
            </div>

            <div>Label</div>
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              type="text"
              className="p-[6px] bg-slate-700 w-full focus:rounded-none outline-none text-white placeholder:text-slate-300"
              placeholder="Label your email"
            />
          </div>
        )}
      </main>

      <footer>
        <button
          onClick={onCreate}
          disabled={!canSave}
          className="w-full bg-black hover:bg-slate-800 disabled:bg-gray-600 disabled:cursor-not-allowed py-[6px] text-white text-center text-[14px] font-bold flex flex-row gap-1 items-center justify-center">
          {applying && (
            <img src={chrome.runtime.getURL('popup/spinner.svg')} className="w-[16px] h-[16px]" alt="spinner" />
          )}
          {buttonLabel}
        </button>
      </footer>
    </>
  );
};
