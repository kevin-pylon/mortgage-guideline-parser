export interface MortgageRulesSchema {
  version: string;
  lender: string;
  program: string;
  effectiveDate: string;
  rules: MortgageRule[];
  metadata: {
    totalRules: number;
    categories: Record<string, number>;
    generatedAt: string;
    sourceDocument: string;
  };
}

export interface MortgageRule {
  id: string;
  name: string;
  description: string;
  category: string;
  constraints: MortgageConstraint[];
  validationRules: ValidationRule[];
  documentation?: string;
  examples?: string[];
}

export interface MortgageConstraint {
  id: string;
  name: string;
  type: string;
  field: string;
  condition: string;
  value: any;
  unit?: string;
  description: string;
  isRequired: boolean;
  errorMessage?: string;
}

export interface ValidationRule {
  id: string;
  name: string;
  type: string;
  condition: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ParseRequest {
  lenderName: string;
  programName: string;
  openaiApiKey: string;
}

export interface ParseResponse {
  success: boolean;
  data?: MortgageRulesSchema;
  error?: string;
  typescriptCode?: string;
}

export interface UploadResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ConstraintNode {
  typename: string;
  [key: string]: any;
}

export interface ConstraintGenerationResponse {
  success: boolean;
  constraintNodes?: ConstraintNode[];
  totalNodes?: number;
  nodeTypes?: {
    variables: number;
    values: number;
    comparisonConstraints: number;
    maintainRatioConstraints: number;
    taskConstraints: number;
    conditionalConstraints: number;
    compositeConstraints: number;
  };
  error?: string;
} 