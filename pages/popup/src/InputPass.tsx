import { useState, type SVGProps } from 'react';

type InputPassProps = {
  val: string;
  setVal: (val: string) => void;
};

export const InputPass = ({ val, setVal }: InputPassProps) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex">
      <input
        type={revealed ? 'text' : 'password'}
        value={val}
        onChange={e => setVal(e.target.value)}
        className="p-[6px] bg-slate-700 focus:rounded-none outline-none text-white placeholder:text-slate-300 flex-grow"
        placeholder="..."
      />
      <button
        onClick={() => setRevealed(!revealed)}
        className="py-1 px-[6px] bg-slate-300 hover:bg-slate-400 flex-shrink-0 items-center justify-center">
        <PreviewOpen />
      </button>
    </div>
  );
};

function PreviewOpen(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="1.2em" height="1.2em" {...props}>
      <g fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="4">
        <path d="M24 36c11.046 0 20-12 20-12s-8.954-12-20-12S4 24 4 24s8.954 12 20 12Z"></path>
        <path d="M24 29a5 5 0 1 0 0-10a5 5 0 0 0 0 10Z"></path>
      </g>
    </svg>
  );
}
