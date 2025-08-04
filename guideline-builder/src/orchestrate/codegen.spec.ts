import { AllOf, Node } from "./types";
import { codegen } from "./codegen";

describe("codegen", () => {
  describe("AllOf", () => {
    it("works", async () => {
      const node = {
        typename: "AllOf",
        preds: [
          {
            typename: "ComparisonConstraint",
            lhs: {
              typename: "Variable",
              name: "loan_amount",
            },
            operator: ">=",
            rhs: {
              typename: "Value",
              type: "number",
              value: 50_000,
            },
          },
          {
            typename: "TaskConstraint",
            root: { name: "Loan" },
            path: "$.out_of_pocket",
          },
        ],
      } as const satisfies AllOf;

      const codegened = codegen(node);

      expect(codegened).toBe(
        `dsl.allOf(vars.loan_amount.is_gte(50000),fetchTask(Loan)("$.out_of_pocket"))`
      );
    });
  });

  describe("OneOf", () => {
    it("works", async () => {
      const node: Node = {
        typename: "OneOf",
        options: [
          {
            typename: "TaskConstraint",
            root: { name: "Loan" },
            path: "$.foo",
          },
          {
            typename: "TaskConstraint",
            root: { name: "Loan" },
            path: "$.bar",
          },
        ],
      };

      const codegened = codegen(node);

      expect(codegened).toBe(
        `dsl.oneOf(fetchTask(Loan)("$.foo"),fetchTask(Loan)("$.bar"))`
      );
    });
  });

  describe("If", () => {
    it("works", async () => {
      const node: Node = {
        typename: "If",
        cond: {
          typename: "ComparisonConstraint",
          lhs: {
            typename: "Variable",
            name: "foo",
          },
          operator: "<=",
          rhs: {
            typename: "Value",
            type: "number",
            value: 5,
          },
        },
        then: {
          typename: "TaskConstraint",
          root: { name: "Loan" },
          path: "$.bar",
        },
        else: {
          typename: "TaskConstraint",
          root: { name: "Loan" },
          path: "$.baz",
        },
      };

      const codegened = codegen(node);

      expect(codegened).toBe(
        `dsl.if_(vars.foo.is_lte(5)).then(fetchTask(Loan)("$.bar")).else(fetchTask(Loan)("$.baz"))`
      );
    });
  });

  describe("TaskConstraint", () => {
    it("works", async () => {
      const node: Node = {
        typename: "TaskConstraint",
        root: { name: "Loan" },
        path: "$.form1040",
        inner: {
          typename: "TaskConstraint",
          root: { name: "Loan" },
          path: "$.form1007",
        },
      };

      const codegened = codegen(node);

      expect(codegened).toBe(
        `fetchTask(Loan)("$.form1040",(form1040)=>fetchTask(Loan)("$.form1007"))`
      );
    });

    it("works for arrays", async () => {
      const node: Node = {
        typename: "TaskConstraint",
        root: { name: "Loan" },
        path: "$.borrowers",
        array: true,
        inner: {
          typename: "AllOf",
          preds: [
            {
              typename: "TaskConstraint",
              root: {
                typename: "TaskResult",
                name: "borrowersElement",
              },
              path: "$.firstName",
            },
            {
              typename: "TaskConstraint",
              root: {
                typename: "TaskResult",
                name: "borrowersElement",
              },
              path: "$.lastName",
            },
          ],
        },
      };

      const codegened = codegen(node);

      expect(codegened).toBe(
        `fetchTask(Loan)("$.borrowers",(borrowers)=>dsl.allOf(...borrowers.map((borrowersElement)=>dsl.allOf(fetchTask(borrowersElement)("$.firstName"),fetchTask(borrowersElement)("$.lastName")))))`
      );
    });
  });

  describe("AffineExpression", () => {
    it("works", async () => {
      const node: Node = {
        typename: "ComparisonConstraint",
        lhs: {
          typename: "Variable",
          name: "foo",
        },
        operator: "<=",
        rhs: {
          typename: "AffineExpression",
          affineTerms: [
            {
              typename: "AffineTerm",
              coefficient: {
                typename: "Value",
                type: "number",
                value: 5,
              },
              variable: {
                typename: "Variable",
                name: "bar",
              },
            },
            {
              typename: "AffineTerm",
              coefficient: {
                typename: "Value",
                type: "number",
                value: -3,
              },
              variable: {
                typename: "Variable",
                name: "baz",
              },
            },
          ],
          constantTerms: [
            {
              typename: "Value",
              type: "number",
              value: 7,
            },
          ],
        },
      };

      const codegened = codegen(node);

      expect(codegened).toBe(
        "vars.foo.is_lte(vars.bar.times(5).plus(vars.baz.times(-3).plus(7)))"
      );
    });
  });

  describe("MaintainRatioConstraint", () => {
    it("works", async () => {
      const node: Node = {
        typename: "TaskConstraint",
        path: "$.income",
        root: { name: "Loan" },
        inner: {
          typename: "MaintainRatioConstraint",
          numerator: {
            typename: "Variable",
            name: "debt",
          },
          denominator: {
            typename: "TaskResult",
            name: "income",
          },
          operator: "<=",
          ratio: {
            typename: "Value",
            type: "number",
            value: 0.7,
          },
        },
      };

      const codegened = codegen(node);

      expect(codegened).toBe(
        `fetchTask(Loan)("$.income",(income)=>vars.debt.maintain_ratio(income,"<=",0.7))`
      );
    });
  });
});
