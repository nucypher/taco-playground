'use client';

import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MainLayout from './layout/MainLayout';
import WorkspaceLayout from './layout/WorkspaceLayout';
import BlockWorkspace from './blocks/BlockWorkspace';
import JsonPreview from './blocks/JsonPreview';
import EncryptionPanel from './EncryptionPanel';
import DecryptionPanel from './DecryptionPanel';
import ErrorPanel from './ErrorPanel';
import TacoProvider from './TacoProvider';
import { TacoCondition } from '../types/taco';
import { ThresholdMessageKit, domains } from '@nucypher/taco';
import Settings, { SettingsConfig } from './Settings';

const TacoPlayground: React.FC = () => {
  const [currentCondition, setCurrentCondition] = useState<TacoCondition | null>(null);
  const [messageKit, setMessageKit] = useState<ThresholdMessageKit | null>(null);
  const [ciphertext, setCiphertext] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsConfig>({
    domain: domains.DEVNET,
    ritualId: 27
  });

  useEffect(() => {
    console.log('TacoPlayground currentCondition updated:', currentCondition);
  }, [currentCondition]);

  const handleConditionChange = (condition: TacoCondition | null) => {
    console.log('TacoPlayground handleConditionChange called with:', condition);
    setCurrentCondition(condition);
  };

  const handleMessageKitGenerated = (messageKit: ThresholdMessageKit, ciphertextString: string) => {
    setMessageKit(messageKit);
    setCiphertext(ciphertextString);
  };

  const handleError = (error: string) => {
    setError(error);
    // Automatically clear error after 10 seconds
    setTimeout(() => setError(null), 10000);
  };

  const handleClearError = () => {
    setError(null);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <TacoProvider>
        <MainLayout onOpenSettings={() => setIsSettingsOpen(true)}>
          <div className="flex flex-col gap-4 w-full min-h-0">
            <WorkspaceLayout
              workspace={
                <BlockWorkspace 
                  onConditionChange={handleConditionChange}
                />
              }
              preview={<JsonPreview condition={currentCondition} />}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <EncryptionPanel
                  condition={currentCondition}
                  onMessageKitGenerated={handleMessageKitGenerated}
                  onError={handleError}
                  settings={settings}
                />
              </div>
              <div>
                <DecryptionPanel 
                  messageKit={messageKit}
                  ciphertext={ciphertext}
                  onError={handleError}
                  settings={settings}
                />
              </div>
            </div>
          </div>
          <ErrorPanel error={error} onClear={handleClearError} />
          <Settings
            config={settings}
            onConfigChange={setSettings}
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        </MainLayout>
      </TacoProvider>
    </DndProvider>
  );
};

export default TacoPlayground; 