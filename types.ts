export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  isAi?: boolean;
}

export type Operator = '+' | '-' | '*' | '/' | '%' | null;

export interface CalculatorState {
  currentValue: string;
  previousValue: string | null;
  operator: Operator;
  history: HistoryItem[];
  isNewEntry: boolean;
}

export interface AIResponse {
  answer: string;
  explanation?: string;
}