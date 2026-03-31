const { spawn } = require('child_process');
const path = require('path');

const binaryPath = path.join(__dirname, "src/trie/trie_search.exe");
const args = ["ta", "tanish"];

const cpp = spawn(binaryPath, args);

let out = "";
let errOut = "";

cpp.stdout.on("data", d => out += d);
cpp.stderr.on("data", d => errOut += d);

cpp.on("close", code => {
  console.log("CODE:", code);
  console.log("OUT:", JSON.stringify(out));
  console.log("ERR:", JSON.stringify(errOut));
});
