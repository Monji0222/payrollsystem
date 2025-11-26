require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO users 
      (employee_id, email, password_hash, first_name, last_name, role, 
       position, department, basic_salary, employment_status, date_hired)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (email) DO NOTHING`,
      [
        'EMP001',
        'admin@company.com',
        adminPassword,
        'System',
        'Administrator',
        'admin',
        'System Administrator',
        'IT',
        50000,
        'active',
        new Date()
      ]
    );
    console.log('✅ Admin user created');

    // Create HR user
    const hrPassword = await bcrypt.hash('hr123', 10);
    await pool.query(
      `INSERT INTO users 
      (employee_id, email, password_hash, first_name, last_name, role, 
       position, department, basic_salary, employment_status, date_hired)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (email) DO NOTHING`,
      [
        'EMP002',
        'hr@company.com',
        hrPassword,
        'Jane',
        'Smith',
        'hr',
        'HR Manager',
        'HR',
        45000,
        'active',
        new Date()
      ]
    );
    console.log('✅ HR user created');

    // Create sample employees
    const employeePassword = await bcrypt.hash('employee123', 10);
    const employees = [
      ['EMP003', 'john.doe@company.com', 'John', 'Doe', 'Software Engineer', 'IT', 40000],
      ['EMP004', 'jane.wilson@company.com', 'Jane', 'Wilson', 'Accountant', 'Finance', 35000],
      ['EMP005', 'mike.brown@company.com', 'Mike', 'Brown', 'Sales Manager', 'Sales', 38000]
    ];

    for (const emp of employees) {
  await pool.query(
    `INSERT INTO users 
    (employee_id, email, password_hash, first_name, last_name, role, 
     position, department, basic_salary, employment_status, date_hired)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (email) DO NOTHING`,
    [
      emp[0],              // employee_id
      emp[1],              // email
      employeePassword,    // password_hash
      emp[2],              // first_name
      emp[3],              // last_name
      'employee',          // role
      emp[4],              // position
      emp[5],              // department
      emp[6],              // basic_salary
      'active',            // employment_status
      new Date()           // date_hired
    ]
  );
}

    console.log('✅ Sample employees created');

    // Initialize leave credits for all users
    const year = new Date().getFullYear();
    const usersResult = await pool.query('SELECT id FROM users WHERE employment_status = $1', ['active']);
    const leaveTypesResult = await pool.query('SELECT id, max_days FROM leave_types');

    for (const user of usersResult.rows) {
      for (const leaveType of leaveTypesResult.rows) {
        await pool.query(
          `INSERT INTO leave_credits 
          (user_id, leave_type_id, total_credits, remaining_credits, year)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (user_id, leave_type_id, year) DO NOTHING`,
          [user.id, leaveType.id, leaveType.max_days, leaveType.max_days, year]
        );
      }
    }
    console.log('✅ Leave credits initialized');

    console.log('✨ Database seeding completed!');
    console.log('\n📝 Default credentials:');
    console.log('Admin: admin@company.com / admin123');
    console.log('HR: hr@company.com / hr123');
    console.log('Employee: john.doe@company.com / employee123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();