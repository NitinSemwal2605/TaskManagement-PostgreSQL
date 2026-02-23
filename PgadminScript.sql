-- User Table 
CREATE TABLE Users(
	id SERIAL PRIMARY KEY , 
	username VARCHAR(100) UNIQUE NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	password TEXT NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Table
CREATE TABLE Projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    owner_id INT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_owner
        FOREIGN KEY (owner_id)
        REFERENCES Users(id)
        ON DELETE CASCADE
);


-- Tasks Table 
CREATE TABLE Tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(20)
        CHECK (status IN ('pending', 'in-progress', 'completed'))
        DEFAULT 'pending',
    project_id INT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_project
        FOREIGN KEY (project_id)
        REFERENCES Projects(id)
        ON DELETE CASCADE
);

-- Indexes Creations 
CREATE INDEX idx_projects_owner
ON Projects(owner_id);

CREATE INDEX idx_tasks_project
ON Tasks(project_id);

CREATE INDEX idx_tasks_status
ON Tasks(status);


-- Data Insetions 

INSERT INTO Users (username, email, password)
VALUES
('nitin', 'nitin@mail.com', 'hashed_password_1'),
('vipin', 'vipin@mail.com', 'hashed_password_2');

INSERT INTO Projects (title, description, owner_id)
VALUES
('MedTech SaaS', 'Healthcare product', 1),
('EdTech SaaS', 'Education product', 2),
('AI Research', 'AI-based solution', 1);

INSERT INTO Tasks (title, description, project_id, status)
VALUES
('Build MVP', 'Initial development', 1, 'pending'),
('Fix Auth', 'Bug fixing', 1, 'in-progress'),
('Design UI', 'Frontend work', 2, 'completed'),
('Train Model', 'ML training', 3, 'pending');

SELECT* FROM Tasks;
SELECT * FROM Users;

ALTER TABLE Users ADD RefreshToken Text ;
SELECT * FROM Projects;
ALTER TABLE Projects ADD location POINT;

-- Testing (Get All Projects of User 1)
SELECT * FROM Projects WHERE owner_id = 1;

-- Testing (Get All Tasks of Project 1)
SELECT * FROM Tasks WHERE Project_id = 7;

-- Testing (Get Projects With Task Count)
SELECT P.id , P.title, COUNT(t.id) As TaskCounts 
FROM Projects P
LEFT JOIN Tasks t
ON P.id = t.project_id
GROUP BY P.id;


-- Testing (Get Completed Tasks Per Project)
SELECT P.title, COUNT(T.id) as CompletedTasks
FROM Projects P
INNER JOIN Tasks T
ON P.id = T.project_id 
WHERE T.status = 'completed'
GROUP BY P.title

-- Testing (Get User → Project → Task Hierarchy)
SELECT U.username,P.title AS project, T.title AS task
FROM Users U
INNER JOIN Projects P ON U.id = P.owner_id
INNER JOIN Tasks T ON P.id = T.project_id
ORDER BY U.username;

-- Soft Delete Test
UPDATE Projects SET is_deleted = TRUE WHERE id = 1;
