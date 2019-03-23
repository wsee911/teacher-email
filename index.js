const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const {registerStudents, commonStudents} = require('./mainFn');

app.use(bodyParser.json());

app.post(`/api/register`, registerStudents);

app.get(`/api/commonstudents`, commonStudents);

app.listen(3000);

// http.createServer(api).listen(3000, "127.0.0.1");
console.log('Server running at http://127.0.0.1:3000');