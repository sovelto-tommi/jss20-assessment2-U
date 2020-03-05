const request = require('supertest')
const app = require('../../app')
const db = require('../../data/quizdao')
const url = require('url');

const baseurl = '/api/quiz'
const samples = [
  {
    student: 'Tara',
    checkup_time: null,
    quiz_name: 'Alkutesti',
    quiz_number: 2,
    question: 1,
    answered: true,
    points: 1
  },
  {
    student: 'Tara',
    checkup_time: null,
    quiz_name: 'Alkutesti',
    quiz_number: 2,
    question: 1,
    answered: true,
    points: 1
  }
]

beforeAll(async () => {
    samples[0].id = (await db.saveQuizAnswer(samples[0])).id
    samples[1].id = (await db.saveQuizAnswer(samples[1])).id
})
afterAll(async done => {
  const deleted = await db.deleteAllAndClosePool()
  done()
})

describe('GET tests', () => {
  test("It's alive", () => {
    return request(app)
      .get(baseurl)
      .then(response => {
        expect(response.statusCode).toBe(200)
        expect(response.body.length).toBeGreaterThanOrEqual(2)
      })
  })
  test('a single answer can be fetched', () => {
    return request(app)
      .get(`${baseurl}/${samples[0].id}`)
      .then(response => {
        expect(response.statusCode).toBe(200)
        expect(response.body.student).toEqual(samples[0].student)
      })
  })

  test('a single quizscore with incorrect id will return 404', () => {
    return request(app)
      .get(`${baseurl}/0`)
      .then(response => {
        expect(response.statusCode).toBe(404)
      })
  })
})

describe('Posting and putting', () => {
  test('we can add a new answer', () => {
    const answerToAdd = {
        student: 'Sandra',
        checkup_time: '2020-01-13T09:57:00.000Z',
        quiz_name: 'Lopputesti',
        quiz_number: 999,
        question: 1,
        answered: true,
        points: 1
        }
    return request(app)
      .post(baseurl)
      .send(answerToAdd)
      .expect(201)
      .expect('location', /api\/quiz\/\d+$/)
      .then(res => {
        const newresloc = res.header['location'] || res.header['Location'];
        const localpath = url.parse(newresloc).pathname;
        return request(app)
          .get(localpath)
          .then(response => {
            expect(response.statusCode).toBe(200)
            expect(response.body.quiz_number).toBe(answerToAdd.quiz_number)
            expect(new Date(response.body.checkup_time)).toEqual(new Date(answerToAdd.checkup_time))
          })
      })
  })
  test('adding an answer with missing data returns a 400', () => {
    const answerToAdd = {
        // student: 'Sandra',
        checkup_time: '2020-01-13T09:57:00.000Z',
        quiz_name: 'Lopputesti',
        quiz_number: 999,
        question: 1,
        answered: true,
        points: 1
        }
    return request(app)
      .post(baseurl)
      .send(answerToAdd)
      .expect(400)
  })
  test('modification works fine', () => {
    const newdata = {
        student: 'Modified',
        quiz_name: 'Lopputesti',
        quiz_number: 999,
        question: 1,
        answered: true,
        points: 1
        }
    const path = `${baseurl}/${samples[1].id}`;
    return request(app)
        .put(path)
        .send(newdata)
        .expect(204)
        .then(async () => {
            return db.getOneAnswer(samples[1].id)
            .then(res => {
              expect(res.student).toEqual(newdata.student);
               expect(res.id).toBe(samples[1].id);
            })
        });      
  })
  test('trying to modify a missing answer return 404', () => {
    const newdata = {
        student: 'Modified',
        quiz_name: 'Lopputesti',
        quiz_number: 999,
        question: 1,
        answered: true,
        points: 1
        }
    const path = `${baseurl}/0`;
    return request(app)
        .put(path)
        .send(newdata)
        .expect(404)
  })
})
