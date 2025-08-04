import { Node } from "./types";

export const codegen = (node: Node): string => {
  switch (node.typename) {
    case "AffineTerm": {
      return `${codegen(node.variable)}.times(${codegen(node.coefficient)})`;
    }
    case "AffineExpression": {
      return node.affineTerms
        .map((affineTerm) => `${codegen(affineTerm)}.plus(`)
        .join("")
        .concat(node.constantTerms.map(codegen).join("+"))
        .concat(node.affineTerms.map(() => ")").join(""));
    }
    case "AllOf": {
      return `dsl.allOf(${node.preds.map(codegen).join(",")})`;
    }
    case "If": {
      return `dsl.if_(${codegen(node.cond)}).then(${codegen(node.then)})${
        node.else ? `.else(${codegen(node.else)})` : ""
      }`;
    }
    case "ComparisonConstraint": {
      return `${codegen(node.lhs)}.${
        stringToOperatorMap[node.operator]
      }(${codegen(node.rhs)})`;
    }
    case "MaintainRatioConstraint": {
      return `${codegen(node.numerator)}.maintain_ratio(${codegen(
        node.denominator
      )},"${node.operator}",${codegen(node.ratio)})`;
    }
    case "OneOf": {
      return `dsl.oneOf(${node.options.map(codegen).join(",")})`;
    }
    case "TaskConstraint": {
      const lastElementInPath = node.path.split(".").slice(-1)[0];
      return `fetchTask(${node.root.name})("${node.path}"${
        node.inner
          ? `,(${lastElementInPath})=>${
              node.array
                ? `dsl.allOf(...${lastElementInPath}.map((${lastElementInPath}Element)=>${codegen(
                    node.inner
                  )}))`
                : codegen(node.inner)
            }`
          : ""
      })`;
    }
    case "TaskResult": {
      return node.name;
    }
    case "Value": {
      return node.type === "string" ? `"${node.value}"` : `${node.value}`;
    }
    case "Variable": {
      return `vars.${node.name}`;
    }
  }
};

const stringToOperatorMap = {
  ">=": "is_gte",
  "==": "is_eq",
  "<=": "is_lte",
} as const satisfies Record<">=" | "==" | "<=", string>;
