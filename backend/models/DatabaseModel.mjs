import mysql from "mysql2/promise";
/**
 * This is the database model for the High st gym app
 * This allows a shared connection between the databse and the methods used by all models
 */
export class DatabaseModel {
  static connection;

  //this creates the connection to my own high street gym MySQL DB and is used by all models
  static {
    this.connection = mysql.createPool({
      host: "localhost",
      user: "highstreetgym-hw",
      password: "Password1",
      database: "highstreetgym",
      nestTables: true,
    });
    // // data base connection test - from learner guide page 122
    // conn.connect(function(err) {
    //   if (err) {
    //     return console.error('error: ' + err.message);
    //   }
    //     console.log('Connected to the MySQL server.');
    // });
  }

  /**
   * This executes a SQL query in the database
   * 
   * @param {string} sql | the SQL query to execute
   * @param {Array<any>} values | these are values used in the query
   * @returns {Promise<any>}
   */
  static query(sql, values) {
    return this.connection.query(sql, values).then(([result]) => result);
  }
  //Note: How does the above destructuring assignment work?
  // query() => Promise<[firstFormat, secondFormat]>
  //query().then(([result]) => result) => Promise<firstFormat>
  //const items = ["Hello", "world", "!"]
  //const [first, second] = items

  /**
   * This connverts the JS Date object into date format (YYYY-MM-DD) in MySQL
   * 
   * @param {Date} date | the JS date object
   * @returns {string}
   */
  static toMySqlDate(date) {
    const year = date.toLocaleString("default", { year: "numeric" });
    const month = date.toLocaleString("default", { month: "2-digit" });
    const day = date.toLocaleString("default", { day: "2-digit" });
    return [year, month, day].join("-");
  }
}
