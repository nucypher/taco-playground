'use client';

import React from 'react';
import { Block } from './BlockTypes';

interface PresetButtonsProps {
  onAddBlocks: (blocks: Block[]) => void;
  onClearWorkspace: () => void;
}

const PresetButtons: React.FC<PresetButtonsProps> = ({ onAddBlocks, onClearWorkspace }) => {
  const handleTimelockPreset = () => {
    // Create a timelock block with a value block for the timestamp
    const timestampBlock: Block = {
      id: `timestamp-${Date.now()}`,
      type: 'value',
      category: 'values',
      label: 'Timestamp',
      inputType: 'number',
      value: Math.floor(Date.now() / 1000).toString(),
    };

    const timelockBlock: Block = {
      id: `timelock-${Date.now()}`,
      type: 'condition',
      category: 'conditions',
      label: 'Time Lock',
      // This will generate a condition like:
      // { chain: 1, returnValueTest: { comparator: '>=', value: timestamp } }
      inputs: [
        {
          id: 'returnValueTest',
          type: ['value'],
          label: 'Timestamp',
          connected: timestampBlock
        }
      ],
      properties: {
        chain: 1,
        comparator: '>='
      }
    };

    onAddBlocks([timelockBlock]);
  };

  return (
    <div className="flex justify-between items-center p-4 bg-gray-900 border-b border-gray-700">
      <div className="flex gap-2">
        <button
          onClick={handleTimelockPreset}
          className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 
            text-white rounded-md transition-colors flex items-center gap-2"
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          Timelock (Now)
        </button>
      </div>

      <button
        onClick={onClearWorkspace}
        className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 
          text-white rounded-md transition-colors flex items-center gap-2"
      >
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
          />
        </svg>
        Clear Workspace
      </button>
    </div>
  );
};

export default PresetButtons; 