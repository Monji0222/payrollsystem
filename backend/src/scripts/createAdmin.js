require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/config/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createAdmin = async () => {
  try {
    console.log('🔧 Admin User Creation Tool\n');

    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    const firstName = await question('Enter first name: ');
    const lastName = await question('Enter last name: ');

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users 
      (employee_id, email, password_hash, first_name, last_name, role, 
       employment_status, date_hired)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, first_name, last_name`,
      [
        'ADMIN001',
        email.toLowerCase(),
        hashedPassword,
        firstName,
        lastName,
        'admin',
        'active',
        new Date()
      ]
    );

    console.log('\n✅ Admin user created successfully!');
    console.log('Details:', result.rows[0]);

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    rl.close();
    process.exit(1);
  }
};

createAdmin();