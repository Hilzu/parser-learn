const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

export default class InputStream {
  line = 1;
  col = 0;
  #peek = "";
  readonly iterator;

  constructor(input: string) {
    this.iterator = segmenter.segment(input)[Symbol.iterator]();
    this.next();
    this.col = 0;
  }

  next() {
    const char = this.#peek;
    const next = this.iterator.next();
    this.#peek = next.done ? "" : next.value.segment;
    if (char === "\n") {
      this.line++;
      this.col = 0;
    } else {
      this.col++;
    }
    return char;
  }

  peek() {
    return this.#peek;
  }

  eof() {
    return this.#peek === "";
  }

  croak(msg: string): never {
    throw new Error(`${msg} (${this.line}:${this.col})`);
  }

  *[Symbol.iterator]() {
    while (!this.eof()) yield this.next();
  }
}

// const s = new InputStream("hello\nworld\n  asdf\n🇯🇵👉🏿👨‍👦");
// console.log(s);
// for (const c of s) console.log(`${s.line}:${s.col}`, JSON.stringify(c));
