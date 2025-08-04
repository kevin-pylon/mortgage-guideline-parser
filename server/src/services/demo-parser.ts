import { MortgageRulesSchema } from '../types/mortgage-types';
import { ConstraintGenerator } from './constraint-generator';

export class DemoParser {
  /**
   * Generates sample mortgage rules for demonstration purposes
   */
  static generateSampleMortgageRules(lenderName: string, programName: string): MortgageRulesSchema {
    return {
      version: "1.0",
      lender: lenderName,
      program: programName,
      effectiveDate: new Date().toISOString().split('T')[0],
      rules: [
        {
          id: "1",
          name: "Credit Score Requirement",
          description: "Minimum credit score required for conventional loans",
          category: "credit",
          constraints: [
            {
              field: "creditScore",
              condition: "greater_than_or_equal",
              value: 620,
              unit: "points",
              description: "Minimum credit score of 620 required"
            }
          ],
          validationRules: [
            {
              field: "creditScore",
              rule: "credit_score_verification",
              severity: "error",
              message: "Credit score must be verified through credit report"
            }
          ]
        },
        {
          id: "2",
          name: "Debt-to-Income Ratio",
          description: "Maximum debt-to-income ratio allowed",
          category: "income",
          constraints: [
            {
              field: "debtToIncomeRatio",
              condition: "less_than_or_equal",
              value: 0.43,
              unit: "ratio",
              description: "DTI ratio must not exceed 43%"
            }
          ],
          validationRules: [
            {
              field: "debtToIncomeRatio",
              rule: "dti_calculation",
              severity: "error",
              message: "DTI ratio must be calculated using verified income"
            }
          ]
        },
        {
          id: "3",
          name: "Down Payment Requirement",
          description: "Minimum down payment for conventional loans",
          category: "down_payment",
          constraints: [
            {
              field: "downPayment",
              condition: "greater_than_or_equal",
              value: 5000,
              unit: "dollars",
              description: "Minimum down payment of $5,000 required"
            }
          ],
          validationRules: [
            {
              field: "downPayment",
              rule: "down_payment_verification",
              severity: "error",
              message: "Down payment must be verified through bank statements"
            }
          ]
        },
        {
          id: "4",
          name: "Employment History",
          description: "Minimum employment history requirement",
          category: "employment",
          constraints: [
            {
              field: "employmentHistory",
              condition: "greater_than_or_equal",
              value: 2,
              unit: "years",
              description: "Minimum 2 years of employment history required"
            }
          ],
          validationRules: [
            {
              field: "employmentHistory",
              rule: "employment_verification",
              severity: "error",
              message: "Employment must be verified through pay stubs and W-2s"
            }
          ]
        },
        {
          id: "5",
          name: "Reserve Requirements",
          description: "Minimum reserve requirements after closing",
          category: "reserves",
          constraints: [
            {
              field: "reserves",
              condition: "greater_than_or_equal",
              value: 2,
              unit: "months",
              description: "Minimum 2 months of reserves required after closing"
            }
          ],
          validationRules: [
            {
              field: "reserves",
              rule: "reserve_verification",
              severity: "error",
              message: "Reserves must be verified through bank statements"
            }
          ]
        }
      ],
      metadata: {
        totalRules: 5,
        categories: {
          credit: 1,
          income: 1,
          down_payment: 1,
          employment: 1,
          reserves: 1
        },
        generatedAt: new Date().toISOString(),
        sourceDocument: "sample-mortgage-guidelines.pdf"
      }
    };
  }

  /**
   * Generates sample TypeScript code for mortgage validation
   */
  static generateSampleTypeScriptCode(schema: MortgageRulesSchema): string {
    return `// Generated TypeScript code for ${schema.lender} ${schema.program}
// Generated on: ${schema.metadata.generatedAt}

export interface MortgageApplication {
  creditScore: number;
  income: number;
  downPayment: number;
  debtToIncomeRatio: number;
  employmentHistory: number;
  reserves: number;
  loanAmount: number;
  propertyValue: number;
  monthlyPayment: number;
  totalDebt: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class MortgageValidator {
  private rules: MortgageRule[];

  constructor() {
    this.rules = ${JSON.stringify(schema.rules, null, 2)};
  }

  validateApplication(application: MortgageApplication): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Credit Score Validation
    if (application.creditScore < 620) {
      errors.push("Credit score must be at least 620");
    }

    // Debt-to-Income Ratio Validation
    if (application.debtToIncomeRatio > 0.43) {
      errors.push("Debt-to-income ratio must not exceed 43%");
    }

    // Down Payment Validation
    if (application.downPayment < 5000) {
      errors.push("Down payment must be at least $5,000");
    }

    // Employment History Validation
    if (application.employmentHistory < 2) {
      errors.push("Employment history must be at least 2 years");
    }

    // Reserve Requirements
    if (application.reserves < 2) {
      errors.push("Must have at least 2 months of reserves after closing");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  getValidationRules(): MortgageRule[] {
    return this.rules;
  }
}

// Export the validator instance
export const mortgageValidator = new MortgageValidator();
`;
  }

  /**
   * Processes a PDF and generates comprehensive output with constraint nodes
   */
  static async processPDFAndGenerateConstraints(
    lenderName: string,
    programName: string,
    pdfText?: string
  ): Promise<{
    success: boolean;
    mortgageRules: MortgageRulesSchema;
    typescriptCode: string;
    constraintNodes: any[];
    totalNodes: number;
    nodeTypes: any;
    metadata: any;
  }> {
    try {
      // Generate sample mortgage rules
      const mortgageRules = this.generateSampleMortgageRules(lenderName, programName);
      
      // Generate TypeScript code
      const typescriptCode = this.generateSampleTypeScriptCode(mortgageRules);
      
      // Generate constraint nodes
      const constraintNodes = ConstraintGenerator.generateAllConstraintNodes(mortgageRules);
      
      // Create comprehensive output
      const output = {
        success: true,
        mortgageRules,
        typescriptCode,
        constraintNodes,
        totalNodes: constraintNodes.length,
        nodeTypes: {
          variables: constraintNodes.filter(n => n.typename === 'Variable').length,
          values: constraintNodes.filter(n => n.typename === 'Value').length,
          comparisonConstraints: constraintNodes.filter(n => n.typename === 'ComparisonConstraint').length,
          maintainRatioConstraints: constraintNodes.filter(n => n.typename === 'MaintainRatioConstraint').length,
          taskConstraints: constraintNodes.filter(n => n.typename === 'TaskConstraint').length,
          conditionalConstraints: constraintNodes.filter(n => n.typename === 'If').length,
          compositeConstraints: constraintNodes.filter(n => n.typename === 'AllOf' || n.typename === 'OneOf').length,
          affineExpressions: constraintNodes.filter(n => n.typename === 'AffineExpression').length,
          taskResults: constraintNodes.filter(n => n.typename === 'TaskResult').length,
        },
        metadata: {
          sourceDocument: "sample-mortgage-guidelines.pdf",
          processedAt: new Date().toISOString(),
          lender: lenderName,
          program: programName,
          extractedTextLength: pdfText?.length || 0,
          preprocessedTextLength: pdfText?.length || 0,
          demoMode: true
        }
      };

      return output;
    } catch (error) {
      return {
        success: false,
        mortgageRules: {} as MortgageRulesSchema,
        typescriptCode: "",
        constraintNodes: [],
        totalNodes: 0,
        nodeTypes: {},
        metadata: {}
      };
    }
  }
} 