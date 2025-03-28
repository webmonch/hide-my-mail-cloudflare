import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { settingsStorage } from '@extension/storage';
import { useState } from 'react';
import { Settings } from './Settings';
import { EmailList } from './EmailList';
import { CreateEmail } from './CreateEmail';

export type Screen = 'main' | 'settings' | 'create_email';

const Popup = () => {
  const settings = useStorage(settingsStorage);
  const [screen, setScreen] = useState<Screen>('main');

  const inited = settings.inited;

  return (
    <div className={`App bg-white`}>
      {(!inited || screen === 'settings') && <Settings setScreen={setScreen} />}
      {inited && screen === 'main' && <EmailList setScreen={setScreen} />}
      {inited && screen === 'create_email' && <CreateEmail setScreen={setScreen} />}
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
