'use client';

import React, { useState, useEffect } from 'react';
import { initialize } from '@nucypher/taco';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MainLayout from './layout/MainLayout';
import WorkspaceLayout from './layout/WorkspaceLayout';
import BlockWorkspace from './blocks/BlockWorkspace';
import JsonPreview from './blocks/JsonPreview';
import EncryptionPanel from './EncryptionPanel';
import DecryptionPanel from './DecryptionPanel';

const TacoPlayground: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentCondition, setCurrentCondition] = useState<any>(null);
  const [messageKit, setMessageKit] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      await initialize();
      setIsInitialized(true);
    };
    init();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg">Initializing TACo...</div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <MainLayout>
        <div className="flex flex-col gap-3 max-w-[1600px] mx-auto">
          <WorkspaceLayout
            workspace={<BlockWorkspace onConditionChange={setCurrentCondition} />}
            preview={<JsonPreview condition={currentCondition} />}
          />
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-700 p-3">
              <EncryptionPanel
                condition={currentCondition}
                onMessageKitGenerated={setMessageKit}
              />
            </div>
            <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-700 p-3">
              <DecryptionPanel messageKit={messageKit} />
            </div>
          </div>
        </div>
      </MainLayout>
    </DndProvider>
  );
};

export default TacoPlayground; 