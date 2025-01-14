'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Block } from './BlockTypes';

interface ValueBlockProps {
  block: Block;
  isPreview?: boolean;
  onChange?: (value: string) => void;
}

const ValueBlock: React.FC<ValueBlockProps> = ({ 
  block, 
  isPreview = false,
  onChange 
}) => {
  const [value, setValue] = useState(block.value || '');

  useEffect(() => {
    if (block.value !== value) {
      setValue(block.value || '');
    }
  }, [block.value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange?.(newValue);
  }, [onChange]);

  return (
    <div className={`
      group relative flex items-center gap-2 p-2 rounded-lg
      ${isPreview ? 'bg-green-100' : 'bg-green-500 shadow-md hover:shadow-lg transform hover:-translate-y-1'}
      transition-all duration-200
    `}>
      <label className={`
        text-sm font-medium whitespace-nowrap
        ${isPreview ? 'text-green-800' : 'text-white'}
      `}>
        {block.label}:
      </label>
      <input
        type={block.inputType || 'text'}
        value={value}
        onChange={handleChange}
        placeholder={block.placeholder || `Enter ${block.label.toLowerCase()}`}
        className={`
          bg-white/90 rounded px-2 py-1 text-sm w-full
          border border-transparent
          focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent
          placeholder-gray-400 text-gray-900
          ${isPreview ? 'bg-white' : 'bg-white/90'}
        `}
      />
    </div>
  );
};

export default ValueBlock; 