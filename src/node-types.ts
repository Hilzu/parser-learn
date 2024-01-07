import { Op } from "./operator.js";

export enum NodeType {
  Number = "num",
  String = "str",
  Boolean = "bool",
  Var = "var",
  Lambda = "lambda",
  Call = "call",
  If = "if",
  Assign = "assign",
  Binary = "binary",
  Prog = "prog",
}

export interface BaseNode {
  type: NodeType;
}

export interface NumberNode extends BaseNode {
  type: NodeType.Number;
  value: number;
}

export interface StringNode extends BaseNode {
  type: NodeType.String;
  value: string;
}

export interface BooleanNode extends BaseNode {
  type: NodeType.Boolean;
  value: boolean;
}

export interface VarNode extends BaseNode {
  type: NodeType.Var;
  value: string;
}

export interface LambdaNode extends BaseNode {
  type: NodeType.Lambda;
  vars: string[];
  body: Node;
}

export interface CallNode extends BaseNode {
  type: NodeType.Call;
  func: Node;
  args: Node[];
}

export interface IfNode extends BaseNode {
  type: NodeType.If;
  cond: Node;
  then: Node;
  else?: Node;
}

export interface AssignNode extends BaseNode {
  type: NodeType.Assign;
  operator: Op.Assign;
  left: Node;
  right: Node;
}

export interface BinaryNode extends BaseNode {
  type: NodeType.Binary;
  operator: Op;
  left: Node;
  right: Node;
}

export interface ProgNode extends BaseNode {
  type: NodeType.Prog;
  prog: Node[];
}

export type Node =
  | NumberNode
  | StringNode
  | BooleanNode
  | VarNode
  | LambdaNode
  | CallNode
  | IfNode
  | AssignNode
  | BinaryNode
  | ProgNode;
