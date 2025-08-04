import { codegen } from "./codegen";
import { Constraint, Node } from "./types";
import { Either, right } from "fp-ts/Either";

export type ValidationFailure = {
  failedNode: Node;
  failedTest: string; // probably should be an enum when we figure out what the tests will be
};

export const validate = (
  constraint: Constraint
): Either<ValidationFailure[], string> => {
  const joined = codegen(constraint);
  /*
    Implementation
    - Should test the generated DSL code by
      - compiling the js/running the type checker
      - generating and running unit tests
      - running the solver and checking satisfiability
      - running LLMs to double-check the original run by cross-referencing the guidelines
    - Should identify and return the Nodes which fail any tests
  */
  return right(joined);
};
