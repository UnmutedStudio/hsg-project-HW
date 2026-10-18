import express from 'express';
import { BookingModel } from '../models/BookingModel.mjs';
import { BookingDetailsModel } from '../models/BookingDetailsModel.mjs';
import { SessionDetailModel} from '../models/SessionDetailModel.mjs';
import { AuthenticationController } from './AuthenticationController.mjs';
import { UserModel } from '../models/UserModel.mjs';
/**
 * This controller is for managing and displaying bookings for High St Gym application.
 * It will help render the different operations for different users.
 */
export class BookingController {
  /**
   * This express router contains all BookingController routes
   */
  static routes = express.Router();
  static {
    // Member bookings
    this.routes.get(
      '/',
      AuthenticationController.restrict(['member']),
      this.viewMyBookings,
    );
    // member review and create bookings
    this.routes.get(
      '/create/:sessionId',
      AuthenticationController.restrict(['member']),
      this.viewCreateBooking,
    );
    this.routes.post(
      '/create',
      AuthenticationController.restrict(["member"]),
      this.handleOwnBookings,
    );
    // Admin booking management
    this.routes.get(
      '/admin',
      AuthenticationController.restrict(["admin"]),
      this.viewBookingManagement,
    );
    this.routes.get(
      '/admin/:id',
      AuthenticationController.restrict(["admin"]),
      this.viewBookingManagement,
    );
    this.routes.post(
      '/admin',
      AuthenticationController.restrict(['admin']),
      this.handleBookingManagement,
    );
    this.routes.post(
      '/admin/:id',
      AuthenticationController.restrict(['admin']),
      this.handleBookingManagement,
    );
    // member booking confirmation and delete
    this.routes.get(
      '/:id',
      AuthenticationController.restrict(["member"]),
      this.viewConfirmedBooking,
    );
      this.routes.post(
      '/:id/delete',
      AuthenticationController.restrict(["member"]),
      this.handleOwnBookings,
    );
  }
  /**
   * Render the booking table of own bookings for the authenticated member.
   * 
   * @type {express.RequestHandler}
   */
  static viewMyBookings(req, res) {
    BookingDetailsModel.getByMemberId(req.authenticatedUser.id)
      .then((bookingDetails) => {
        res.render('bookings.ejs', {
          bookingDetails,
          authenticatedUser: req.authenticatedUser,
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).render('status.ejs', {
          status: 'Database error',
          message: 'Bookings could not be loaded.',
          authenticatedUser: req.authenticatedUser,
        });
      }); 
  }
  /**
   * This renders the selected session details for the member to cross check before booking
   * 
   * @type {express.RequestHandler}
   */
  static viewCreateBooking(req, res) {
    SessionDetailModel.getById(req.params.sessionId)
      .then((sessionDetail) => {
        res.render('booking_details.ejs', {
          sessionDetail,
          authenticatedUser: req.authenticatedUser,
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(404).render('status.ejs', {
          status: 'Session not found',
          message: 'The session you selected could not be loaded.',
          authenticatedUser: req.authenticatedUser,
        });
      }); 
  }
  /**
   * Render the confirmed booking made by the authenticated member user
   * 
   * @type {express.RequestHandler}
   */
  static viewConfirmedBooking(req, res) {
    BookingModel.getById(req.params.id)
      .then((booking) => {
        if (booking.userId != req.authenticatedUser.id) {
          res.status(403).render("status.ejs", {
            status: "Access forbidden",
            message: "You cannot view another member's booking.",
            authenticatedUser: req.authenticatedUser,
            });
          return;
        }
        SessionDetailModel.getById(booking.sessionId)
          .then((sessionDetail) => {
            res.render('booking_confirmed.ejs', {
              booking,
              sessionDetail,
              authenticatedUser: req.authenticatedUser,
            });
          })
          .catch((error) => {
            console.error(error);
            res.status(404).render('status.ejs', {
              status: 'Session not found',
              message: 'Your booked session details could not be loaded.',
              authenticatedUser: req.authenticatedUser,
            });
          }); 
      })
      .catch((error) => {
            console.error(error);
            res.status(404).render('status.ejs', {
              status: 'Booking not found',
              message: 'Your booking could not be loaded.',
              authenticatedUser: req.authenticatedUser,
            });
      }); 
  }
  /**
   * This renders the admin mangement page for bookings and has readable session and booking details
   * it also has the form dropdown data available.
   * 
   * @type {express.RequestHandler}
   */
  static viewBookingManagement(req, res) {
    const selectedBookingId = req.params.id;

    BookingDetailsModel.getAll()
      .then((bookingDetails) => {
        //search the list of all bookings
        const selectedBookingDetail = bookingDetails.find(
          (bookingDetail) => bookingDetail.booking.id == selectedBookingId,
        );
        const selectedBooking =
          selectedBookingDetail?.booking ??
          new BookingModel(
            null,
            "",
            "",
            "confirmed",
            0,
          );
      SessionDetailModel.getAll()
        .then((sessionDetails) => {
          UserModel.getAll()
            .then((users) => {
              const members = users.filter(
                (user) => user.role == "member",
              );
              res.render("management_bookings.ejs", {
                bookingDetails,
                selectedBooking,
                members,
                sessionDetails,
                authenticatedUser: req.authenticatedUser,
              });
            })
            .catch((error) => {
              console.error(error);
              res.status(500).render("status.ejs", {
                status: "Database error",
                message: "The members could not be loaded.",
                authenticatedUser: req.authenticatedUser,
              });
            });
        })
        .catch((error) => {
          console.error(error);
          res.status(500).render("status.ejs", {
            status: "Database error",
            message: "The session details could not be loaded.",
            authenticatedUser: req.authenticatedUser,
          });
        });
    })
      .catch((error) => {
        console.error(error);
        res.status(500).render('status.ejs', {
          status: 'Database error',
          message: 'The bookings could not be loaded',
          authenticatedUser: req.authenticatedUser,
        });
      });
  }
  /**
   * This handles the management of the bookings in the admin page for CREATE, Update and DELETE actions
   * 
   * @type {express.RequestHandler}
   */
  static handleBookingManagement(req, res) {
    const selectedBookingId = req.params.id;
    const formData = req.body;
    const action = formData.action;

    // this is the the new booking structure
    const booking = new BookingModel(
      selectedBookingId,
      formData.userId,
      formData.sessionId,
      formData.bookingStatus,
      0,
    );

    if (action === "create") {
    // this handles the validation of a booking and authenticated user and renders Booking through to the model
    // regex to ensure server-side validation is in place to avoid manula updates in the browser
     if (!/^[0-9]+$/.test(formData.userId)) { 
      res.status(400).render("status.ejs", {
        status: "Invalid input provided",
        message: "Please select a valid member.",
        authenticatedUser: req.authenticatedUser,
      });
      return;
    }
    if (!/^[0-9]+$/.test(formData.sessionId)) {
      res.status(400).render("status.ejs", {
        status: "Invalid input provided",
        message: "Please select a valid session.",
        authenticatedUser: req.authenticatedUser,
      });
      return;
    }
    if (!["confirmed", "cancelled"].includes(formData.bookingStatus)) {
      res.status(400).render("status.ejs", {
        status: "Invalid input provided",
        message: "Please select a booking status.",
        authenticatedUser: req.authenticatedUser,
      });
      return;
    }
    //this creates and returns the Booking on the admin Booking management page 
    //only if the member hasn't already booked into a session.
    BookingModel.getByMemberSession(
      formData.userId,
      formData.sessionId,
    )
      .then(() => {
        res.status(400).render("status.ejs", {
          status: "Booking already exists",
          message: "This member is already booked into this session.",
          authenticatedUser: req.authenticatedUser,
        });
      })
      .catch((error) => {
        if (error !== "not found") {
          console.error(error);
          res.status(500).render("status.ejs", {
            status: "Database error",
            message: "There was an issue checking whether this member already has this booking.",
            authenticatedUser: req.authenticatedUser,
          });
          return;
        }
        BookingModel.create(booking)
          .then(() => {
            res.redirect("/bookings/admin");
          })
          .catch((createError) => {
            console.error(createError);
            res.status(500).render("status.ejs", {
              status: "Database error",
              message: "The booking could not be created.",
              authenticatedUser: req.authenticatedUser,
            });
          });
      });
      } else if (action === "update") {
        if (!selectedBookingId) { // checking the nooking id exists
          res.status(400).render("status.ejs", {
            status: "Invalid booking ID",
            message: "Please select a valid booking to update.",
            authenticatedUser: req.authenticatedUser,
          });
          return;
        }
        BookingModel.getByMemberSession( // searching the member booking already exists
          formData.userId,
          formData.sessionId,
        )
          .then((existingBooking) => { // rejects the duplicate
            if (existingBooking.id != selectedBookingId) { // checks if it can proceed to update
              res.status(400).render("status.ejs", {
                status: "Booking already exists",
                message: "This member is already booked into this session.",
                authenticatedUser: req.authenticatedUser,
              });
              return;
            }
            BookingModel.update(booking) // saves to the database
              .then((result) => {
                if (result.affectedRows > 0) { //confirms update
                  res.redirect("/bookings/admin"); //redirects back to CRUD screen
                } else {
                  res.status(404).render("status.ejs", {
                    status: "Booking update error",
                    message: "The booking could not be found.",
                    authenticatedUser: req.authenticatedUser,
                  });
                }
              })
              .catch((error) => {
                console.error(error);
                res.status(500).render("status.ejs", {
                  status: "Database error",
                  message: "The booking could not be updated.",
                  authenticatedUser: req.authenticatedUser,
                });
              });
          })
          .catch((error) => {
            if (error === "not found") {
              BookingModel.update(booking)
                .then((result) => {
                  if (result.affectedRows > 0) {
                    res.redirect("/bookings/admin");
                  } else {
                    res.status(404).render("status.ejs", {
                      status: "Booking update error",
                      message: "The booking could not be found.",
                      authenticatedUser: req.authenticatedUser,
                    });
                  }
                })
                .catch((updateError) => {
                  console.error(updateError);
                  res.status(500).render("status.ejs", {
                    status: "Database error",
                    message: "The booking could not be updated.",
                    authenticatedUser: req.authenticatedUser,
                  });
                });
            } else {
              console.error(error); 
              res.status(500).render("status.ejs", {
                status: "Database error",
                message: "The booking could not be checked for duplicates.",
                authenticatedUser: req.authenticatedUser,
              });
            }
          });
      } else if (action === "delete") {
        BookingModel.delete(selectedBookingId)
          .then((result) => {
            if (result.affectedRows > 0) {
              res.redirect("/bookings/admin");
            } else {
              res.status(404).render("status.ejs", {
                status: "booking was not found",
                message: "The booking could not be found.",
                authenticatedUser: req.authenticatedUser,
              });
            }
          })
            .catch((error) => {
              console.error(error);
              res.status(500).render("status.ejs", {
                status: "Database error",
                message: "The Booking could not be deleted.",
                authenticatedUser: req.authenticatedUser,
              });
            });
    } else {
      res.status(400).render("status.ejs", {
        status: "The action is invalid",
        message: "This action does not work on the form",
        authenticatedUser: req.authenticatedUser,
      });
    }
  }
  /**
   * This handles the management of the Bookings from the authenicated member 
   * the page allows for CREATE and DELETE actions
   *
   * @type {express.RequestHandler}
   */
  static handleOwnBookings(req, res) {
    const selectedBookingId = req.params.id;
    const formData = req.body;
    const action = formData.action;

    const booking = new BookingModel(
      selectedBookingId,
      req.authenticatedUser.id, // this will force the member to attach to the booking
      formData.sessionId,
      "confirmed",
      0,
    );
    if (action === "create") {
    if (!/^[0-9]+$/.test(formData.sessionId)) {
      res.status(400).render('status.ejs', {
        status: 'Invalid input provided.',
        message: 'Please select a valid session',
        authenticatedUser: req.authenticatedUser,
      });
      return;
    }
    BookingModel.getByMemberSession(
      req.authenticatedUser.id,
      formData.sessionId,
    )
    .then(() => {
      res.status(400).render('status.ejs', {
        status: 'Booking already exists',
        message: 'You have already booked this session.',
        authenticatedUser: req.authenticatedUser,
      });
    })
    .catch(() => {
      BookingModel.create(booking)
        .then((result) => {
          if (result.affectedRows > 0) {
            res.redirect("/bookings/" + result.insertId);
        } else {
          res.status(500).render("status.ejs", {
            status: "Database error",
            message: "Your Booking could not be created.",
            authenticatedUser: req.authenticatedUser, 
          });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).render("status.ejs", {
          status: "Database error",
          message: "Your Booking could not be created.",
          authenticatedUser: req.authenticatedUser,
        });
      })
    });
    return;
    } else if (action === "delete") {
      BookingModel.deleteByMember(selectedBookingId, req.authenticatedUser.id,)
        .then((result) => {
          if (result.affectedRows > 0) {
            res.redirect("/bookings");
          } else {
            res.status(404).render("status.ejs", {
              status: "Booking was not found",
              message: "The Booking could not be found.",
              authenticatedUser: req.authenticatedUser,
            });
          }
        })
        .catch((error) => {
          console.error(error);
          res.status(500).render("status.ejs", {
            status: "Database error",
            message: "Your Booking could not be deleted.",
            authenticatedUser: req.authenticatedUser,
          });
        });
    } else {
      res.status(400).render("status.ejs", {
        status: "The action is invalid",
        message: "This action does not work on the form",
        authenticatedUser: req.authenticatedUser,
      });
    }
  }
}
