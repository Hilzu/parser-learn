import { Op } from "./operator.js";

export enum TokenType {
  Number = "num",
  Keyword = "kw",
  Var = "var",
  String = "str",
  Punctuation = "punc",
  Operation = "op",
}

export interface BaseToken {
  type: TokenType;
}

export interface NumberToken extends BaseToken {
  type: TokenType.Number;
  value: number;
}

export interface KeywordToken extends BaseToken {
  type: TokenType.Keyword;
  value: string;
}

export interface VarToken extends BaseToken {
  type: TokenType.Var;
  value: string;
}

export interface StringToken extends BaseToken {
  type: TokenType.String;
  value: string;
}

export interface PunctuationToken extends BaseToken {
  type: TokenType.Punctuation;
  value: string;
}

export interface OperationToken extends BaseToken {
  type: TokenType.Operation;
  value: Op;
}

export type Token =
  | NumberToken
  | KeywordToken
  | VarToken
  | StringToken
  | PunctuationToken
  | OperationToken;
