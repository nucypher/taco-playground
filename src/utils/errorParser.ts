/**
 * Parses TACo decryption errors and formats them for display
 */

interface NodeError {
  nodeAddress: string;
  errorMessage: string;
  errorType: string;
}

/**
 * Parses a TACo decryption error message and extracts node-specific errors
 * @param errorMessage The raw error message from TACo
 * @returns An array of parsed node errors
 */
export const parseTacoDecryptionError = (errorMessage: string): NodeError[] => {
  try {
    // Extract the JSON part from the error message
    const jsonMatch = errorMessage.match(/Threshold of responses not met; TACo decryption failed with errors: (.*)/);
    if (!jsonMatch || !jsonMatch[1]) {
      return [{ 
        nodeAddress: 'Unknown', 
        errorMessage: errorMessage,
        errorType: 'Unknown Error'
      }];
    }

    // Parse the JSON string
    const errorsJson = JSON.parse(jsonMatch[1]);
    
    // Process each node error
    return Object.entries(errorsJson).map(([nodeAddress, errorDetails]: [string, any]) => {
      // Extract the error message from the Python-style error tuple
      let errorMessage = 'Unknown error';
      let errorType = 'Unknown';
      
      if (typeof errorDetails === 'string') {
        // Try to extract the error message using regex
        const messageMatch = errorDetails.match(/ThresholdDecryptionRequestFailed\('Node .* raised (.*?)'\)/);
        if (messageMatch && messageMatch[1]) {
          errorMessage = messageMatch[1];
        } else {
          errorMessage = errorDetails;
        }
        
        // Extract error type
        const typeMatch = errorDetails.match(/<class '(.+?)'/);
        if (typeMatch && typeMatch[1]) {
          errorType = typeMatch[1].split('.').pop() || 'Unknown';
        }
      }
      
      return {
        nodeAddress,
        errorMessage,
        errorType
      };
    });
  } catch (error) {
    console.error('Error parsing TACo error message:', error);
    return [{ 
      nodeAddress: 'Unknown', 
      errorMessage: errorMessage,
      errorType: 'Parse Error'
    }];
  }
};

/**
 * Formats a TACo decryption error for display
 * @param errorMessage The raw error message from TACo
 * @returns A formatted HTML string for display
 */
export const formatTacoDecryptionError = (errorMessage: string): string => {
  const nodeErrors = parseTacoDecryptionError(errorMessage);
  
  if (nodeErrors.length === 0) {
    return errorMessage;
  }
  
  // Group errors by type for better organization
  const errorsByType: Record<string, NodeError[]> = {};
  
  nodeErrors.forEach(error => {
    if (!errorsByType[error.errorMessage]) {
      errorsByType[error.errorMessage] = [];
    }
    errorsByType[error.errorMessage].push(error);
  });
  
  // Build the formatted message
  let formattedMessage = '<div class="taco-error">';
  formattedMessage += '<p class="taco-error-title">Decryption Failed: Threshold of responses not met</p>';
  formattedMessage += '<ul class="taco-error-list">';
  
  Object.entries(errorsByType).forEach(([errorMessage, errors]) => {
    formattedMessage += `<li class="taco-error-type">
      <div class="taco-error-message">${errorMessage}</div>
      <ul class="taco-error-nodes">`;
    
    errors.forEach(error => {
      formattedMessage += `<li class="taco-error-node">${error.nodeAddress}</li>`;
    });
    
    formattedMessage += '</ul></li>';
  });
  
  formattedMessage += '</ul></div>';
  
  return formattedMessage;
}; 