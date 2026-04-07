export type CategoryName =
  | 'MEDIUM'
  | 'METHOD'
  | 'SUBJECT'
  | 'STYLE'
  | 'ELEMENTS'
  | 'FUNCTION'
  | 'CONTEXT'
  | 'HISTORY';

export const CATEGORY_NAMES: CategoryName[] = [
  'MEDIUM', 'METHOD', 'SUBJECT', 'STYLE',
  'ELEMENTS', 'FUNCTION', 'CONTEXT', 'HISTORY',
];

export interface SelectionState {
  [key: string]: string;
  MEDIUM: string;
  METHOD: string;
  SUBJECT: string;
  STYLE: string;
  ELEMENTS: string;
  FUNCTION: string;
  CONTEXT: string;
  HISTORY: string;
  foundation: string;
}

export const EMPTY_SELECTIONS: SelectionState = {
  MEDIUM: '', METHOD: '', SUBJECT: '', STYLE: '',
  ELEMENTS: '', FUNCTION: '', CONTEXT: '', HISTORY: '',
  foundation: '',
};
