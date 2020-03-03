const express = require('express');
const path = require('path');
const logger = require('morgan');

const quizRouter = require('./routes/quiz');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/quiz', quizRouter);

module.exports = app;
