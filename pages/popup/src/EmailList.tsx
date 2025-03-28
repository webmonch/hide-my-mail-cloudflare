import { useEffect, useState } from 'react';
import type { Screen } from './Popup';
import { useStorage } from '@extension/shared';
import { settingsStorage } from '@extension/storage';
import { type UsedRule } from './types';
import { getCloudflare } from './utils';
import { getUsedAppRules } from './api';

type EmailListProps = {
  setScreen: (screen: Screen) => void;
};

export const EmailList = (props: EmailListProps) => {
  const settings = useStorage(settingsStorage);
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState<UsedRule[]>();

  useEffect(() => {
    if (settings.inited && settings.cloudflareApiKey && settings.zoneId) {
      const cf = getCloudflare(settings.cloudflareApiKey);
      setLoading(true);
      getUsedAppRules(cf, settings.zoneId)
        .then(res => {
          setRules(res);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [settings]);

  const onOpenSettings = () => {
    props.setScreen('settings');
  };
  const onOpenAddNew = () => {
    props.setScreen('create_email');
  };

  return (
    <>
      <header className={`App-header text-gray-900 justify-between`}>
        <button onClick={onOpenSettings}>
          <img src={chrome.runtime.getURL('popup/settings.svg')} className="w-[20px] h-[20px]" alt="settings button" />
        </button>

        <div className="font-bold text-[16px] py-1">Mail boxes</div>

        <button onClick={onOpenAddNew}>
          <img src={chrome.runtime.getURL('popup/plus.svg')} className="w-[20px] h-[20px]" alt="settings button" />
        </button>
      </header>

      <main className="flex flex-col flex-grow items-center justify-center text-black">
        {loading && (
          <img src={chrome.runtime.getURL('popup/spinner.svg')} className="w-[16px] h-[16px]" alt="spinner" />
        )}
        {rules && rules.length === 0 && <div>No rules</div>}

        {rules && rules.length > 0 && (
          <div className="w-full h-full overflow-y-auto py-2">
            <div className="flex flex-col gap-1">
              {rules.map(rule => (
                <div className="bg-slate-100 cursor-pointer hover:bg-slate-200 py-1 px-2 text-[14px] rounded-sm">
                  <div className="font-semibold">{rule.name.name!}</div>
                  <div className="text-[12px]">{rule.email}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
};
