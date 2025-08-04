import { satisfies } from "@pylon/communal";

export type DocLink = {
  begin: number;
  end: number;
};

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

export type Variable = {
  typename: "Variable";
  name: string;
};

export type TaskResult = {
  typename: "TaskResult";
  name: string;
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

export type NodeTypename = Node["typename"];

export type NodeRegistry = {
  Value: Value;
  AffineTerm: AffineTerm;
  AffineExpression: AffineExpression;
  Variable: Variable;
  TaskResult: TaskResult;
  TaskConstraint: TaskConstraint;
  ComparisonConstraint: ComparisonConstraint;
  MaintainRatioConstraint: MaintainRatioConstraint;
  OneOf: OneOf;
  AllOf: AllOf;
  If: If;
};
void satisfies<NodeRegistry, Record<NodeTypename, Node>>;
