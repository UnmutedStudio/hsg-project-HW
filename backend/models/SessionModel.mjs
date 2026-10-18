import { DatabaseModel } from './DatabaseModel.mjs';
import mysql from 'mysql2/promise';
/**
 * This SessionModel is used for the HIgh St Gym app
 * The session records are stored in the database and has CRUD operations
 */
export class SessionModel extends DatabaseModel {
  /**
   *
   * @param {number} id | the unique identifer for the session
   * @param {number} activityId | the unique linked id for the activity
   * @param {number} locationId | | the unique linked id for the location
   * @param {number} trainerId | the unique linked id for the user with role as trainer
   * @param {Date} dateSession | the date of the session
   * @param {string} timeSession | the start time of the session
   * @param {number} duration | the duration of the session in minutes
   * @param {number} availability | the availibility of places in the class
   * @param {number} deleted | shows deleted or not using a soft delete flag 0 = active or 1 = deleted
   */
  constructor(
    id,
    activityId,
    locationId,
    trainerId,
    dateSession,
    timeSession,
    duration,
    availability,
    deleted,
  ) {
    super();
    this.id = id;
    this.activityId = activityId;
    this.locationId = locationId;
    this.trainerId = trainerId;
    this.dateSession = dateSession;
    this.timeSession = timeSession;
    this.duration = duration;
    this.availability = availability;
    this.deleted = deleted;
  }
  /**
   * Converts a database row into a SessionModel object
   *
   * @param {Object} row | the databse row from the sessions table
   * @returns {SessionModel}
   */
  static tableToModel(row) {
    return new SessionModel(
      Number(row['id']),
      Number(row['activity_id']),
      Number(row['location_id']),
      Number(row['trainer_id']),
      row['date_session'],
      row['time_session'],
      Number(row['duration']),
      Number(row['availability']),
      row['deleted'],
    );
  }
  /**
   * All sessions that are active are returned from the database
   *
   * @returns {Promise<Array<SessionModel>>}
   */
  static getAll() {
    return this.query('SELECT * FROM sessions WHERE deleted = 0').then(
      (result) => result.map((row) => this.tableToModel(row.sessions)),
    );
  }
  /**
   * This returns a session by its unique id
   *
   * @param {number} id | the unique identifier for each session
   * @returns {Promise<SessionModel>}
   */
  static getById(id) {
    return this.query('SELECT * FROM sessions WHERE id = ?', [id]).then(
      (result) =>
        result.length > 0
          ? this.tableToModel(result[0].sessions)
          : Promise.reject('not found'),
    );
  }
  /**
   * This returns sessions with location, date and time
   * 
   * @param {number} locationId | location unique identifier
   * @param {string} dateSession | date of the session
   * @param {string} timeSession | time of the session 
   * @returns {Promise<SessionModel>}
   */
  static getByLocationDateTime(
    locationId,
    dateSession,
    timeSession,
  ){
    return this.query(
      `
      SELECT *
      FROM sessions
      WHERE location_id = ?
        AND date_session = ?
        AND time_session = ?
        AND deleted = 0
      `,
    [locationId, dateSession, timeSession],
    ).then((result) =>
    result.length > 0
      ? this.tableToModel(result[0].sessions)
      : Promise.reject("not found"),
    );
  }
  /**
   * This checks for duplicate sessions while excluding the session that is being updated
   * 
   * @param {number} locationId | location unique identifier
   * @param {string} dateSession | date of the session
   * @param {string} timeSession | time of the session
   * @param {number} sessionId | the session unique identifer 
   * @returns {Promise<SessionModel>}
   * 
   */
  static getDuplicateForUpdate(
    locationId,
    dateSession,
    timeSession,
    sessionId,
  ) {
    return this.query(
      `
        SELECT *
        FROM sessions
        WHERE location_id = ?
          AND date_session = ?
          AND time_session = ?
          AND id != ?
          AND deleted = 0
      `,
      [
        locationId,
        dateSession,
        timeSession,
        sessionId,
      ],
    ).then((result) =>
      result.length > 0
        ? this.tableToModel(result[0].sessions)
        : Promise.reject("not found"),
    );
  }
  /**
   * This returns active sessopms that are assided to trainer by their id/
   * @param {number} trainerId | the unique identifier of the trainer
   * @returns {Promise<Array<SessionModel>>}
   */
  static getByTrainerId(trainerId) {
    return this.query(
      'SELECT * FROM sessions WHERE trainer_id = ? AND deleted = 0',
      [trainerId],
    ).then((result) => result.map((row) => this.tableToModel(row.sessions)));
  }
  /**
   * CREATE - this creates a new session and inserts int into the database(DB)
   *
   * @param {SessionModel} session | the session object that will insert into the DB
   * @returns {Promise<mysql.OkPacket>}
   */
  static create(session) {
    return this.query(
      `
        INSERT INTO sessions 
        (activity_id, location_id, trainer_id, date_session, time_session, duration, availability, deleted)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        session.activityId,
        session.locationId,
        session.trainerId,
        session.dateSession,
        session.timeSession,
        session.duration,
        session.availability,
        session.deleted,
      ],
    );
  }
  /**
   * UPDATE - this updates a session by its id and changes the record in the database
   *
   * @param {SessionModel} session | the session object that will updated in the DB
   * @returns {Promise<mysql.OkPacket>}
   */
  static update(session) {
    return this.query(
      `
        UPDATE sessions
        SET activity_id = ?, location_id = ?, trainer_id = ?, date_session = ?, time_session = ?, duration = ?, availability = ?, deleted = ?
        WHERE id = ?
      `,
      [
        session.activityId,
        session.locationId,
        session.trainerId,
        session.dateSession,
        session.timeSession,
        session.duration,
        session.availability,
        session.deleted,
        session.id,
      ],
    );
  }
  /**
   * DELETE - this soft deletes a session record by changing the delete flag to 1
   *
   * @param {number} id | the session unique identifier
   * @returns {Promise<mysql.OkPacket>}
   */
  static delete(id) {
    return this.query(`UPDATE sessions SET deleted = 1 WHERE id = ?`, [id]);
  }
  /**
   * This updates the session that belongs to the aunthenticated trainer.
   * 
   * @param {SessionModel} session | The session object to be updated
   * @returns {Promise<mysql.OkPacket>}
   */
  static updateByTrainer(session) {
    return this.query(
      `
        UPDATE sessions
        SET activity_id = ?, 
          location_id = ?, 
          trainer_id = ?, 
          date_session = ?, 
          time_session = ?, 
          duration = ?, 
          availability = ?, 
          deleted = ?
        WHERE id = ?
        AND trainer_id = ?
      `,
      [
        session.activityId,
        session.locationId,
        session.trainerId,
        session.dateSession,
        session.timeSession,
        session.duration,
        session.availability,
        session.deleted,
        session.id,
        session.trainerId
      ],
    );
  }
  /**
   * This allows a soft delete from the session that belongs to the authenticated trainer
   * 
   * @param {number} sessionId | the session unique identifier
   * @param {number} trainerId | the teainer unique identifer
   * @returns {Promise<mysql.OkPacket>}
   */
  static deleteByTrainer(sessionId, trainerId) {
    return this.query(
      `
      UPDATE sessions 
      SET deleted = 1 
      WHERE id = ?
      AND trainer_id = ?
      `,
      [sessionId, trainerId],
    );
  }
}

// TESTING AREA 5 of 5 completed
// 1. Test Get all works correctly: COMPLETED
// SessionModel.getAll()
// .then((sessions) => console.log(sessions));

// 2. TESTED get by ID using the below: COMPLETED
// SessionModel.getById(99)
//   .then((session) => {
//     console.log("Getting session with id 1: ");
//     console.log(session);
//   })
//   .catch((error) =>
//     console.error("There was an issue loading the session: " + error),
//   );

// 3. TESTED create new session and insert into DB: COMPLETED
// const newSession = new SessionModel(
//   null,
//   9999,              //activityId
//   1,              // locationID
//   2,              // trainerID
//   "2026-10-19",   // date
//   "10:00:00",     // time
//   60,             // duration
//   10,             // availability
//   0,              // deleted
// );

// SessionModel.create(newSession)
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// 4. TESTED Update by id: COMPLETED
// SessionModel.getById(4)
//   .then((session) => {
//     session.availability = 15;
//     SessionModel.update(session)
//       .then((result) => {
//         console.log(result);
//       })
//       .catch((error) => {
//         console.error("There was an issue saving the session: " + error);
//       });
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// 5. TESTED soft delete: COMPLETED
// SessionModel.delete(4)
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// optional later TEST get by search : Not in use
// SessionModel.getBySearch("yoga")
//   .then((activities) => {
//     console.log("Getting activities that contain yoga:");
//     console.log(activities);
//   })
//   .catch((error) => {
//     console.error("There was an issue loading the activities: " + error);
//   });
