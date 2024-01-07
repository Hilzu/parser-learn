#!/usr/bin/env node

import { Bench } from "tinybench";

const data =
  "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-_#*+~".split(
    "",
  );
const dataSet = new Set("abcdefghijklmnopqrstuvwxyz_".split(""));

// const bench = new Bench();
// bench
//   .add("indexOf", () => {
//     data.forEach((c) => "abcdefghijklmnopqrstuvwxyz_".indexOf(c) >= 0);
//   })
//   .add("includes", () => {
//     data.forEach((c) => "abcdefghijklmnopqrstuvwxyz_".includes(c));
//   })
//   .add("Set", () => {
//     data.forEach((c) => dataSet.has(c));
//   })
//   .add("RegExp", () => {
//     data.forEach((c) => /[a-z_]/.test(c));
//   });

// const isDigit = (char: string) => "0" <= char && char <= "9";
const numbersString = "0123456789";
const numbersArray = numbersString.split("");
const numberSet = new Set(numbersArray);
const bench = new Bench();
bench
  .add("comparison", () => {
    data.forEach((c) => "0" <= c && c <= "9");
  })
  .add("RegExp", () => {
    data.forEach((c) => /[0-9]/.test(c));
  })
  .add("Set", () => {
    data.forEach((c) => numberSet.has(c));
  })
  .add("includesS", () => {
    data.forEach((c) => numbersString.includes(c));
  })
  .add("includesA", () => {
    data.forEach((c) => numbersArray.includes(c));
  });

await bench.run();
console.table(bench.table());
