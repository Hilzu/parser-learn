const keywords = new Set([
  "if",
  "then",
  "else",
  "lambda",
  "λ",
  "true",
  "false",
]);

const digitChars = new Set("0123456789".split(""));

const idStartChars = new Set(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_λ".split(""),
);

const idChars = new Set([
  ...idStartChars,
  ...digitChars,
  ..."?!-<>=".split(""),
]);

const opChars = new Set("+-*/%=&|<>!".split(""));

const puncChars = new Set(",;(){}[]".split(""));

const whitespaceChars = new Set(" \t\n".split(""));

export const isKeyword = (token: string) => keywords.has(token);

export const isDigit = (char: string) => digitChars.has(char);

export const isIdStart = (char: string) => idStartChars.has(char);

export const isId = (char: string) => idChars.has(char);

export const isOpChar = (char: string) => opChars.has(char);

export const isPunc = (char: string) => puncChars.has(char);

export const isWhitespace = (char: string) => whitespaceChars.has(char);
