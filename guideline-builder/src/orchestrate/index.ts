import { isRight } from "fp-ts/lib/Either";
import { generate } from "./generate";
import { validate, ValidationFailure } from "./validate";
import { NodeTypename } from "./types";

const allConstraints = [
  "AllOf",
  "If",
  "ComparisonConstraint",
  "OneOf",
  "TaskConstraint",
] as const satisfies NodeTypename[];

const MAX_RECURSION_DEPTH = 3;

export const orchestrate = (
  parsed: string,
  validationFailures: ValidationFailure[] = [],
  depth = 0
): string => {
  const constraint = generate(parsed, allConstraints, validationFailures);

  const validationResult = validate(constraint);

  if (isRight(validationResult)) {
    return validationResult.right;
  } else {
    if (depth + 1 === MAX_RECURSION_DEPTH) {
      throw new Error("Hit max recursion depth without valid solution");
    }
    return orchestrate(parsed, validationFailures, depth + 1);
  }
};
