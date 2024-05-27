const db = require('./db/connection.js');
const mysql = require('mysql2');

async function init() {
	const { default: inquirer } = await import('inquirer');
	const { choices } = await inquirer.prompt({
		type: 'list',
		name: 'choices',
		message: 'Please, choose an option:',
		choices: [
			'View All Departments',
			'View All Roles',
			'View All Employees',
			'Add a Department',
			'Add a Role',
			'Add an Employee',
			'Update an Employee Role',
			'Quit',
		],
	});

	const actions = {
		'View All Departments': viewAllDepartments,
		'View All Roles': viewAllRoles,
		'View All Employees': viewAllEmployees,
		'Add a Department': addDepartment,
		'Add a Role': addRole,
		'Add an Employee': addEmployee,
		'Update an Employee Role': updateEmployeeRole,
		Quit: quit,
	};

	await actions[choices]();
}

function viewAllDepartments() {
	db.query(
		"SELECT id as 'Department ID', name as 'Department Name' FROM department;",
		(err, results) => {
			if (err) throw err;
			console.table(results);
			init();
		}
	);
}

function viewAllRoles() {
	const query = `
    SELECT role.id as 'Role ID', role.title as 'Role Title', role.salary as 'Role Salary', 
           department.name as 'Department Name'
    FROM role
    LEFT JOIN department ON role.department_id = department.id;
  `;
	db.query(query, (err, results) => {
		if (err) throw err;
		console.table(results);
		init();
	});
}

function viewAllEmployees() {
	const query = `
    SELECT employee.id as 'Employee ID', CONCAT(employee.first_name, ' ', employee.last_name) as 'Employee Name',
           CONCAT(IFNULL(manager.first_name, 'NO MANAGER ASSIGNED'), ' ', IFNULL(manager.last_name, '')) as 'Manager',
           role.title as 'Role', department.name as 'Department', role.salary as 'Salary'
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id;
  `;
	db.query(query, (err, results) => {
		if (err) throw err;
		console.table(results);
		init();
	});
}

async function addDepartment() {
	const { default: inquirer } = await import('inquirer');
	const { departmentName } = await inquirer.prompt({
		type: 'input',
		name: 'departmentName',
		message: 'Enter a department name:',
	});

	db.query(
		'INSERT INTO department (name) VALUES (?);',
		[departmentName],
		(err) => {
			if (err) throw err;
			viewAllDepartments();
		}
	);
}

async function addRole() {
	const { default: inquirer } = await import('inquirer');
	db.query('SELECT * FROM department;', async (err, results) => {
		if (err) throw err;

		const { roleName, roleSalary, departmentName } = await inquirer.prompt([
			{ type: 'input', name: 'roleName', message: 'Enter a role to be added:' },
			{
				type: 'input',
				name: 'roleSalary',
				message: 'Enter the salary for the role:',
			},
			{
				type: 'list',
				name: 'departmentName',
				message: 'Select department for this role:',
				choices: results.map((dept) => dept.name),
			},
		]);

		const { id: departmentId } = results.find(
			(dept) => dept.name === departmentName
		);
		db.query(
			'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?);',
			[roleName, roleSalary, departmentId],
			(err) => {
				if (err) throw err;
				viewAllRoles();
			}
		);
	});
}

async function addEmployee() {
	const { default: inquirer } = await import('inquirer');
	db.query('SELECT id, title FROM role;', (err, roleResults) => {
		if (err) throw err;
		const roles = roleResults.map((role) => ({
			name: role.title,
			value: role.id,
		}));

		db.query(
			"SELECT id, CONCAT(first_name, ' ', last_name) as EmployeeName FROM employee;",
			async (err, employeeResults) => {
				if (err) throw err;
				const managers = employeeResults.map((manager) => ({
					name: manager.EmployeeName,
					value: manager.id,
				}));

				const { firstName, lastName, roleId, managerId } =
					await inquirer.prompt([
						{
							type: 'input',
							name: 'firstName',
							message: 'Enter employee first name to be added:',
						},
						{
							type: 'input',
							name: 'lastName',
							message: 'Enter employee last name to be added:',
						},
						{
							type: 'list',
							name: 'roleId',
							message: 'Choose a role:',
							choices: roles,
						},
						{
							type: 'list',
							name: 'managerId',
							message: 'Choose a manager:',
							choices: managers,
						},
					]);

				db.query(
					'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);',
					[firstName, lastName, roleId, managerId],
					(err) => {
						if (err) throw err;
						viewAllEmployees();
					}
				);
			}
		);
	});
}

async function updateEmployeeRole() {
	const { default: inquirer } = await import('inquirer');
	db.query(
		`
    SELECT employee.id, CONCAT(employee.first_name, ' ', employee.last_name) as EmployeeName, role.title
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id;
  `,
		(err, employeeResults) => {
			if (err) throw err;

			db.query('SELECT id, title FROM role;', async (err, roleResults) => {
				if (err) throw err;

				const { employeeName, roleTitle } = await inquirer.prompt([
					{
						type: 'list',
						name: 'employeeName',
						message: 'Select an employee to update:',
						choices: employeeResults.map((emp) => emp.EmployeeName),
					},
					{
						type: 'list',
						name: 'roleTitle',
						message: 'Select the new role you want to assign to the employee:',
						choices: roleResults.map((role) => role.title),
					},
				]);

				const { id: employeeId } = employeeResults.find(
					(emp) => emp.EmployeeName === employeeName
				);
				const { id: roleId } = roleResults.find(
					(role) => role.title === roleTitle
				);
				db.query(
					'UPDATE employee SET role_id = ? WHERE id = ?;',
					[roleId, employeeId],
					(err) => {
						if (err) throw err;
						viewAllEmployees();
					}
				);
			});
		}
	);
}

function quit() {
	db.end();
	console.info('Bye');
}

init();
