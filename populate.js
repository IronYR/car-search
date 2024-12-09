const mysql = require('mysql2/promise');
const { faker } = require('@faker-js/faker');

// Sample data for makes and models
const makesAndModels = {
  Toyota: ["Corolla", "Camry", "RAV4", "Prius"],
  Honda: ["Civic", "Accord", "CR-V", "Fit"],
  Ford: ["F-150", "Mustang", "Explorer", "Escape"],
  Chevrolet: ["Silverado", "Malibu", "Equinox", "Tahoe"],
  BMW: ["3 Series", "X5", "5 Series", "X3"],
  "Mercedes-Benz": ["C-Class", "E-Class", "GLC", "GLE"]
};

(async function populateDatabase() {
  // Database connection
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'yousufrehan',
    database: 'car_database'
  });

  try {
    console.log("Connected to the database!");

    // Generate and insert 1000 dummy entries
    for (let i = 0; i < 1000; i++) {
        // Correctly select random elements
        const make = faker.helpers.arrayElement(Object.keys(makesAndModels));
        const model = faker.helpers.arrayElement(makesAndModels[make]);
        const year = faker.number.int({ min: 2000, max: 2023 });
        const price = faker.number.float({ min: 5000, max: 100000, precision: 0.01 });
        const description = faker.lorem.sentence();
  
        const query = `
          INSERT INTO cars (make, model, year, price, description)
          VALUES (?, ?, ?, ?, ?)
        `;
        await connection.execute(query, [make, model, year, price, description]);
  
        if ((i + 1) % 100 === 0) {
          console.log(`${i + 1} records inserted...`);
        }
    }
    console.log("Dummy data insertion complete!");
  } catch (err) {
    console.error("Error populating data:", err);
  } finally {
    await connection.end();
    console.log("Database connection closed.");
  }
})();
