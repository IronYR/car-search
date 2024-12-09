const mysql = require('mysql2/promise');
const { faker } = require('@faker-js/faker');

// Create a pool for this script

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false
    }
  });

const makesAndModels = {
  Toyota: ["Corolla", "Camry", "RAV4", "Prius"],
  Honda: ["Civic", "Accord", "CR-V", "Fit"],
  Ford: ["F-150", "Mustang", "Explorer", "Escape"],
  Chevrolet: ["Silverado", "Malibu", "Equinox", "Tahoe"],
  BMW: ["3 Series", "X5", "5 Series", "X3"],
  "Mercedes-Benz": ["C-Class", "E-Class", "GLC", "GLE"]
};

(async function populateDatabase() {
  try {
    console.log("Connected to the database!");

    // Create table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS cars (
        id INT AUTO_INCREMENT PRIMARY KEY,
        make VARCHAR(50) NOT NULL,
        model VARCHAR(50) NOT NULL,
        year INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        FULLTEXT KEY car_search (make, model, description)
      ) ENGINE=InnoDB;
    `;

    await pool.execute(createTableQuery);
    console.log("Table created or already exists!");

    // // Clear existing data
    // await pool.execute('TRUNCATE TABLE cars');
    // console.log("Cleared existing data!");

    // Generate and insert 1000 dummy entries
    for (let i = 0; i < 1000; i++) {
        const make = faker.helpers.arrayElement(Object.keys(makesAndModels));
        const model = faker.helpers.arrayElement(makesAndModels[make]);
        const year = faker.number.int({ min: 2000, max: 2023 });
        const price = faker.number.float({ min: 5000, max: 100000, precision: 0.01 });
        const description = faker.lorem.sentence();
  
        const query = `
          INSERT INTO cars (make, model, year, price, description)
          VALUES (?, ?, ?, ?, ?)
        `;
        await pool.execute(query, [make, model, year, price, description]);
  
        if ((i + 1) % 100 === 0) {
          console.log(`${i + 1} records inserted...`);
        }
    }
    console.log("Dummy data insertion complete!");
  } catch (err) {
    console.error("Error populating data:", err);
  } finally {
    await pool.end();
    console.log("Database connection closed.");
  }
})();
