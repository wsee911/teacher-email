const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const {registerStudents, commonStudents, retrieveNotifications} = require('./mainFn');
const {createTeacher} = require('./teacherFn');
const {createStudent, suspendStudent} = require('./studentFn');

app.use(bodyParser.json());

app.post(`/api/create-teacher`, createTeacher);

app.post(`/api/create-student`, createStudent);

app.post(`/api/register`, registerStudents);

app.get(`/api/commonstudents`, commonStudents);

app.post(`/api/suspend`, suspendStudent);

app.post(`/api/retrievefornotifications`, retrieveNotifications);

app.listen(3000);
console.log('Server running at http://127.0.0.1:3000');