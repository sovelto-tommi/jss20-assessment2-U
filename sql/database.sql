SELECT 'CREATE DATABASE assessment2u'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'assessment2u')\gexec
\c assessment2u
SELECT 'CREATE DATABASE a2utest'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'a2utest')\gexec
