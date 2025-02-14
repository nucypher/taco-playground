import { BlockInput } from './BlockTypes';

export interface DragItem {
  id: string;
  type: string;
  category?: string;
  label: string;
  inputs?: BlockInput[];
  properties?: Record<string, unknown>;
  isTemplate: boolean;
}

export type DragRef = ((element: HTMLDivElement | null) => void) | React.RefObject<HTMLDivElement | null>; 
