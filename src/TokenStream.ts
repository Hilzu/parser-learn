import InputStream from "./InputStream.js";
import {
  isDigit,
  isId,
  isIdStart,
  isKeyword,
  isOpChar,
  isPunc,
  isWhitespace,
} from "./token-helpers.js";
import {
  VarToken,
  KeywordToken,
  NumberToken,
  StringToken,
  Token,
  TokenType,
} from "./token-types.js";
import { Op } from "./operator.js";

export default class TokenStream {
  #current: Token | null = null;
  readonly #input: InputStream;

  constructor(input: InputStream) {
    this.#input = input;
  }

  #readWhile(predicate: (char: string) => boolean): string {
    let str = "";
    while (!this.#input.eof() && predicate(this.#input.peek()))
      str += this.#input.next();
    return str;
  }

  #readNumber(): NumberToken {
    let hasDot = false;
    const number = this.#readWhile((char) => {
      if (char === ".") {
        if (hasDot) return false;
        hasDot = true;
        return true;
      }
      return isDigit(char);
    });
    return { type: TokenType.Number, value: parseFloat(number) };
  }

  #readIdentifier(): KeywordToken | VarToken {
    const id = this.#readWhile(isId);
    return {
      type: isKeyword(id) ? TokenType.Keyword : TokenType.Var,
      value: id,
    };
  }

  #readEscaped(end: string): string {
    let escaped = false;
    let str = "";
    this.#input.next();
    while (!this.#input.eof()) {
      const char = this.#input.next();
      if (escaped) {
        str += char;
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === end) {
        break;
      } else {
        str += char;
      }
    }
    return str;
  }

  #readString(): StringToken {
    return { type: TokenType.String, value: this.#readEscaped('"') };
  }

  #skipComment(): void {
    this.#readWhile((char) => char !== "\n");
    this.#input.next();
  }

  #readNext(): Token | null {
    this.#readWhile(isWhitespace);
    if (this.#input.eof()) return null;
    const char = this.#input.peek();
    if (char === "#") {
      this.#skipComment();
      return this.#readNext();
    }
    if (char === '"') return this.#readString();
    if (isDigit(char)) return this.#readNumber();
    if (isIdStart(char)) return this.#readIdentifier();
    if (isPunc(char))
      return { type: TokenType.Punctuation, value: this.#input.next() };
    if (isOpChar(char))
      return {
        type: TokenType.Operation,
        value: this.#readWhile(isOpChar) as Op,
      };
    this.#input.croak(`Can't handle character: ${char}`);
  }

  peek(): Token | null {
    return this.#current ?? (this.#current = this.#readNext());
  }

  next(): Token | null {
    const token = this.#current;
    this.#current = null;
    return token ?? this.#readNext();
  }

  eof(): boolean {
    return this.peek() === null;
  }

  croak(msg: string): never {
    this.#input.croak(msg);
  }

  *[Symbol.iterator]() {
    while (!this.eof()) yield this.next();
  }
}
