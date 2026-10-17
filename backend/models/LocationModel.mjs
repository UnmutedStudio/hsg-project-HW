import { DatabaseModel } from "./DatabaseModel.mjs";
import mysql from "mysql2/promise";
/**
 * The LocationModel is uesd for the High ST gym app.
 * Records are stored in the database table for locations and has CRUD operations
 */
export class LocationModel extends DatabaseModel {
/**
 * Creates the LocationModel object
 * 
 * @param {number} id | the location unique identifier
 * @param {string} locationName | the location name
 * @param {number} deleted | shows deleted or not using a soft delete flag 0 = active or 1 = deleted 
 * 
 */
  constructor(
    id,
    locationName,
    deleted,
  ) {
    super();
    this.id = id;
    this.locationName = locationName;
    this.deleted = deleted;
  }
  /**
   * Theis method converts a database row into an LocationModel object
   * @param {Object} row | this is the database row from the locations table
   * @returns {LocationModel}
   */
  static tableToModel(row) {
    return new LocationModel(
      Number(row["id"]),
      row["location_name"],
      row["deleted"],
    );
  }
  /**
   * This returns all locations from the database.
   *
   * @returns {Promise<LocationModel[]>}
   */
  static getAll() {
    return this.query("SELECT * FROM locations WHERE deleted = 0").then(
      (result) => result.map((row) => this.tableToModel(row.locations)),
    );
  }

  /**
   *Returns the locations if they match a search term
   *
   * @param {string} term | the search term used to find location name.
   * @returns {Promise<LocationModel[]>}
   */
  static getBySearch(term) {
    return this.query(
      `
        SELECT * FROM locations 
        WHERE deleted = 0 
        AND location_name LIKE ?
      `,
      [`%${term}%`],
    ).then((result) => result.map((row) => this.tableToModel(row.locations)));
  }

  /**
   *Returns the location by its unique identifer
   * 
   * @param {number} id | the unique identifier for each location
   * @returns {Promise<LocationModel>}
   */
  static getById(id) {
    return this.query("SELECT * FROM locations WHERE id = ?", [id]).then(
      (result) =>
        result.length > 0
          ? this.tableToModel(result[0].locations)
          : Promise.reject("not found"),
    );
  }

  /**
   * CREATE - creates a new location and places the record into the database
   * 
   * @param {LocationModel} location | The location object that will be inserted in the database
   * @returns {Promise<mysql.OkPacket>}
   */
  static create(location) {
    return this.query(
      `
        INSERT INTO locations
        (location_name, deleted)
        VALUES (?, ?)
      `,
      [
        location.locationName,
        location.deleted,
      ],
    );
  }
   /**
   * UPDATE - this updates an location record in the database
   * 
   * @param {LocationModel} location | The location object that will be updated in the database
   * @returns {Promise<mysql.OkPacket>}
   */
  static update(location) {
    return this.query(
      `
        UPDATE locations
        SET location_name = ?, deleted = ?
        WHERE id = ?
      `,
      [
        location.locationName,
        location.deleted,
        location.id,
      ],
    );
  }

  /**
   * DELETE - this soft deletes a record by changing the delete flag to 1
   * @param {number} id | location unique identifier
   * @returns {Promise<mysql.OkPacket>}
   */
  static delete(id) {
    return this.query(`UPDATE locations SET deleted = 1 WHERE id = ?`, [id]);
  }
}

// TESTING AREA 6 of 6 completed
// 1. Test Get all works correctly: COMPLETED
// LocationModel.getAll()
// .then((locations) => console.log(locations));

// 2. TESTED get by ID using the below: COMPLETED
// LocationModel.getById(10)
//   .then((location) => {
//     console.log("Getting location with id 1: ");
//     console.log(location);
//   })
//   .catch((error) =>
//     console.error("There was an issue loading the location: " + error),
//   );

// 3. TEST get by search : COMPLETED
// LocationModel.getBySearch("Chermside")
//   .then((locations) => {
//     console.log("Getting locations that contain Chermside:");
//     console.log(locations);
//   })
//   .catch((error) => {
//     console.error("There was an issue loading the locations: " + error);
//   });

// 4. TESTED create new location and insert into DB: COMPLETED
// const newLocation = new LocationModel(
//   null,
//   "Southbank",
//   0,
// );

// LocationModel.create(newLocation)
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// 5. TESTED Update by id: COMPLETED
// LocationModel.getById(6)
//   .then((location) => {
//     location.locationName = "Southbank TAFE";
//     LocationModel.update(location)
//       .then((result) => {
//         console.log(result);
//       })
//       .catch((error) => {
//         console.error("There was an issue saving the location: " + error);
//       });
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// // 6. TESTED soft delete: COMPLETED
// LocationModel.delete(6)
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((error) => {
//     console.error(error);
//   });
