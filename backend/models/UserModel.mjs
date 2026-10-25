import { DatabaseModel } from "./DatabaseModel.mjs";
import mysql from 'mysql2/promise';
/**
 * This User Model is for the High St Gym application.
 * It pulls user records from the user table from the database.
 * CRUD operations have been set up
 */
export class UserModel extends DatabaseModel {
  /**
   * This creates a UserModel object
   * 
   * @param {number} id | is the unique identifer per user
   * @param {string} firstName | the users first name
   * @param {string} lastName | the users last name
   * @param {string} email | user email address 
   * @param {string} passwordHash | the user's hashed password
   * @param {string} role | role of the user (member, trainer or admin)
   * @param {number} deleted | soft delete field where active = 0 and delted = 1
   */
  constructor(id, firstName, lastName, email, passwordHash, role, deleted,) 
  {
    super();
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.deleted = deleted;
  }

  /**
   * This method is used to convert a table row into a UserModel object
   * it maps the database fields to the javascript model fields.
   * 
   * @param {Object} row | row from the users table in the database. 
   * @returns {UserModel}
   */
  static tableToModel(row) {
    return new UserModel(
      row["id"],
      row["first_name"],
      row["last_name"],
      row["email"],
      row["password_hash"],
      row["role"],
      row["deleted"],
    );
  }
  /**
   * Returns the users that match the search term
   *
   * @param {string} term | the search term used to find user name.
   * @returns {Promise<Array<UserModel>>}
   */
  static getBySearch(term) {
    return this.query(
      `
        SELECT *
        FROM users
        WHERE deleted = 0
        AND (
          first_name LIKE ?
          OR last_name LIKE ?
          OR email LIKE ?
          OR role LIKE ?
        )
      `,
      [
        `%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`,
      ],
    ).then((result) =>
      result.map((row) => this.tableToModel(row.users)),
    );
  }
  /**
   * This returns all the users from the database that have not been deleted.
   * 
   * @returns {Promise<Array<UserModel>>}
   */
  static async getAll() {
    return this.query("SELECT * FROM users WHERE deleted = 0").then(
      (results) => results.map((row) => this.tableToModel(row.users)),
    );
  }

  /**
   * Returns a user by the id number
   * 
   * @param {number} id  | this is the user identifier
   * @returns {Promise<UserModel>}
   */
  static async getById(id) {
    return this.query("SELECT * FROM users WHERE id = ?", [id]).then(
      (result) => {
        if (result.length > 0) {
          return this.tableToModel(result[0].users);
        } else {
          return Promise.reject("not found");
        }
      },
    );
  }
  // this example is not in use 
  // .then(result =>
  //result.length > 0
  //? this.tableTomodel(result[0].users)
  //: Promise.reject("not found"))

  /**
   * Returns a User by the email address
   * 
   * @param {string} email 
   * @returns {Promise<UserModel>}
   */
  static async getByEmail(email) {
    return this.query(
      "SELECT * FROM users WHERE email = ? AND deleted = 0",
      [email],
    ).then((result) => {
      if (result.length > 0) {
        return this.tableToModel(result[0].users);
      } else {
        return Promise.reject("not found");
      }
    });
  }
  /**
   * This will returns user by all emails including soft deletes
   *
   * @param {string} email | the users email address
   * @returns {Promise<UserModel>}
   */
  static getByAllEmail(email) {
    return this.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
    ).then((result) => {
      if (result.length > 0) {
        return this.tableToModel(result[0].users);
      }
      return Promise.reject("not found");
    });
  }
  /**
   * CREATE - creates a new user in the databse
   * 
   * @param {UserModel} user | this is the user object which contains the values to add in
   * @returns {Promise<mysql.OkPacket>}
   */
  static async create(user) {
    return this.query(
      `
      INSERT INTO users (first_name, last_name, email, password_hash, role)
      VALUES(?, ?, ?, ?, ?)
      `,
      [
        user.firstName,
        user.lastName,
        user.email,
        user.passwordHash,
        user.role,
      ],
    );
  }

  /**
   * UPDATE - this updates a user record in the database
   * 
   * @param {UserModel} user | the user object that contains the values that will be updated
   * @returns {Promise<mysql.OkPacket>}
   */
  static async update(user) {
    return this.query(
      `
      UPDATE users
      SET first_name = ?, last_name = ?, email = ?, password_hash = ?, role = ?
      WHERE id = ?
      `,
      [
        user.firstName,
        user.lastName,
        user.email,
        user.passwordHash,
        user.role,
        user.id,
      ],
    );
  }

  /**
   * DELETE - this soft deletes a user and changes the delete tag to = 1
   * 
   * @param {number} id | the unique identifer for a user
   * @returns {Promise<mysql.OkPacket>}
   */
  static async delete(id) {
    return this.query(`UPDATE users SET deleted = 1 WHERE id = ?`, [id]);
  }
}

// TESTING AREA 6 of 7 completed
// 1. Test Get all works correctly 20/09:
// UserModel.getAll().then((users) => console.log(users));

// 2. TESTED (get by email) this with incorrect and correct email and both works correctly 20/09
// UserModel.getByEmail("bo.katan@member.com")
//   .then((user) => {
//     console.log("Getting the user record for Bo-katan: ");
//     console.log(user);
//   })
//   .catch((error) => {
//     console.error("There was an issue loading the user: " + error);
//   });

// 3. TESTED get by ID the below and this works 20/09:
// UserModel.getById(1)
//   .then((user) => {
//     console.log("Getting user with id 1: ");
//     console.log(user);
//   })
//   .catch((error) =>
//     console.error("There was an issue loading the user: " + error),
//   );

// 4. TESTED create new user 20/09 worked and instered into DB
// const newUser = new UserModel(
//   null,
//   "Test",
//   "User",
//   "test.user@hsgym.com",
//   "Password1",
//   "admin",
// );

// UserModel.create(newUser)
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// 5. TESTED Update and worked corrected 20/09
// UserModel.getById(5)
//   .then((user) => {
//     user.email = "test.admin@hsgym.com";
//     UserModel.update(user)
//       .then((result) => {
//         console.log(result);
//       })
//       .catch((error) => {
//         console.error("There was an issue saving the email: " + error);
//       });
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// // 6. TESTED and delete works 20/09
// UserModel.delete(5)
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((error) => {
//     console.error(error);
//   });


// TODO: revisit the below when implementing authentication:

// const newUser = new UserModel(
//   null,
//   "New TEST",
//   "Watson",
//   "admin",
//   "test",
//   "abc123",
// );

// newUser.password = bcrypt.hashSync(newUser.password);

// UserModel.create(newUser)
//   .then((result) => {
//     console.log("user created")
//   })
//   .catch((error) => {
//     console.error(error);
//   });
