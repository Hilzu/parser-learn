// https://tiarkrompf.github.io/notes/?/just-write-the-parser
import assert from "node:assert";

// const parse = (input: string) => {
//   const plusTerms = input.split("+").map((plusTerm) => {
//     const productTerms = plusTerm.split("*").map((factor) => parseInt(factor));
//     return productTerms.length === 1 ? productTerms[0] : ["*", ...productTerms];
//   });
//   return plusTerms.length === 1 ? plusTerms[0] : ["+", ...plusTerms];
// };

const isDigit = (s: string) => "0" <= s && s <= "9";

const isDelimiter = (s: string) => ["\n", "*", "+", ")"].includes(s);

const operators: Record<
  string,
  {
    eval: (a: number, b: number) => number;
    precedence: number;
    associativity: 1 | 0;
  }
> = {
  "+": {
    eval: (a: number, b: number) => a + b,
    precedence: 100,
    associativity: 1,
  },
  "*": {
    eval: (a: number, b: number) => a * b,
    precedence: 200,
    associativity: 1,
  },
  "-": {
    eval: (a: number, b: number) => a - b,
    precedence: 100,
    associativity: 1,
  },
  "/": {
    eval: (a: number, b: number) => a / b,
    precedence: 200,
    associativity: 1,
  },
};

class Parser {
  readonly #input: string;
  #pos = 0;
  #peek = "";
  #indent = 0;

  static parse(input: string) {
    const parser = new Parser(input);
    const res = parser.#expression(0);
    assert(!parser.#peek, `unexpected input: ${parser.#peek}`);
    return res;
  }

  constructor(input: string) {
    this.#input = input;
    this.#indent = this.#whitespace();
    this.#read();
  }

  #whitespace() {
    const start = this.#pos;
    while (this.#input[this.#pos] === " ") this.#pos++;
    return this.#pos - start;
  }

  #read() {
    this.#whitespace();
    if (this.#input[this.#pos] === "/" && this.#input[this.#pos + 1] === "/") {
      while (this.#input[this.#pos] !== "\n") this.#pos++;
      this.#pos++;
    }
    this.#peek = this.#input[this.#pos++];
    if (this.#peek === "\n") {
      this.#indent = this.#whitespace();
    }
  }

  #next() {
    const c = this.#peek;
    this.#read();
    return c;
  }

  #error(msg: string) {
    const pos = this.#pos - 1;
    while (this.#peek && !isDelimiter(this.#peek)) this.#next();
    throw new Error(`${msg} at ${pos}: ${this.#input.slice(pos, this.#pos)}`);
  }

  #expect(c: string) {
    if (this.#peek !== c) this.#error(`expected ${c}, got ${this.#peek}`);
    this.#next();
  }

  #factor() {
    if (this.#peek === "(") {
      this.#next();
      const n = this.#expression(this.#indent);
      this.#expect(")");
      return n;
    } else {
      return this.#number();
    }
  }

  #binop(min: number): number {
    let res = this.#factor();
    while (this.#peek in operators && operators[this.#peek].precedence >= min) {
      const op = operators[this.#next()];
      const n = this.#binop(op.precedence + op.associativity);
      res = op.eval(res, n);
    }
    return res;
  }

  #number() {
    assert(isDigit(this.#peek), `expected digit, got ${this.#peek}`);
    let n = Number(this.#next());
    while (isDigit(this.#peek)) n = 10 * n + Number(this.#next());
    return n;
  }

  #expression(indent: number) {
    return this.#binop(0);
  }
}

const test = (input: string) => {
  return [input, eval(input), Parser.parse(input)].join("\t");
};

console.log("input\t\teval\tparse");
[
  "2 * 6 + 4*5",
  "2 * 6 * 4 * 5",
  "2+6 *4 *5",
  "1 + 2       ",
  "2 * 3       ",
  "2 * (6+4)*5 // heh heh\n*10",
  `3*(
 1+4*
  2
+2)`,
  "2 * 4 * 5.3",
].forEach((input) => {
  console.log(test(input));
});
