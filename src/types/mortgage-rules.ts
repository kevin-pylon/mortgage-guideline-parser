export interface MortgageRule {
  id: string;
  name: string;
  description: string;
  category: MortgageRuleCategory;
  constraints: MortgageConstraint[];
  validationRules: ValidationRule[];
  documentation?: string;
  examples?: string[];
}

export interface MortgageConstraint {
  id: string;
  name: string;
  type: ConstraintType;
  field: string;
  condition: ConstraintCondition;
  value: any;
  unit?: string;
  description: string;
  isRequired: boolean;
  errorMessage?: string;
}

export interface ValidationRule {
  id: string;
  name: string;
  type: ValidationType;
  condition: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export type MortgageRuleCategory = 
  | 'income_requirements'
  | 'credit_score'
  | 'down_payment'
  | 'debt_to_income_ratio'
  | 'property_requirements'
  | 'documentation'
  | 'employment'
  | 'reserves'
  | 'loan_amount'
  | 'property_type'
  | 'occupancy'
  | 'other';

export type ConstraintType = 
  | 'minimum'
  | 'maximum'
  | 'exact'
  | 'range'
  | 'enum'
  | 'pattern'
  | 'custom';

export type ConstraintCondition = 
  | 'greater_than'
  | 'greater_than_or_equal'
  | 'less_than'
  | 'less_than_or_equal'
  | 'equals'
  | 'not_equals'
  | 'in'
  | 'not_in'
  | 'matches'
  | 'custom';

export type ValidationType = 
  | 'field_validation'
  | 'cross_field_validation'
  | 'business_logic'
  | 'conditional_validation';

export interface MortgageRulesSchema {
  version: string;
  lender: string;
  program: string;
  effectiveDate: string;
  rules: MortgageRule[];
  metadata: {
    totalRules: number;
    categories: Record<MortgageRuleCategory, number>;
    generatedAt: string;
    sourceDocument: string;
  };
}

export interface TypeScriptCodeGeneration {
  interfaces: string;
  enums: string;
  validationFunctions: string;
  constants: string;
} 