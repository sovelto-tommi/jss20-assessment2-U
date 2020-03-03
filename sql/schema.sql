CREATE TABLE IF NOT EXISTS quizscore (
    id SERIAL PRIMARY KEY,
    student varchar(128),
    checkup_time TIMESTAMP DEFAULT now(),
    quiz_name VARCHAR(128),
    quiz_number INTEGER,
    question INTEGER,
    answered BOOLEAN,
    points float
);
