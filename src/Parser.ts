import {
  BooleanNode,
  CallNode,
  IfNode,
  LambdaNode,
  Node,
  NodeType,
} from "./node-types.js";
import TokenStream from "./TokenStream.js";
import {
  KeywordToken,
  OperationToken,
  PunctuationToken,
  Token,
  TokenType,
} from "./token-types.js";
import { Op, precedence } from "./operator.js";

const FalseNode: BooleanNode = {
  type: NodeType.Boolean,
  value: false,
} as const;

export default class Parser {
  readonly #input: TokenStream;

  constructor(input: TokenStream) {
    this.#input = input;
  }

  #isPunc(char: string): PunctuationToken | null {
    const token = this.#input.peek();
    return token?.type === TokenType.Punctuation && token.value === char
      ? token
      : null;
  }

  #isKw(kw: string): KeywordToken | null {
    const token = this.#input.peek();
    return token?.type === TokenType.Keyword && token.value === kw
      ? token
      : null;
  }

  #isOp(op?: string): OperationToken | null {
    const token = this.#input.peek();
    return token?.type === TokenType.Operation && (!op || token.value === op)
      ? token
      : null;
  }

  #skipPunc(char: string): void {
    if (this.#isPunc(char)) this.#input.next();
    else this.#input.croak(`Expecting punctuation: "${char}"`);
  }

  #skipKw(kw: string): void {
    if (this.#isKw(kw)) this.#input.next();
    else this.#input.croak(`Expecting keyword: "${kw}"`);
  }

  #skipOp(op: string): void {
    if (this.#isOp(op)) this.#input.next();
    else this.#input.croak(`Expecting operator: "${op}"`);
  }

  #unexpected(): never {
    this.#input.croak(
      `Unexpected token: ${JSON.stringify(this.#input.peek())}`,
    );
  }

  #delimited<T>(
    start: string,
    stop: string,
    separator: string,
    parser: () => T,
  ): T[] {
    const a = [];
    let first = true;
    this.#skipPunc(start);
    while (!this.#input.eof()) {
      if (this.#isPunc(stop)) break;
      if (first) first = false;
      else this.#skipPunc(separator);
      if (this.#isPunc(stop)) break;
      a.push(parser());
    }
    this.#skipPunc(stop);
    return a;
  }

  #parseBool(): BooleanNode {
    return {
      type: NodeType.Boolean,
      value: this.#input.next()?.value === "true",
    };
  }

  #parseVarName = (): string => {
    const token = this.#input.next();
    if (token?.type === TokenType.Var) return token.value;
    this.#input.croak("Expecting variable name");
  };

  #parseLambda(): LambdaNode {
    return {
      type: NodeType.Lambda,
      vars: this.#delimited("(", ")", ",", this.#parseVarName),
      body: this.#parseExpression(),
    };
  }

  #parseIf(): IfNode {
    this.#skipKw("if");
    const cond = this.#parseExpression();
    if (!this.#isPunc("{")) this.#skipKw("then");
    const then = this.#parseExpression();
    const node: IfNode = { type: NodeType.If, cond, then };
    if (this.#isKw("else")) {
      this.#input.next();
      node.else = this.#parseExpression();
    }
    return node;
  }

  #parseCall(node: Node): CallNode {
    return {
      type: NodeType.Call,
      func: node,
      args: this.#delimited("(", ")", ",", this.#parseExpression),
    };
  }

  #maybeCall(parse: () => Node): Node {
    const node = parse();
    if (this.#isPunc("(")) return this.#parseCall(node);
    return node;
  }

  #maybeBinary(left: Node, leftPrecedence: number): Node {
    const token = this.#isOp();
    if (!token) return left;
    const rightPrecedence = precedence[token.value];
    if (leftPrecedence >= rightPrecedence) return left;

    this.#input.next();
    const right = this.#maybeBinary(this.#parseAtom(), rightPrecedence);

    const binary: Node =
      token.value === Op.Assign
        ? { type: NodeType.Assign, operator: Op.Assign, left, right }
        : { type: NodeType.Binary, operator: token.value, left, right };
    return this.#maybeBinary(binary, leftPrecedence);
  }

  #parseProg(): Node {
    const prog = this.#delimited("{", "}", ";", this.#parseExpression);
    if (prog.length === 0) return FalseNode;
    if (prog.length === 1) return prog[0];
    return { type: NodeType.Prog, prog };
  }

  #parseAtomInner = (): Node => {
    if (this.#isPunc("(")) {
      this.#input.next();
      const exp = this.#parseExpression();
      this.#skipPunc(")");
      return exp;
    }
    if (this.#isPunc("{")) return this.#parseProg();
    if (this.#isKw("if")) return this.#parseIf();
    if (this.#isKw("true") || this.#isKw("false")) return this.#parseBool();
    if (this.#isKw("lambda") || this.#isKw("λ")) {
      this.#input.next();
      return this.#parseLambda();
    }
    const token = this.#input.next() as Token;
    switch (token.type) {
      case TokenType.Var:
        return { type: NodeType.Var, value: token.value };
      case TokenType.Number:
        return { type: NodeType.Number, value: token.value };
      case TokenType.String:
        return { type: NodeType.String, value: token.value };
      default:
        this.#unexpected();
    }
  };

  #parseAtom(): Node {
    return this.#maybeCall(this.#parseAtomInner);
  }

  #parseExpressionInner = (): Node => this.#maybeBinary(this.#parseAtom(), 0);

  #parseExpression = (): Node => this.#maybeCall(this.#parseExpressionInner);

  parse() {
    const prog = [];
    while (!this.#input.eof()) {
      prog.push(this.#parseExpression());
      if (!this.#input.eof()) this.#skipPunc(";");
    }
    return { type: NodeType.Prog, prog };
  }
}
