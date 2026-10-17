import { DatabaseModel } from "./DatabaseModel.mjs";
import mysql from "mysql2/promise";
/**
 * The ActivityModel is uesd for the High ST gym app.
 * Records are stored in the database table for activities and has CRUD operations
 */
export class ActivityModel extends DatabaseModel {
/**
 * Creates the ActivityModel object
 * 
 * @param {number} id | the activity unique identifier
 * @param {string} activityName | the activity name
 * @param {string} activityDescription | the activity description
 * @param {number} deleted | shows deleted or not using a soft delete flag 0 = active or 1 = deleted 
 * 
 */
  constructor(
    id,
    activityName,
    activityDescription,
    deleted,
  ) {
    super();
    this.id = id;
    this.activityName = activityName;
    this.activityDescription = activityDescription;
    this.deleted = deleted;
  }
  /**
   * Theis method converts a database row into an ActivityModel object
   * 
   * @param {Object} row | this is the database row from the ativities table
   * @returns {ActivityModel}
   */
  static tableToModel(row) {
    return new ActivityModel(
      Number(row["id"]),
      row["activity_name"],
      row["activity_description"],
      row["deleted"],
    );
  }
  /**
   * This returns all activities from the database.
   *
   * @returns {Promise<ActivityModel[]>}
   */
  static getAll() {
    return this.query("SELECT * FROM activities WHERE deleted = 0").then(
      (result) => result.map((row) => this.tableToModel(row.activities)),
    );
  }

  /**
   *Returns the activities if they match a search term
   *
   * @param {string} term | the search term used to find activity name.
   * @returns {Promise<Array<ActivityModel>>}
   */
  static getBySearch(term) {
    return this.query(
      `
        SELECT * FROM activities 
        WHERE deleted = 0 
        AND activity_name LIKE ?
      `,
      [`%${term}%`],
    ).then((result) => result.map((row) => this.tableToModel(row.activities)));
  }

  /**
   *Returns the activity by its unique identifer
   * 
   * @param {number} id | the unique identifier for each activity
   * @returns {Promise<ActivityModel>}
   */
  static getById(id) {
    return this.query("SELECT * FROM activities WHERE id = ?", [id]).then(
      (result) =>
        result.length > 0
          ? this.tableToModel(result[0].activities)
          : Promise.reject("not found"),
    );
  }

  /**
   * CREATE - creates a new activity and places the record into the database
   * 
   * @param {ActivityModel} activity | The activity object that will be inserted in the database
   * @returns {Promise<mysql.OkPacket>}
   */
  static create(activity) {
    return this.query(
      `
        INSERT INTO activities
        (activity_name, activity_description, deleted)
        VALUES (?, ?, ?)
      `,
      [
        activity.activityName,
        activity.activityDescription,
        activity.deleted,
      ],
    );
  }
   /**
   * UPDATE - this updates an activity record in the database
   * 
   * @param {ActivityModel} activity | The activity object that will be updated in the database
   * @returns {Promise<mysql.OkPacket>}
   */
  static update(activity) {
    return this.query(
      `
        UPDATE activities
        SET activity_name = ?, activity_description = ?, deleted = ?
        WHERE id = ?
      `,
      [
        activity.activityName,
        activity.activityDescription,
        activity.deleted,
        activity.id,
      ],
    );
  }

  /**
   * DELETE - this soft deletes a record by changing the delete flag to 1
   * 
   * @param {number} id | Activity unique identifier
   * @returns {Promise<mysql.OkPacket>}
   */
  static delete(id) {
    return this.query(`UPDATE activities SET deleted = 1 WHERE id = ?`, [id]);
  }
}


// TESTING AREA 6 of 6 completed
// 1. Test Get all works correctly: COMPLETED
// ActivityModel.getAll()
// .then((activities) => console.log(activities));

// 2. TESTED get by ID using the below: COMPLETED
ActivityModel.getById(1)
  .then((activity) => {
    console.log("Getting activity with id 1: ");
    console.log(activity);
  })
  .catch((error) =>
    console.error("There was an issue loading the activity: " + error),
  );

// 3. TEST get by search : COMPLETED
// ActivityModel.getBySearch("yoga")
//   .then((activities) => {
//     console.log("Getting activities that contain yoga:");
//     console.log(activities);
//   })
//   .catch((error) => {
//     console.error("There was an issue loading the activities: " + error);
//   });

// 4. TESTED create new activity and insert into DB: COMPLETED
// UPDATE: adding in the description from feedback of AT3 observation requirements. 

// const newActivity = new ActivityModel(
//   null,
//   "Jedi Training",
//   "Build strength, balance and endurance with training inspired by the ways of the Jedi.",
//   0,
// );

// ActivityModel.create(newActivity)
//   .then((result) => {
//     console.log("New activity created for AT2 integration plan:");
//     console.log(result);
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// 5. TESTED Update by id: COMPLETED
// ActivityModel.getById(8)
//   .then((activity) => {
//     activity.activityName = "Strength and Conditioning";
//     ActivityModel.update(activity)
//       .then((result) => {
//         console.log(result);
//       })
//       .catch((error) => {
//         console.error("There was an issue saving the activity: " + error);
//       });
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// // 6. TESTED soft delete: COMPLETED
// ActivityModel.delete(8)
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((error) => {
//     console.error(error);
//   });