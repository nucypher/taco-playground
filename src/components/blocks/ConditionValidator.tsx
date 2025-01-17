'use client';

import React from 'react';
import { conditions } from '@nucypher/taco';

interface ConditionValidatorProps {
  condition: any;
}

const ConditionValidator: React.FC<ConditionValidatorProps> = ({ condition }) => {
  const isValid = React.useMemo(() => {
    if (!condition) return false;
    
    try {
      console.log('Validating condition:', condition);
      // Validate based on condition type
      if (condition.chain !== undefined) { // TimeCondition
        new conditions.base.time.TimeCondition({
          chain: condition.chain,
          returnValueTest: condition.returnValueTest
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  }, [condition]);

  return (
    <div className="flex items-center gap-2">
      {isValid ? (
        <>
          <svg 
            className="w-5 h-5 text-green-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
          <span className="text-sm text-green-500">Valid condition</span>
        </>
      ) : (
        <>
          <svg 
            className="w-5 h-5 text-red-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
          <span className="text-sm text-red-500">Invalid condition</span>
        </>
      )}
    </div>
  );
};

export default ConditionValidator; 