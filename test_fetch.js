const http = require('http');
const jwt = require("jsonwebtoken");
const fs = require('fs');
require("dotenv").config();

const token = jwt.sign({ id: "123456789012345678901234", role: "professor" }, process.env.JWT_SECRET, { expiresIn: "1d" });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/courses/CS2201/students/search?q=ta',
  method: 'GET',
  headers: { 'Authorization': 'Bearer ' + token }
};

http.get(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    fs.writeFileSync('out.json', body);
    console.log("Done");
  });
});
