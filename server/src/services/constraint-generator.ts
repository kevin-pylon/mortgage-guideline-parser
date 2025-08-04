import { MortgageRulesSchema, MortgageRule, MortgageConstraint } from '../types/mortgage-types';

// Types from the guideline builder
export type NumericValue = {
  typename: "Value";
  type: "number";
  value: number;
};

export type Value =
  | NumericValue
  | {
      typename: "Value";
      type: "string" | "boolean";
      value: unknown;
    };

export type Variable = {
  typename: "Variable";
  name: string;
};

export type TaskResult = {
  typename: "TaskResult";
  name: string;
};

export type AffineTerm = {
  typename: "AffineTerm";
  coefficient: NumericValue | TaskResult;
  variable: Variable;
};

export type AffineExpression = {
  typename: "AffineExpression";
  affineTerms: AffineTerm[];
  constantTerms: (NumericValue | TaskResult)[];
};

export type TaskConstraint = {
  typename: "TaskConstraint";
  path: `$${string}`;
  root: { name: "Loan" } | TaskResult;
  array?: boolean;
  inner?: Constraint;
};

export type ComparisonConstraint = {
  typename: "ComparisonConstraint";
  lhs: Variable;
  operator: ">=" | "==" | "<=";
  rhs: Value | Variable | TaskResult | AffineExpression;
};

export type MaintainRatioConstraint = {
  typename: "MaintainRatioConstraint";
  numerator: Variable;
  denominator: Value | Variable | TaskResult | AffineExpression;
  operator: ">=" | "==" | "<=";
  ratio: NumericValue;
};

export type OneOf = {
  typename: "OneOf";
  options: Constraint[];
};

export type AllOf = {
  typename: "AllOf";
  preds: Constraint[];
};

export type If = {
  typename: "If";
  cond: ComparisonConstraint;
  then: Constraint;
  else?: Constraint;
};

export type Constraint =
  | TaskConstraint
  | ComparisonConstraint
  | MaintainRatioConstraint
  | OneOf
  | AllOf
  | If;

export type Node =
  | Constraint
  | Value
  | Variable
  | TaskResult
  | AffineExpression
  | AffineTerm;

export class ConstraintGenerator {
  /**
   * Generates constraint nodes from mortgage rules schema
   */
  static generateConstraintNodes(schema: MortgageRulesSchema): Node[] {
    const nodes: Node[] = [];
    
    // Generate variables for common mortgage fields
    const variables = this.generateVariables();
    nodes.push(...variables);
    
    // Generate constraint nodes from rules
    schema.rules.forEach(rule => {
      const ruleNodes = this.generateNodesFromRule(rule);
      nodes.push(...ruleNodes);
    });
    
    return nodes;
  }

  /**
   * Generates common mortgage variables
   */
  private static generateVariables(): Variable[] {
    return [
      { typename: "Variable", name: "creditScore" },
      { typename: "Variable", name: "income" },
      { typename: "Variable", name: "downPayment" },
      { typename: "Variable", name: "loanAmount" },
      { typename: "Variable", name: "debtToIncomeRatio" },
      { typename: "Variable", name: "reserves" },
      { typename: "Variable", name: "employmentHistory" },
      { typename: "Variable", name: "propertyType" },
      { typename: "Variable", name: "occupancy" },
      { typename: "Variable", name: "propertyValue" },
      { typename: "Variable", name: "monthlyPayment" },
      { typename: "Variable", name: "totalDebt" }
    ];
  }

  /**
   * Generates nodes from a single mortgage rule
   */
  private static generateNodesFromRule(rule: MortgageRule): Node[] {
    const nodes: Node[] = [];
    
    // Generate comparison constraints from rule constraints
    rule.constraints.forEach(constraint => {
      const constraintNodes = this.generateNodesFromConstraint(constraint);
      nodes.push(...constraintNodes);
    });
    
    return nodes;
  }

  /**
   * Generates nodes from a mortgage constraint
   */
  private static generateNodesFromConstraint(constraint: MortgageConstraint): Node[] {
    const nodes: Node[] = [];
    
    // Create numeric value for the constraint value
    const valueNode: NumericValue = {
      typename: "Value",
      type: "number",
      value: typeof constraint.value === 'number' ? constraint.value : 0
    };
    nodes.push(valueNode);
    
    // Create variable for the constraint field
    const variableNode: Variable = {
      typename: "Variable",
      name: constraint.field
    };
    nodes.push(variableNode);
    
    // Create comparison constraint based on the constraint type
    const comparisonConstraint = this.createComparisonConstraint(constraint, variableNode, valueNode);
    if (comparisonConstraint) {
      nodes.push(comparisonConstraint);
    }
    
    return nodes;
  }

  /**
   * Creates a comparison constraint from a mortgage constraint
   */
  private static createComparisonConstraint(
    constraint: MortgageConstraint,
    variable: Variable,
    value: NumericValue
  ): ComparisonConstraint | null {
    let operator: ">=" | "==" | "<=";
    
    switch (constraint.condition) {
      case "greater_than":
      case "greater_than_or_equal":
        operator = ">=";
        break;
      case "less_than":
      case "less_than_or_equal":
        operator = "<=";
        break;
      case "equals":
        operator = "==";
        break;
      default:
        return null;
    }
    
    return {
      typename: "ComparisonConstraint",
      lhs: variable,
      operator,
      rhs: value
    };
  }

  /**
   * Generates maintain ratio constraints for debt-to-income ratios
   */
  static generateRatioConstraints(): MaintainRatioConstraint[] {
    const constraints: MaintainRatioConstraint[] = [];
    
    // DTI ratio constraint
    const dtiConstraint: MaintainRatioConstraint = {
      typename: "MaintainRatioConstraint",
      numerator: { typename: "Variable", name: "totalDebt" },
      denominator: { typename: "Variable", name: "income" },
      operator: "<=",
      ratio: { typename: "Value", type: "number", value: 0.43 }
    };
    constraints.push(dtiConstraint);
    
    return constraints;
  }

  /**
   * Generates task constraints for complex validations
   */
  static generateTaskConstraints(): TaskConstraint[] {
    const constraints: TaskConstraint[] = [];
    
    // Credit score validation task
    const creditScoreTask: TaskConstraint = {
      typename: "TaskConstraint",
      path: "$creditScore",
      root: { name: "Loan" },
      inner: {
        typename: "ComparisonConstraint",
        lhs: { typename: "Variable", name: "creditScore" },
        operator: ">=",
        rhs: { typename: "Value", type: "number", value: 620 }
      }
    };
    constraints.push(creditScoreTask);
    
    // Employment history validation task
    const employmentTask: TaskConstraint = {
      typename: "TaskConstraint",
      path: "$employmentHistory",
      root: { name: "Loan" },
      inner: {
        typename: "ComparisonConstraint",
        lhs: { typename: "Variable", name: "employmentHistory" },
        operator: ">=",
        rhs: { typename: "Value", type: "number", value: 2 }
      }
    };
    constraints.push(employmentTask);
    
    return constraints;
  }

  /**
   * Generates conditional constraints (If statements)
   */
  static generateConditionalConstraints(): If[] {
    const constraints: If[] = [];
    
    // If credit score is high, allow higher DTI
    const highCreditScoreCondition: If = {
      typename: "If",
      cond: {
        typename: "ComparisonConstraint",
        lhs: { typename: "Variable", name: "creditScore" },
        operator: ">=",
        rhs: { typename: "Value", type: "number", value: 700 }
      },
      then: {
        typename: "MaintainRatioConstraint",
        numerator: { typename: "Variable", name: "totalDebt" },
        denominator: { typename: "Variable", name: "income" },
        operator: "<=",
        ratio: { typename: "Value", type: "number", value: 0.50 }
      },
      else: {
        typename: "MaintainRatioConstraint",
        numerator: { typename: "Variable", name: "totalDebt" },
        denominator: { typename: "Variable", name: "income" },
        operator: "<=",
        ratio: { typename: "Value", type: "number", value: 0.43 }
      }
    };
    constraints.push(highCreditScoreCondition);
    
    return constraints;
  }

  /**
   * Generates composite constraints (AllOf, OneOf)
   */
  static generateCompositeConstraints(): (AllOf | OneOf)[] {
    const constraints: (AllOf | OneOf)[] = [];
    
    // All requirements must be met
    const allRequirements: AllOf = {
      typename: "AllOf",
      preds: [
        {
          typename: "ComparisonConstraint",
          lhs: { typename: "Variable", name: "creditScore" },
          operator: ">=",
          rhs: { typename: "Value", type: "number", value: 620 }
        },
        {
          typename: "ComparisonConstraint",
          lhs: { typename: "Variable", name: "downPayment" },
          operator: ">=",
          rhs: { typename: "Value", type: "number", value: 5000 }
        },
        {
          typename: "MaintainRatioConstraint",
          numerator: { typename: "Variable", name: "totalDebt" },
          denominator: { typename: "Variable", name: "income" },
          operator: "<=",
          ratio: { typename: "Value", type: "number", value: 0.43 }
        }
      ]
    };
    constraints.push(allRequirements);
    
    return constraints;
  }

  /**
   * Generates all constraint nodes from mortgage rules
   */
  static generateAllConstraintNodes(schema: MortgageRulesSchema): Node[] {
    const nodes: Node[] = [];
    
    // Generate basic constraint nodes from mortgage rules
    const basicNodes = this.generateConstraintNodes(schema);
    nodes.push(...basicNodes);
    
    // Generate ratio constraints for debt-to-income ratios
    const ratioConstraints = this.generateRatioConstraints();
    nodes.push(...ratioConstraints);
    
    // Generate task constraints for complex validations
    const taskConstraints = this.generateTaskConstraints();
    nodes.push(...taskConstraints);
    
    // Generate conditional constraints for tiered requirements
    const conditionalConstraints = this.generateConditionalConstraints();
    nodes.push(...conditionalConstraints);
    
    // Generate composite constraints for complex rule combinations
    const compositeConstraints = this.generateCompositeConstraints();
    nodes.push(...compositeConstraints);
    
    // Generate affine expressions for complex calculations
    const affineExpressions = this.generateAffineExpressions();
    nodes.push(...affineExpressions);
    
    // Generate task results for computed values
    const taskResults = this.generateTaskResults();
    nodes.push(...taskResults);
    
    return nodes;
  }

  /**
   * Generates affine expressions for complex mortgage calculations
   */
  static generateAffineExpressions(): AffineExpression[] {
    const expressions: AffineExpression[] = [];
    
    // Monthly payment calculation
    const monthlyPaymentExpression: AffineExpression = {
      typename: "AffineExpression",
      affineTerms: [
        {
          typename: "AffineTerm",
          coefficient: { typename: "Value", type: "number", value: 0.005 },
          variable: { typename: "Variable", name: "loanAmount" }
        }
      ],
      constantTerms: [
        { typename: "Value", type: "number", value: 0 }
      ]
    };
    expressions.push(monthlyPaymentExpression);
    
    // Total debt calculation
    const totalDebtExpression: AffineExpression = {
      typename: "AffineExpression",
      affineTerms: [
        {
          typename: "AffineTerm",
          coefficient: { typename: "Value", type: "number", value: 1 },
          variable: { typename: "Variable", name: "monthlyPayment" }
        },
        {
          typename: "AffineTerm",
          coefficient: { typename: "Value", type: "number", value: 1 },
          variable: { typename: "Variable", name: "otherDebt" }
        }
      ],
      constantTerms: []
    };
    expressions.push(totalDebtExpression);
    
    return expressions;
  }

  /**
   * Generates task results for computed mortgage values
   */
  static generateTaskResults(): TaskResult[] {
    const results: TaskResult[] = [
      { typename: "TaskResult", name: "monthlyPayment" },
      { typename: "TaskResult", name: "totalDebt" },
      { typename: "TaskResult", name: "debtToIncomeRatio" },
      { typename: "TaskResult", name: "loanToValueRatio" },
      { typename: "TaskResult", name: "creditScore" },
      { typename: "TaskResult", name: "employmentVerification" },
      { typename: "TaskResult", name: "incomeVerification" },
      { typename: "TaskResult", name: "propertyAppraisal" }
    ];
    
    return results;
  }
} 