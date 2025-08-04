import { Node, NodeRegistry, NodeTypename, TaskConstraint } from "./types";
import { ValidationFailure } from "./validate";

type PossibleNodeTypes<T> = T extends readonly [infer First, ...infer Rest]
  ? First extends NodeTypename
    ? NodeRegistry[First] | PossibleNodeTypes<Rest>
    : never
  : never;

export const generate = <T extends readonly NodeTypename[]>(
  _rawText: string,
  possibleTypes: T,
  _validationFailures: ValidationFailure[]
): PossibleNodeTypes<T> => {
  /*

  Implementation
  - Call out to bedrock and ask what among possibleTypes best describes rawText in its entirety
  - If it's a type that requires children e.g. allOf, then ask it to split the text and recurse on the splits

  */

  const output = {
    typename: "TaskConstraint",
    sourceLink: {
      begin: 0,
      end: 12,
    },
    path: "$.foo",
  } as const satisfies TaskConstraint;

  if (!IsValidType(output, possibleTypes)) {
    throw Error("Bad output type");
  }

  return output;
};

const IsValidType = <T extends readonly NodeTypename[]>(
  node: Node,
  possibleTypes: T
): node is PossibleNodeTypes<T> => possibleTypes.includes(node.typename);
