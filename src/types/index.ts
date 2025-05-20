export interface StyleRule {
  id: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
}

export interface Suggestion {
  id: string;
  text: string;
}
