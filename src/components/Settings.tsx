import React, { useEffect } from 'react';
import { domains } from '@nucypher/taco';

export interface SettingsConfig {
  domain: typeof domains.DEVNET | typeof domains.TESTNET;
  ritualId: number;
}

interface SettingsProps {
  config: SettingsConfig;
  onConfigChange: (config: SettingsConfig) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  config,
  onConfigChange,
  isOpen,
  onClose
}) => {
  // Update ritual ID when domain changes
  useEffect(() => {
    const ritualId = config.domain === domains.DEVNET ? 27 : 6;
    if (config.ritualId !== ritualId) {
      onConfigChange({ ...config, ritualId });
    }
  }, [config.domain]);

  const handleDomainChange = (value: string) => {
    const domain = value === 'devnet' ? domains.DEVNET : domains.TESTNET;
    onConfigChange({
      ...config,
      domain
    });
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-black border-l border-white/10 transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                <svg className="w-5 h-5 text-taco" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white">Network Settings</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white/80 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-6 mt-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
                  <svg className="w-4 h-4 text-taco" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <label className="block text-sm font-medium text-white/80">
                  Domain
                </label>
              </div>
              <select
                value={config.domain === domains.DEVNET ? 'devnet' : 'testnet'}
                onChange={(e) => handleDomainChange(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 text-white border border-white/10 rounded-lg
                  focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20"
              >
                <option value="devnet">Devnet (Lynx)</option>
                <option value="testnet">Testnet (Tapir)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
                  <svg className="w-4 h-4 text-taco" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <label className="block text-sm font-medium text-white/80">
                  Ritual ID
                </label>
              </div>
              <div className="w-full px-3 py-2 bg-white/5 text-white border border-white/10 rounded-lg">
                {config.ritualId}
              </div>
              <p className="mt-2 text-sm text-white/60 flex items-center gap-2">
                <svg className="w-4 h-4 text-taco" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ritual ID is automatically set based on the selected domain
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings; 