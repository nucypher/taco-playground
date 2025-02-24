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
      <div className={`fixed right-0 top-0 h-full w-80 bg-black border-l border-white/10 transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-lg font-medium text-white">Network Settings</h3>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white/80 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Domain
              </label>
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
              <label className="block text-sm font-medium text-white/80 mb-2">
                Ritual ID
              </label>
              <div className="w-full px-3 py-2 bg-white/5 text-white border border-white/10 rounded-lg">
                {config.ritualId}
              </div>
              <p className="mt-1 text-sm text-white/60">
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