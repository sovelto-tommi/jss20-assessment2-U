CREATE TABLE IF NOT EXISTS quizscore (
    id SERIAL PRIMARY KEY,
    student VARCHAR(128) NOT NULL,
    checkup_time TIMESTAMP DEFAULT now(),
    quiz_name VARCHAR(128),
    quiz_number INTEGER NOT NULL,
    question INTEGER,
    answered BOOLEAN,
    points FLOAT
);
