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
import TacoProvider from './TacoProvider';

const TacoPlayground: React.FC = () => {
  const [currentCondition, setCurrentCondition] = useState<any>(null);
  const [messageKit, setMessageKit] = useState<any>(null);

  useEffect(() => {
    console.log('TacoPlayground currentCondition updated:', currentCondition);
  }, [currentCondition]);

  const handleConditionChange = (condition: any) => {
    console.log('TacoPlayground handleConditionChange called with:', condition);
    setCurrentCondition(condition);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <TacoProvider>
        <MainLayout>
          <div className="flex flex-col gap-3 max-w-[1600px] mx-auto">
            <WorkspaceLayout
              workspace={
                <BlockWorkspace 
                  onConditionChange={handleConditionChange}
                />
              }
              preview={<JsonPreview condition={currentCondition} />}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black rounded-lg">
                <EncryptionPanel
                  condition={currentCondition}
                  onMessageKitGenerated={setMessageKit}
                />
              </div>
              <div className="bg-black rounded-lg">
                <DecryptionPanel messageKit={messageKit} />
              </div>
            </div>
          </div>
        </MainLayout>
      </TacoProvider>
    </DndProvider>
  );
};

export default TacoPlayground; 