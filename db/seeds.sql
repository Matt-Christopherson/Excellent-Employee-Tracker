-- Drop existing tables if they exist
DROP TABLE IF EXISTS employee;
DROP TABLE IF EXISTS role;
DROP TABLE IF EXISTS department;

-- Create the tables
CREATE TABLE department (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE employee (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role_id INT,
    manager_id INT,
    FOREIGN KEY (role_id) REFERENCES role(id),
    FOREIGN KEY (manager_id) REFERENCES employee(id)
);

-- Seed data for department
INSERT INTO department (name) VALUES 
('Engineering'),
('Finance'),
('Human Resources'),
('Marketing'),
('Sales');

-- Seed data for role
INSERT INTO role (title, salary, department_id) VALUES 
('Software Engineer', 80000, 1),
('Senior Software Engineer', 100000, 1),
('Accountant', 70000, 2),
('HR Manager', 90000, 3),
('Marketing Specialist', 60000, 4),
('Sales Manager', 85000, 5);

-- Seed data for employee
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES 
('John', 'Doe', 1, NULL),
('Jane', 'Smith', 2, 1),
('Robert', 'Brown', 3, NULL),
('Emily', 'Davis', 4, NULL),
('Michael', 'Wilson', 5, NULL),
('Sarah', 'Taylor', 6, NULL),
('David', 'Johnson', 1, 2),
('Laura', 'White', 5, 6);

-- View the seeded data
SELECT * FROM department;
SELECT * FROM role;
SELECT * FROM employee;
