import { DatabaseModel } from './DatabaseModel.mjs';
import { BookingModel } from './BookingModel.mjs';
import { SessionModel } from './SessionModel.mjs';
import { ActivityModel } from './ActivityModel.mjs';
import { LocationModel } from './LocationModel.mjs';
import { UserModel } from './UserModel.mjs';

/**
 *  This model links together the booking, session, activity, location and the trainer
 *  it is for displaying a members bookings
 */
export class BookingDetailsModel extends DatabaseModel {
  /**
   * This creates a BookingDetailsModel object
   *
   * @param {BookingModel} booking | the booking details
   * @param {SessionModel} session | the session linked to the booking
   * @param {ActivityModel} activity | the activity details linked to the session
   * @param {LocationModel} location | the location linked to the session
   * @param {UserModel} trainer | the trainer that is linked to the session
   * @param {UserModel} member | the member that is linked to the booking
   */
  constructor(booking, session, activity, location, trainer, member) {
    super();
    this.booking = booking;
    this.session = session;
    this.activity = activity;
    this.location = location;
    this.trainer = trainer;
    this.member = member;
  }
  /**
   * This model converts joined database rows into a BookingDetailsModel object
   *
   * @param {Object} row ||| the joined row from the database
   * @returns {BookingDetailsModel} the convered booking detail object
   */
  static tableToModel(row) {
    return new BookingDetailsModel(
      BookingModel.tableToModel(row.bookings),
      SessionModel.tableToModel(row.sessions),
      ActivityModel.tableToModel(row.activities),
      LocationModel.tableToModel(row.locations),
      UserModel.tableToModel(row.trainers),
      UserModel.tableToModel(row.members),
    );
  }
  /**
   * THis returns all the active bookings for a member
   * it includes the related session, activity location and traineer details.
   *
   * @param {number} memberId | the members unique identifier
   * @returns {Promise<Array<BookingDetailsModel>>} the members bookings
   */
  static getByMemberId(memberId) {
    return this.query(
      `
        SELECT *
        FROM bookings
        INNER JOIN sessions
          ON bookings.session_id = sessions.id
        INNER JOIN activities
          ON sessions.activity_id = activities.id
        INNER JOIN locations
          ON sessions.location_id = locations.id
        INNER JOIN users
          ON sessions.trainer_id = users.id
        WHERE bookings.user_id = ?
          AND bookings.deleted = 0
          AND sessions.deleted = 0
          AND activities.deleted = 0
          AND locations.deleted = 0
         AND users.deleted = 0
        ORDER BY sessions.date_session, sessions.time_session
      `,
      [memberId],
    ).then((result) => result.map((row) => this.tableToModel(row)));
  }
  /**
   * this returns all the bookings that are active with the corresponding details such as, session, activity, location and trainer.
   * @returns {Promise<Array<BookingDetailsModel>>}
   */
  static getAll() {
    return this.query(
      `
      SELECT *
      FROM bookings
      INNER JOIN sessions
        ON bookings.session_id = sessions.id
      INNER JOIN activities
        ON sessions.activity_id = activities.id
      INNER JOIN locations
        ON sessions.location_id = locations.id
      INNER JOIN users AS trainers
        ON sessions.trainer_id = trainers.id
      INNER JOIN users AS members
        ON bookings.user_id = members.id
      WHERE bookings.deleted = 0
        AND sessions.deleted = 0
        AND activities.deleted = 0
        AND locations.deleted = 0
        AND trainers.deleted = 0
        AND members.deleted = 0
      ORDER BY sessions.date_session, sessions.time_session
    `,
    ).then((result) => result.map((row) => this.tableToModel(row)));
  }
  /**
   * Returns booking details that match a search term
   *
   * @param {string} term | search term used to locate a booking
   * @returns {Promise<Array<BookingDetailsModel>>}
   */
  static getBySearch(term) {
    return this.query(
      `
        SELECT *
        FROM bookings
        INNER JOIN sessions
          ON bookings.session_id = sessions.id
        INNER JOIN activities
          ON sessions.activity_id = activities.id
        INNER JOIN locations
          ON sessions.location_id = locations.id
        INNER JOIN users AS trainers
          ON sessions.trainer_id = trainers.id
        INNER JOIN users AS members
          ON bookings.user_id = members.id
        WHERE bookings.deleted = 0
          AND sessions.deleted = 0
          AND activities.deleted = 0
          AND locations.deleted = 0
          AND trainers.deleted = 0
          AND members.deleted = 0
          AND (
            members.first_name LIKE ?
            OR members.last_name LIKE ?
            OR activities.activity_name LIKE ?
            OR trainers.first_name LIKE ?
            OR trainers.last_name LIKE ?
            OR locations.location_name LIKE ?
            OR bookings.booking_status LIKE ?
          )
        ORDER BY sessions.date_session, sessions.time_session
      `,
      [
        `%${term}%`,
        `%${term}%`,
        `%${term}%`,
        `%${term}%`,
        `%${term}%`,
        `%${term}%`,
        `%${term}%`,
      ],
    ).then((result) => result.map((row) => this.tableToModel(row)));
  }
}

// testing area
// BookingDetailsModel.getAll()
//   .then((bookings) => {
//     console.log(bookings);
//   })
//   .catch((error) => {
//     console.error(error);
//   });
