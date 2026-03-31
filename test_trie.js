const { spawn } = require('child_process');
const path = require('path');

const binaryPath = path.join(__dirname, "src/trie/trie_search.exe");
console.log("Binary Path:", binaryPath);

const args = ["ta", "tanish"];

const cpp = spawn(binaryPath, args);

let output = "";
let errOut = "";

cpp.stdout.on("data", (data) => output += data.toString());
cpp.stderr.on("data", (data) => errOut += data.toString());

cpp.on("close", (code) => {
  console.log("Exit Code:", code);
  console.log("Output (RAW):", JSON.stringify(output));
  console.log("Error (RAW):", JSON.stringify(errOut));
});

cpp.on("error", (err) => {
  console.error("Spawn error:", err);
});
