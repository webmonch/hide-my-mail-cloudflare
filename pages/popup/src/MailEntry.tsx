import { useState, type SVGProps } from 'react';
import { type MailRule } from './types';

type MailEntryProps = {
  rule: MailRule;
  onEditRule: (rule: MailRule) => void;
};

export const MailEntry = ({ rule, onEditRule }: MailEntryProps) => {
  const [showCopyLabel, setShowCopyLabel] = useState(false);

  const onCopyAddress = () => {
    navigator.clipboard.writeText(rule.email);
    setShowCopyLabel(true);
    setTimeout(() => setShowCopyLabel(false), 2000);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onCopyAddress}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCopyAddress();
        }
      }}
      className="bg-slate-100 cursor-pointer group hover:bg-slate-200  text-[12px] flex">
      <div className="font-semibold py-1 px-2 flex-grow">{rule.name.name!}</div>
      {showCopyLabel && <div className="flex items-center mr-1">Copied!</div>}
      <button
        onClick={() => onEditRule(rule)}
        className="py-1 px-[6px] bg-slate-300 hover:bg-slate-400 flex-shrink-0  hidden  group-hover:flex items-center justify-center">
        <Edit />
      </button>
    </div>
  );
};

export function Edit(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" {...props}>
      <path d="M163 439.573l-90.569-90.569L322.78 98.656l90.57 90.569z" fill="currentColor"></path>
      <path
        d="M471.723 88.393l-48.115-48.114c-11.723-11.724-31.558-10.896-44.304 1.85l-45.202 45.203 90.569 90.568 45.202-45.202c12.743-12.746 13.572-32.582 1.85-44.305z"
        fill="currentColor"></path>
      <path d="M64.021 363.252L32 480l116.737-32.021z" fill="currentColor"></path>
    </svg>
  );
}
