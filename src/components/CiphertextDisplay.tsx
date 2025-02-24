import React from 'react';

interface CiphertextDisplayProps {
  ciphertext: string;
  onChange?: (text: string) => void;
  onCopy?: () => void;
  onClear?: () => void;
  isValid?: boolean;
  isReadOnly?: boolean;
  label?: string;
}

const CiphertextDisplay: React.FC<CiphertextDisplayProps> = ({
  ciphertext,
  onChange,
  onCopy,
  onClear,
  isValid,
  isReadOnly = false,
  label = 'Ciphertext'
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-white/80">
          {label}
        </label>
        {(ciphertext && onClear) && (
          <button
            onClick={onClear}
            className="px-2 py-1 text-xs bg-white/5 text-white/60 rounded
              hover:bg-white/10 hover:text-white/80 transition-all duration-200
              flex items-center gap-1.5"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
              />
            </svg>
            <span>Clear</span>
          </button>
        )}
      </div>
      <div className="relative group">
        <textarea
          value={ciphertext}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={isReadOnly ? "No encrypted message yet..." : "Paste encrypted message here..."}
          readOnly={isReadOnly}
          className="w-full h-24 px-3 py-2 bg-white/5 text-white border border-white/10 rounded-lg
            placeholder-white/30 font-mono text-sm
            focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20
            transition-all duration-200"
        />
        {ciphertext && onCopy && (
          <button
            onClick={onCopy}
            className="absolute top-2 right-2 p-2 text-white/40 hover:text-white/80
              hover:bg-white/10 rounded-lg transition-all duration-200
              opacity-0 group-hover:opacity-100"
            title="Copy to clipboard"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
              />
            </svg>
          </button>
        )}
      </div>
      {isValid && (
        <p className="mt-2 text-xs text-green-400">
          ✓ Valid ciphertext
        </p>
      )}
    </div>
  );
};

export default CiphertextDisplay; 