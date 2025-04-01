import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { settingsStorage } from '@extension/storage';
import { useEffect, useState } from 'react';
import { Settings } from './Settings';
import { EmailList } from './EmailList';
import { CreateEmail } from './CreateEmail';
import { type MailRule } from './types';

export type Screen = 'main' | 'settings' | 'create_email';

const Popup = () => {
  const settings = useStorage(settingsStorage);
  const [screen, setScreen] = useState<Screen>('main');
  const [selectedRule, setSelectedRule] = useState<MailRule>();

  useEffect(() => {
    if (screen !== 'create_email') {
      setSelectedRule(undefined);
    }
  }, [screen]);

  const inited = settings.inited;

  return (
    <div className={`App bg-white`}>
      {(!inited || screen === 'settings') && <Settings setScreen={setScreen} />}
      {inited && screen === 'main' && <EmailList setScreen={setScreen} setSelectedRule={setSelectedRule} />}
      {inited && screen === 'create_email' && (
        <CreateEmail setScreen={setScreen} selectedRule={selectedRule} setSelectedRule={setSelectedRule} />
      )}
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
