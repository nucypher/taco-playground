'use client';

import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MainLayout from './layout/MainLayout';
import WorkspaceLayout from './layout/WorkspaceLayout';
import BlockWorkspace from './blocks/BlockWorkspace';
import JsonPreview from './blocks/JsonPreview';
import EncryptionPanel from './EncryptionPanel';
import DecryptionPanel from './DecryptionPanel';
import TacoProvider from './TacoProvider';
import NetworkCheck from './NetworkCheck';

const TacoPlayground: React.FC = () => {
  const [currentCondition, setCurrentCondition] = useState<any>(null);
  const [messageKit, setMessageKit] = useState<any>(null);

  return (
    <TacoProvider>
      <DndProvider backend={HTML5Backend}>
        <MainLayout>
          <NetworkCheck />
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
    </TacoProvider>
  );
};

export default TacoPlayground; 