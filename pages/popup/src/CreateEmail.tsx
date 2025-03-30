import { useEffect, useState } from 'react';
import type { Screen } from './Popup';
import { useStorage } from '@extension/shared';
import { settingsStorage } from '@extension/storage';
import { type MailRule } from './types';
import { createForwardingRule, deleteForwardingRule, getUnusedAppRules, updateForwardingRule } from './api';
import { getCloudflare } from './utils';

type CreateEmailProsp = {
  setScreen: (screen: Screen) => void;
  selectedRule?: MailRule;
  setSelectedRule: (rule?: MailRule) => void;
};

type ActionType = 'delete' | 'save';

export const CreateEmail = (props: CreateEmailProsp) => {
  const [label, setLabel] = useState(props.selectedRule?.name?.name || '');
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<ActionType>();
  const settings = useStorage(settingsStorage);
  const [rule, setRule] = useState<MailRule | undefined>(props.selectedRule);
  const [rules, setRules] = useState<MailRule[]>();
  const [showCopyLabel, setShowCopyLabel] = useState(false);
  const isEditMode = !!props.selectedRule;

  useEffect(() => {
    if (!props.selectedRule && settings.inited && settings.cloudflareApiKey && settings.zoneId) {
      const cf = getCloudflare(settings.cloudflareApiKey);
      setLoading(true);
      getUnusedAppRules(cf, settings.zoneId)
        .then(res => {
          setRules(res);
          setRule(res[0]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [settings, props]);

  const onBack = () => {
    if (loading) {
      return;
    }
    props.setScreen('main');
  };

  const onCreate = async () => {
    const { destinationEmail, cloudflareApiKey, zoneId } = settings;

    if (!rule || !label.trim() || !destinationEmail || !zoneId || !cloudflareApiKey) {
      return;
    }

    setApplying('save');
    const cf = getCloudflare(cloudflareApiKey);

    const updatedRule = {
      ...rule,
      name: { ...rule.name, name: label },
      forwardsToEmail: destinationEmail,
    };

    await updateForwardingRule(cf, zoneId, updatedRule);

    props.setScreen('main');
  };

  const onCopyAddress = () => {
    if (!rule) {
      return;
    }

    navigator.clipboard.writeText(rule.email);

    setShowCopyLabel(true);
    setTimeout(() => setShowCopyLabel(false), 2000);
  };

  const onDeleteRule = async () => {
    const { zoneId, destinationEmail, accountDomain, cloudflareApiKey } = settings;

    if (!rule || !zoneId || !destinationEmail || !accountDomain || !cloudflareApiKey) {
      return;
    }

    setApplying('delete');
    const cf = getCloudflare(cloudflareApiKey);

    await deleteForwardingRule(cf, zoneId, rule);
    await createForwardingRule(cf, zoneId, destinationEmail, accountDomain);

    props.setScreen('main');
  };

  const canSave = !!label.trim() && !applying && !loading;
  let buttonLabel = applying ? 'Creating...' : 'Create';

  if (isEditMode) {
    buttonLabel = applying ? 'Saving...' : 'Save';
  }

  const tabTitle = `${isEditMode ? 'Edit' : 'Create'} mailbox`;

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
        <div className="font-bold text-[16px] py-1">{tabTitle}</div>
        <div className="w-[20px]" />
      </header>

      <main className="flex flex-col flex-grow h-full gap-[6px] items-center justify-center text-black">
        {loading && (
          <img src={chrome.runtime.getURL('popup/spinner.svg')} className="w-[16px] h-[16px]" alt="spinner" />
        )}
        {rules && !rules.length && (
          <div className="text-center">No empty rules left. Delete some before you can continue.</div>
        )}

        {rule && (
          <div className="w-full flex flex-col gap-2">
            <div className="relative flex flex-col gap-1">
              <div>Address {rules && `(${rules.length} available)`}</div>
              <div className="bg-slate-200 text-[13px] flex flex-row">
                <div className="flex-grow py-1 px-2 ">{rule.email}</div>
                <button onClick={onCopyAddress} className="py-1 px-2 bg-slate-300 hover:bg-slate-400">
                  <img src={chrome.runtime.getURL('popup/copy.svg')} className="w-[16px] h-[16px]" alt="copy button" />
                </button>
              </div>

              {showCopyLabel && <div className="text-center absolute bottom-[-18px] left-0 right-0">Copied!</div>}
            </div>

            <div className="relative flex flex-col gap-1">
              <div>Label</div>
              <input
                value={label}
                onChange={e => setLabel(e.target.value)}
                type="text"
                className="p-[6px] bg-slate-700 w-full focus:rounded-none outline-none text-white placeholder:text-slate-300"
                placeholder="Label your email"
              />
            </div>
          </div>
        )}
      </main>

      <footer className="flex flex-col gap-1 text-white">
        {isEditMode && (
          <button
            onClick={onDeleteRule}
            disabled={!canSave}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-400 disabled:cursor-not-allowed py-[6px]  text-center text-[14px] font-bold flex flex-row gap-1 items-center justify-center">
            {applying === 'delete' && (
              <img src={chrome.runtime.getURL('popup/spinner.svg')} className="w-[16px] h-[16px]" alt="spinner" />
            )}
            Delete
          </button>
        )}
        <button
          onClick={onCreate}
          disabled={!canSave}
          className="w-full bg-black hover:bg-slate-800 disabled:bg-gray-600 disabled:cursor-not-allowed py-[6px] text-center text-[14px] font-bold flex flex-row gap-1 items-center justify-center">
          {applying === 'save' && (
            <img src={chrome.runtime.getURL('popup/spinner.svg')} className="w-[16px] h-[16px]" alt="spinner" />
          )}
          {buttonLabel}
        </button>
      </footer>
    </>
  );
};
