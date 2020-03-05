const Pool = require('pg').Pool;
const debug = require('debug')('a2u-vastaus:pgdao');
const config = require('../config/config')

const pool = new Pool(config.db);

process.on('exit', () => {
	debug("\n\n*** Ending pool when exiting");
	pool.end();
});

function getAllQuizAnswers() {
    return pool.query('SELECT * FROM quizscore')
        .then(res => res.rows)
        .catch(err => {
            debug('Error with selecting all quizscores', err)
            throw err
          })
}

function getOneAnswer(id) {
  return pool.query('SELECT * FROM quizscore WHERE id=$1', [id])
  .then(res => {
    if (res.rowCount === 1) {
      return res.rows[0]
    }
    return null;
  })
}

function saveQuizAnswer(answer) {
    const params = [answer.student, answer.checkup_time, answer.quiz_name, answer.quiz_number, answer.question, answer.answered, answer.points]
    return pool.connect().then(client => {
      return client.query('INSERT INTO quizscore(student, checkup_time, quiz_name, quiz_number, question, answered, points) VALUES($1, COALESCE($2, now()), $3, $4, $5, $6, $7) RETURNING *',params)
      .then(res => {
        client.end();
        return res.rows[0]
      })
      .catch(err => {
        client.end();
        debug(`Error: ${err.message}\n${err.stack}`);
        throw err;
      })
    })
  }
  
function deleteAnswer(id) {
  return pool.connect().then(client => {
    return client.query('DELETE FROM quizscore WHERE id=$1',[id])
    .then(res => {
      client.end();
      return res.rowCount;
    })
    .catch(err => {
      client.end();
      debug(`Error: ${err.message}\n${err.stack}`);
      throw err;
    })
  })
}

function updateAnswer(id, answer) {
  const params = [id, answer.student, answer.checkup_time||null, answer.quiz_name, answer.quiz_number, answer.question, answer.answered, answer.points]
  return pool.connect().then(client => {
    return client.query('UPDATE quizscore SET student=$2, checkup_time=COALESCE($3, now()), quiz_name=$4, quiz_number=$5, question=$6, answered=$7, points=$8 WHERE id=$1', params)
    .then(res => {client.end(); return res.rowCount})
    .catch(err => {
      client.end();
      debug(`Error: ${err.message}\n${err.stack}`);
      throw err;
    })
  })

}

// For tests: both delets everything from the test db
// and ends the pool, otherwise Jest complains about
// open handles
function deleteAllAndClosePool() {
  return pool.query('DELETE FROM quizscore')
      .then(res => res.rowCount)
      .catch(err => {
          debug('Error with selecting all quizscores', err)
          throw err
        })
      .finally(() => {
        pool.end();
      })
}


if (process.env.NODE_ENV === 'test'){
module.exports = {getAllQuizAnswers, getOneAnswer, saveQuizAnswer, deleteAnswer, updateAnswer, deleteAllAndClosePool}
}else
module.exports = {getAllQuizAnswers, getOneAnswer, saveQuizAnswer, deleteAnswer, updateAnswer}