import { DatabaseModel } from "./DatabaseModel.mjs";
import { SessionModel } from "./SessionModel.mjs";
import { ActivityModel } from "./ActivityModel.mjs";
import { LocationModel } from "./LocationModel.mjs";
import { UserModel } from "./UserModel.mjs";

/**
 * this combines the session, activity location and trainer details in order to display the details
 */
export class SessionDetailModel extends DatabaseModel {
  /**
   * Creating the SessionDetailModel object
   * 
   * @param {SessionModel} session || The session details
   * @param {ActivityModel} activity || the actitivity details linked to the session
   * @param {LocationModel} location || the location details linked to the session
   * @param {UserModel} trainer || th treainer that is linked to the session
   */
  constructor(session, activity, location, trainer) {
    super();
    this.session = session;
    this.activity = activity;
    this.location = location;
    this.trainer = trainer;
  }
  /**
   * this converts the joined database rows into the SessionDetailModel object
   * 
   * @param {Object} row | this is the joined row that contains the session, activity, location and trainer details.
   * @returns {SessionDetailModel} the converted SessionDetailModel Object
   */
  static tableToModel(row) {
    return new SessionDetailModel(
      SessionModel.tableToModel(row.sessions),
      ActivityModel.tableToModel(row.activities),
      LocationModel.tableToModel(row.locations),
      UserModel.tableToModel(row.users),
    );
  }
  /**
   * This returns all the acitive sessions with related details (activity, location and trainer)
   * 
   * @returns {Promise<Array<SessionDetailModel>>}
   */
  static getAll() {
    return this.query(
      `
        SELECT * FROM sessions
        INNER JOIN activities
          ON sessions.activity_id = activities.id
        INNER JOIN locations
          ON sessions.location_id = locations.id
        INNER JOIN users
          ON sessions.trainer_id = users.id
        WHERE sessions.deleted = 0
          AND activities.deleted = 0
          AND locations.deleted = 0
          AND users.deleted = 0
        ORDER BY sessions.date_session, sessions.time_session
        `,
    ).then((result) => result.map((row) => this.tableToModel(row)),
    );
  }
  /**
   * This reuturns one active session with the related details (activity, location and trainer)
   * @param {number} id | the session unique identifier
   * @returns {Promise<SessionDetailModel>}
   */
  static getById(id) {
    return this.query(
      `
        SELECT * FROM sessions
        INNER JOIN activities
          ON sessions.activity_id = activities.id
        INNER JOIN locations
          ON sessions.location_id = locations.id
        INNER JOIN users
          ON sessions.trainer_id = users.id
        WHERE sessions.id = ?
          AND sessions.deleted = 0
        `,
      [id],
    ).then((result) => result.length > 0
        ? this.tableToModel(result[0])
        : Promise.reject("not found"),
    );
  }
  /**
   * This returns all the acitive sessions belonging to a selected trainer
   * 
   * @param {number} trainerId | the trainers unique identifer
   * @returns {Promise<ArraySessionDetailModel>>} the trainers session details.
   */
  static getByTrainerId(trainerId) {
    return this.query(
      `
        SELECT *
        FROM sessions
        INNER JOIN activities
          ON sessions.activity_id = activities.id
        INNER JOIN locations
          ON sessions.location_id = locations.id
        INNER JOIN users
          ON sessions.trainer_id = users.id
        WHERE sessions.trainer_id = ?
          AND sessions.deleted = 0
          AND locations.deleted = 0
          AND activities.deleted = 0
          AND users.deleted = 0
        ORDER BY sessions.date_session, sessions.time_session
      `,
      [trainerId],
    ).then((result) => result.map((row) => this.tableToModel(row)),
    );
  }
}
