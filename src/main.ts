import { promises as fs } from "node:fs";
import InputStream from "./InputStream.js";
import TokenStream from "./TokenStream.js";
import Parser from "./Parser.js";
import { inspect } from "node:util";

const program = await fs.readFile("src/hello.hlang", "utf-8");

const input = new InputStream(program);
const token = new TokenStream(input);
const prog = new Parser(token).parse();
console.log(inspect(prog, { depth: null, colors: true }));
