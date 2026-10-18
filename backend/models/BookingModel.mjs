import { DatabaseModel } from "./DatabaseModel.mjs";
import mysql from "mysql2/promise";
/**
 * The booking model is used to manage the booking records for the high st gym application
 * There are crud operations for creating, viewing, editing and deleting bookings.
 */
export class BookingModel extends DatabaseModel {
  /**
   * 
   * @param {number} id | unique identifier for the booking record
   * @param {number} userId | the linked identifier for the user
   * @param {number} sessionId | the linked identifier for the session
   * @param {string} bookingStatus | the status of the current booking
   * @param {number} deleted | shows deleted or not using a soft delete flag 0 = active or 1 = deleted 
   */
  constructor(
    id,
    userId,
    sessionId,
    bookingStatus,
    deleted,
  ) {
    super();
    this.id = id;
    this.userId = userId;
    this.sessionId = sessionId;
    this.bookingStatus = bookingStatus;
    this.deleted = deleted;
  }
  /**
   * Converts the booking record into a BookingModel object
   * 
   * @param {Object} row | this is the row from the bookings table in the database
   * @returns {BookingModel}
   */
  static tableToModel(row) {
    return new BookingModel(
      Number(row["id"]),
      Number(row["user_id"]),
      Number(row["session_id"]),
      row["booking_status"],
      row["deleted"],
    );
  }
  /**
   * Rerturns all active booking records in the database
   * 
   * @returns {Promise<Array<BookingModel>>}
   */
  static getAll() {
    return this.query("SELECT * FROM bookings WHERE deleted = 0").then((result) =>
      result.map((row) => this.tableToModel(row.bookings)),
    );
  }
  /**
   * Returns a booking by the unique identifier
   * 
   * @param {number} id | unique identifer for booking record
   * @returns {Promise<BookingModel>}
   */
  static getById(id) {
    return this.query("SELECT * FROM bookings WHERE id = ?", [id]).then(
      (result) =>
        result.length > 0
          ? this.tableToModel(result[0].bookings)
          : Promise.reject("not found"),
    );
  }
  /**
   * 
   * This returns a booking if a member has already booking into a specific session
   * 
   * @param {number} userId || the uniquie user identifier
   * @param {number} sessionId || the unique session identifer
   * @returns {Promise<BookingModel>}
   */
  static getByMemberSession(userId, sessionId) {
    return this.query(
      `
        SELECT *
        FROM bookings
        WHERE user_id = ?
        AND session_id = ?
        AND deleted = 0
      `,
      [userId, sessionId],
    ).then((result) => 
      result.length > 0
        ? this.tableToModel(result[0].bookings)
        : Promise.reject("not found"),
    );
  }
  /**
   * CREATE - create a new booking and inserts it into the database
   * 
   * @param {BookingModel} booking | the object that will be inserted into the database
   * @returns {Promise<mysql.OkPacket>}
   */
  static create(booking) {
    return this.query(
      `
        INSERT INTO bookings 
        (user_id, session_id, booking_status, deleted)
        VALUES (?, ?, ?, ?)
      `,
      [
        booking.userId,
        booking.sessionId,
        booking.bookingStatus,
        booking.deleted,
      ],
    );
  }
  /**
   * UPDATE - this updates a booking record in the booking table from the databse
   * 
   * @param {BookingModel} booking | the booking object that will be updated
   * @returns {Promise<mysql.OkPacket>}
   */
  static update(booking) {
    return this.query(
      `
        UPDATE bookings
        SET user_id = ?, session_id = ?, booking_status = ?, deleted = ?
        WHERE id = ?
      `,
      [
        booking.userId,
        booking.sessionId,
        booking.bookingStatus,
        booking.deleted,
        booking.id,
      ],
    );
  }
  /**
   * DELETE - this soft deletes a booking record from the database by its id
   * 
   * @param {number} id | the identifier for the booking record
   * @returns {Promise<mysql.OkPacket>}
   */
  static delete(id) {
    return this.query(`UPDATE bookings SET deleted = 1 WHERE id = ?`, [id]);
  }
  /**
   * This soft deletes a booking only when it belongs to the member who is logged in. 
   *
   * @param {number} id | the booking unique identifier
   * @param {number} userId | the unique user ID for the member who has been authenticated
   * @returns {Promise<mysql.OkPacket>}
   */
  static deleteByMember(id, userId) {
    return this.query(
      `
        UPDATE bookings
        SET deleted = 1
        WHERE id = ?
          AND user_id = ?
          AND deleted = 0
      `,
      [id, userId],
    );
  }
  /**
   * This places a cancel status in the booking
   * And soft deletes active bookings linked to a session id.
   *
   * @param {number} sessionId | the uniques session identifier
   * @returns {Promise<mysql.OkPacket>}
   */
  static cancelBySessionId(sessionId) {
    return this.query(
      `
        UPDATE bookings
        SET booking_status = 'cancelled',
            deleted = 1
        WHERE session_id = ?
          AND deleted = 0
      `,
      [sessionId],
    );
  }
}

//TESTING AREA  6 of 6 completed
// 1. - test returning all : completed
// BookingModel.getAll()
//   .then((bookings) => {
//     console.log(bookings);
//   })
//   .catch((error) => {
//     console.error(error);
//   });

//  2. test returning one booking by id : completed
  // BookingModel.getById(999)
  // .then((booking) => {
  //   console.log("Getting a booking with id 1:");
  //   console.log(booking)
  // })
  // .catch((error) => {
  //   console.error(
  //     "There was an issue with the booking being loaded: " + error,);
  // });

  // 3. test create new booking : completed
  // const newBooking = new BookingModel(
  //   null,
  //   1,
  //   1,
  //   "confirmed",
  //   0,
  // );

  // BookingModel.create(newBooking)
  //   .then((result) => {
  //     console.log(result);
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //   });

  // 4. Test Update booking: completed
  // BookingModel.getById(4)
  //   .then((booking) => {
  //     booking.bookingStatus = "cancelled";
  //     BookingModel.update(booking)
  //       .then((result) => {
  //         console.log(result);
  //       })
  //       .catch((error) => {
  //         console.error("There was an issue saving the booking: " + error);
  //       });
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //   });

// 5. TEST DELETE by id function works: completed
// BookingModel.delete(4)
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// 6. Test - re run the get all to test the deleted booking doesn't show : completed

  // Not needed for now:
  // /**
  //  * UPDATE
  //  * 
  //  * @param {string} status
  //  * @returns {Promise<mysql.OkPacket>}
  //  */
  // static updateStatusById(id, status) {
  //   return this.query(
  //     `
  //           UPDATE bookings
  //           SET status = ?
  //           WHERE id = ?
  //       `,
  //     [status, id],
  //   );
  // }