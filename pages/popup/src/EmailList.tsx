import { useEffect, useState } from 'react';
import type { Screen } from './Popup';
import { useStorage } from '@extension/shared';
import { settingsStorage } from '@extension/storage';
import { type MailRule } from './types';
import { getCloudflare } from './utils';
import { getUsedAppRules } from './api';
import { MailEntry } from './MailEntry';

type EmailListProps = {
  setScreen: (screen: Screen) => void;
  setSelectedRule: (rule?: MailRule) => void;
};

export const EmailList = (props: EmailListProps) => {
  const settings = useStorage(settingsStorage);
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState<MailRule[]>();

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

  const onEditRule = (rule: MailRule) => {
    props.setSelectedRule(rule);
    props.setScreen('create_email');
  };

  return (
    <>
      <header className={`App-header text-gray-900 justify-between`}>
        <button onClick={onOpenSettings}>
          <img src={chrome.runtime.getURL('popup/settings.svg')} className="w-[20px] h-[20px]" alt="settings button" />
        </button>

        <div className="font-bold text-[16px] py-1">Mailboxes</div>

        <button onClick={onOpenAddNew}>
          <img src={chrome.runtime.getURL('popup/plus.svg')} className="w-[20px] h-[20px]" alt="settings button" />
        </button>
      </header>

      {loading && (
        <div className="w-full h-full flex items-center justify-center">
          <img src={chrome.runtime.getURL('popup/spinner.svg')} className="w-[16px] h-[16px]" alt="spinner" />
        </div>
      )}

      <main className=" text-black overflow-y-auto">
        {rules && rules.length === 0 && <div>No rules</div>}

        {rules && rules.length > 0 && (
          <div className="py-2">
            <div className="flex flex-col gap-1">
              {rules.map(rule => (
                <MailEntry rule={rule} onEditRule={onEditRule} />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
};
