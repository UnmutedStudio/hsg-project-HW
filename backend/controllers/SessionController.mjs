import express from 'express';
import { SessionModel } from '../models/SessionModel.mjs';
import { SessionDetailModel } from '../models/SessionDetailModel.mjs';
import { BookingModel } from '../models/BookingModel.mjs';
import { BookingDetailsModel } from '../models/BookingDetailsModel.mjs';
import { AuthenticationController } from './AuthenticationController.mjs';
import { ActivityModel } from '../models/ActivityModel.mjs';
import { LocationModel } from '../models/LocationModel.mjs';
import { UserModel } from '../models/UserModel.mjs';

/**
 * This controller is for managing and displaying the session timetable for High St Gym application.
 * It will help render the different operations for different users.
 */
export class SessionController {
  /**
   * This express router contains all SessionController routes
   */
  static routes = express.Router();
  static {
    // Guest and member timetable
    this.routes.get('/', this.viewSessionTimetable);

    // Trainers (own) sessions
    this.routes.get(
      '/trainer',
      AuthenticationController.restrict(['trainer']),
      this.viewTrainerSessions,
    );
    this.routes.get(
      '/trainer/:id',
      AuthenticationController.restrict(['trainer']),
      this.viewTrainerSessions,
    );
    this.routes.post(
      '/trainer',
      AuthenticationController.restrict(['trainer']),
      this.handleTrainerSessions,
    );
    this.routes.post(
      '/trainer/:id',
      AuthenticationController.restrict(['trainer']),
      this.handleTrainerSessions,
    );

    // Admin session management
    this.routes.get(
      '/admin',
      AuthenticationController.restrict(['admin']),
      this.viewSessionManagement,
    );
    this.routes.get(
      '/admin/:id',
      AuthenticationController.restrict(['admin']),
      this.viewSessionManagement,
    );
    this.routes.post(
      '/admin',
      AuthenticationController.restrict(['admin']),
      this.handleSessionManagement,
    );
    this.routes.post(
      '/admin/:id',
      AuthenticationController.restrict(['admin']),
      this.handleSessionManagement,
    );
  }
  /**
   * Render the session time table for members and guest users.
   *
   * @type {express.RequestHandler}
   */
  static viewSessionTimetable(req, res) {
    SessionDetailModel.getAll()
      .then((sessionDetails) => {
        if (req.authenticatedUser && req.authenticatedUser.role === 'member') {
          BookingDetailsModel.getByMemberId(req.authenticatedUser.id)
            .then((bookings) => {
              res.render('session_timetable.ejs', {
                sessionDetails,
                bookings,
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
        } else {
          res.render('session_timetable.ejs', {
            sessionDetails,
            bookings: [],
            authenticatedUser: req.authenticatedUser,
          });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).render('status.ejs', {
          status: 'Database error',
          message: 'Sessions could not be loaded.',
          authenticatedUser: req.authenticatedUser,
        });
      });
  }
  /**
   * Render the trainer session time table for the authenticated user
   *
   * @type {express.RequestHandler}
   */
  static viewTrainerSessions(req, res) {
    const selectedSessionId = req.params.id;
    SessionDetailModel.getByTrainerId(req.authenticatedUser.id)
      .then((sessionDetails) => {
        const selectedSessionDetail = sessionDetails.find(
          (sessionDetail) => sessionDetail.session.id == selectedSessionId,
        );
        const selectedSession =
          selectedSessionDetail?.session ??
          new SessionModel(
            null,
            null,
            null,
            req.authenticatedUser.id,
            null,
            '',
            0,
            0,
            0,
          );
        ActivityModel.getAll()
          .then((activities) => {
            LocationModel.getAll()
              .then((locations) => {
                res.render('management_trainer_sessions.ejs', {
                  sessionDetails,
                  selectedSession,
                  activities,
                  locations,
                  authenticatedUser: req.authenticatedUser,
                });
              })
              .catch((error) => {
                console.error(error);
                res.status(500).render('status.ejs', {
                  status: 'Database error',
                  message: 'The locations could not be loaded.',
                  authenticatedUser: req.authenticatedUser,
                });
              });
          })
          .catch((error) => {
            console.error(error);
            res.status(500).render('status.ejs', {
              status: 'Database error',
              message: 'The activities could not be loaded.',
              authenticatedUser: req.authenticatedUser,
            });
          });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).render('status.ejs', {
          status: 'Database error',
          message: 'Trainer sessions could not be loaded.',
          authenticatedUser: req.authenticatedUser,
        });
      });
  }
  /**
   * This renders the admin mangement page for sessions with readable data
   *
   * @type {express.RequestHandler}
   */
  static viewSessionManagement(req, res) {
    const selectedSessionId = req.params.id;
    SessionDetailModel.getAll()
      .then((sessionDetails) => {
        //search the list of all sessions
        const selectedSessionDetail = sessionDetails.find(
          (sessionDetail) => sessionDetail.session.id == selectedSessionId,
        );
        //undefined if we cannot find a session with the id
        //in the url params (it could be that the id in the
        //url params is not present)
        const selectedSession =
          selectedSessionDetail?.session ??
          new SessionModel(null, '', '', '', '', '', 0, 0, 0);
        ActivityModel.getAll()
          .then((activities) => {
            LocationModel.getAll()
              .then((locations) => {
                UserModel.getAll()
                  .then((users) => {
                    const trainers = users.filter(
                      (user) => user.role == 'trainer',
                    );
                    res.render('management_sessions.ejs', {
                      sessionDetails,
                      selectedSession,
                      activities,
                      locations,
                      trainers,
                      authenticatedUser: req.authenticatedUser,
                    });
                  })
                  .catch((error) => {
                    console.error(error);

                    res.status(500).render('status.ejs', {
                      status: 'Database error',
                      message: 'The trainers could not be loaded.',
                      authenticatedUser: req.authenticatedUser,
                    });
                  });
              })
              .catch((error) => {
                console.error(error);

                res.status(500).render('status.ejs', {
                  status: 'Database error',
                  message: 'The locations could not be loaded.',
                  authenticatedUser: req.authenticatedUser,
                });
              });
          })
          .catch((error) => {
            console.error(error);

            res.status(500).render('status.ejs', {
              status: 'Database error',
              message: 'The activities could not be loaded.',
              authenticatedUser: req.authenticatedUser,
            });
          });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).render('status.ejs', {
          status: 'Database error',
          message: 'The sessions could not be loaded',
          authenticatedUser: req.authenticatedUser,
        });
      });
  }
  /**
   * This handles the management of the sessions in the admin page for CREATE, Update and DELETE actions
   *
   * @type {express.RequestHandler}
   */
  static handleSessionManagement(req, res) {
    const selectedSessionId = req.params.id;
    const formData = req.body;
    const action = formData.action;

    // this is the the new session structure
    const session = new SessionModel(
      selectedSessionId,
      formData.activityId,
      formData.locationId,
      formData.trainerId,
      formData.dateSession,
      formData.timeSession,
      formData.duration,
      formData.availability,
      0,
    );
    if (action === 'create') {
      if (!formData.activityId) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Please select an activity for the session.',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      if (!formData.locationId) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Please select a location for the session.',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      if (!formData.dateSession) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Please ensure a date is selected for the session',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      const sessionDate = new Date(formData.dateSession + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(sessionDate.getTime()) || sessionDate < today) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'The session date cannot be before today.',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      // time exists
      if (!formData.timeSession) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Please selected a time for the session',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      // then validate time is not in the past
      const sessionDateTime = new Date(
      `${formData.dateSession}T${formData.timeSession}`
      );
      // testing the time validation
      //  console.log("Session:", sessionDateTime);
      // console.log("Now:", new Date());
      if (sessionDateTime < new Date()) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'The session cannot be scheduled in the past.',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      if (
        !/^[0-9]+$/.test(formData.availability) ||
        Number(formData.availability) <= 0
      ) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Availability must be a number greater than 0',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      if (
        !/^[0-9]+$/.test(formData.duration) ||
        Number(formData.duration) <= 0
      ) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Duration must be a number greater than 0',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      SessionModel.getByLocationDateTime(
        formData.locationId,
        formData.dateSession,
        formData.timeSession,
      )
        .then(() => {
          res.status(400).render('status.ejs', {
            status: 'Duplicate session already exists',
            message:"There is a session already created with this location, date and time.",
            authenticatedUser: req.authenticatedUser,
          });
        })
        .catch((error) => {
          if (error !== 'not found') {
            console.error(error);
            res.status(500).render('status.ejs', {
              status: 'Database error',
              message: 'The session could not be checked for duplicates.',
              authenticatedUser: req.authenticatedUser,
            });
            return;
          }
          // this handles the validated session and authenticated user and renders session through to the model
          // and returns the session on the admin session management page
          SessionModel.create(session)
            .then(() => {
              res.redirect('/sessions/admin');
            })
            .catch((createError) => {
              console.error(createError);
              res.status(500).render('status.ejs', {
                status: 'Database error',
                message: 'The session could not be created.',
                authenticatedUser: req.authenticatedUser,
              });
            });
        });
    } else if (action === 'update') {
            if (!formData.activityId) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Please select an activity for the session.',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      if (!formData.locationId) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Please select a location for the session.',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      if (!formData.dateSession) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Please ensure a date is selected for the session',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      const sessionDate = new Date(formData.dateSession + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(sessionDate.getTime()) || sessionDate < today) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'The session date cannot be before today.',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      if (!formData.timeSession) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Please selected a time for the session',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      const sessionDateTime = new Date(
        `${formData.dateSession}T${formData.timeSession}`
      );
      if (sessionDateTime < new Date()) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'The session cannot be scheduled in the past.',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      if (
        !/^[0-9]+$/.test(formData.availability) ||
        Number(formData.availability) <= 0
      ) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Availability must be a number greater than 0',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      if (
        !/^[0-9]+$/.test(formData.duration) ||
        Number(formData.duration) <= 0
      ) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Duration must be a number greater than 0',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      SessionModel.getDuplicateForUpdate(
        formData.locationId,
        formData.dateSession,
        formData.timeSession,
        selectedSessionId,
      )
      .then(() => {
        res.status(400).render("status.ejs", {
          status: "Duplicate session already exists",
          message: "There is a session already created with this location, date and time.",
          authenticatedUser: req.authenticatedUser,
        });
      })
      .catch((error) => {
        if (error !== "not found") {
          console.error(error);
          res.status(500).render("status.ejs", {
            status: "Database error",
            message: "The session could not be checked for duplicates.",
            authenticatedUser: req.authenticatedUser,
          });
          return;
        }
        SessionModel.update(session)
          .then((result) => {
            if (result.affectedRows > 0) {
              res.redirect('/sessions/admin');
            } else {
              res.status(404).render('status.ejs', {
                status: 'Session update error',
                message: 'The session could not be found.',
                authenticatedUser: req.authenticatedUser,
              });
            }
          })
          .catch((error) => {
            console.error(error);
            res.status(500).render('status.ejs', {
              status: 'Database error',
              message: 'The session could not be updated',
              authenticatedUser: req.authenticatedUser,
            });
          });
      });
    } else if (action === 'delete') {
      if (!selectedSessionId) {
        res.status(400).render('status.ejs', {
          status: 'Session ID was not valid',
          message: 'A valid session must be selected to delete',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      BookingModel.cancelBySessionId(selectedSessionId)
        // .then((bookingResult) => {
        //   console.log(
        //     "Bookings cancelled:",
        //     bookingResult.affectedRows,
        //   );

        //   return SessionModel.delete(selectedSessionId);
        // })
        .then(() => {
          return SessionModel.delete(selectedSessionId);
        })
        .then((result) => {
          if (result.affectedRows > 0) {
            res.redirect('/sessions/admin');
          } else {
            res.status(404).render('status.ejs', {
              status: 'Session was not found',
              message: 'The session could not be found.',
              authenticatedUser: req.authenticatedUser,
            });
          }
        })
        .catch((error) => {
          console.error(error);

          res.status(500).render('status.ejs', {
            status: 'Database error',
            message: 'The session could not be deleted.',
            authenticatedUser: req.authenticatedUser,
          });
        });
    } else {
      res.status(400).render('status.ejs', {
        status: 'The action is invalid',
        message: 'This action does not work on the form',
        authenticatedUser: req.authenticatedUser,
      });
    }
  }
  /**
   * This the management of the sessions from the authenicated trainer
   * the page allows for CREATE, Update and DELETE actions
   *
   * @type {express.RequestHandler}
   */
  static handleTrainerSessions(req, res) {
    const selectedSessionId = req.params.id;
    const formData = req.body;
    const action = formData.action;

    const session = new SessionModel(
      selectedSessionId,
      formData.activityId,
      formData.locationId,
      req.authenticatedUser.id, // this will force the trainer ownership
      formData.dateSession,
      formData.timeSession,
      formData.duration,
      formData.availability,
      0,
    );

    // same validation as admin but redirect to trainer route
    if (action === 'create') {
      if (!formData.activityId) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Please select an activity for the session.',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      if (!formData.locationId) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Please select a location for the session.',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      if (!formData.dateSession) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Please ensure a date is selected for the session',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      // validating date is equal or greater than today
      const sessionDate = new Date(formData.dateSession + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(sessionDate.getTime()) || sessionDate < today) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'The session date cannot be before today.',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      if (!formData.timeSession) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Please selected a time for the session',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      const sessionDateTime = new Date(
      `${formData.dateSession}T${formData.timeSession}`
      );
      // testing the time validation
      //  console.log("Session:", sessionDateTime);
      // console.log("Now:", new Date());
      if (sessionDateTime < new Date()) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'The session cannot be scheduled in the past.',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      if (
        !/^[0-9]+$/.test(formData.availability) ||
        Number(formData.availability) <= 0
      ) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Availability must be a number greater than 0',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      if (
        !/^[0-9]+$/.test(formData.duration) ||
        Number(formData.duration) <= 0
      ) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Duration must be a number greater than 0',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      SessionModel.getByLocationDateTime(
        formData.locationId,
        formData.dateSession,
        formData.timeSession,
      )
      .then(() => {
        res.status(400).render("status.ejs", {
          status: "Duplicate session already exists",
          message:
            "There is a session already created with this location, date and time.",
          authenticatedUser: req.authenticatedUser,
        });
      })
      .catch((error) => {
        if (error !== "not found") {
          console.error(error);
          res.status(500).render("status.ejs", {
            status: "Database error",
            message: "The session could not be checked for duplicates.",
            authenticatedUser: req.authenticatedUser,
          });
          return;
        }
        SessionModel.create(session)
          .then(() => {
            res.redirect("/sessions/trainer");
          })
          .catch((createError) => {
            console.error(createError);
            res.status(500).render("status.ejs", {
              status: "Database error",
              message: "The session could not be created.",
              authenticatedUser: req.authenticatedUser,
            });
          });
      });
    } else if (action === 'update') {
      if (!formData.activityId) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Please select an activity for the session.',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      if (!formData.locationId) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Please select a location for the session.',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      if (!formData.dateSession) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Please ensure a date is selected for the session',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      const sessionDate = new Date(formData.dateSession + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(sessionDate.getTime()) || sessionDate < today) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'The session date cannot be before today.',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      if (!formData.timeSession) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Please selected a time for the session',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      const sessionDateTime = new Date(
      `${formData.dateSession}T${formData.timeSession}`
      )
      if (sessionDateTime < new Date()) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'The session cannot be scheduled in the past.',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      if (
        !/^[0-9]+$/.test(formData.availability) ||
        Number(formData.availability) <= 0
      ) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Availability must be a number greater than 0',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      if (
        !/^[0-9]+$/.test(formData.duration) ||
        Number(formData.duration) <= 0
      ) {
        res.status(400).render('status.ejs', {
          status: 'Invalid input provided.',
          message: 'Duration must be a number greater than 0',
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      SessionModel.getDuplicateForUpdate(
        formData.locationId,
        formData.dateSession,
        formData.timeSession,
        selectedSessionId,
      )
      .then(() => {
        res.status(400).render("status.ejs", {
          status: "Duplicate session already exists",
          message: "There is a session already created with this location, date and time.",
          authenticatedUser: req.authenticatedUser,
        });
      })
      .catch((error) => {
        if (error !== "not found") {
          console.error(error);
          res.status(500).render("status.ejs", {
            status: "Database error",
            message: "The session could not be checked for duplicates.",
            authenticatedUser: req.authenticatedUser,
          });
          return;
        }
        SessionModel.update(session)
          .then((result) => {
            if (result.affectedRows > 0) {
              res.redirect('/sessions/trainer');
            } else {
              res.status(404).render('status.ejs', {
                status: 'Session update error',
                message: 'The session could not be found.',
                authenticatedUser: req.authenticatedUser,
              });
            }
          })
          .catch((error) => {
            console.error(error);
            res.status(500).render('status.ejs', {
              status: 'Database error',
              message: 'The session could not be updated',
              authenticatedUser: req.authenticatedUser,
            });
          });
      });
    } else if (action === 'delete') {
      SessionModel.deleteByTrainer(selectedSessionId, req.authenticatedUser.id)
        .then((result) => {
          if (result.affectedRows > 0) {
            res.redirect('/sessions/trainer');
          } else {
            res.status(404).render('status.ejs', {
              status: 'Session was not found',
              message: 'The session could not be found.',
              authenticatedUser: req.authenticatedUser,
            });
          }
        })
        .catch((error) => {
          console.error(error);
          res.status(500).render('status.ejs', {
            status: 'Database error',
            message: 'Your session could not be deleted.',
            authenticatedUser: req.authenticatedUser,
          });
        });
    } else {
      res.status(400).render('status.ejs', {
        status: 'The action is invalid',
        message: 'This action does not work on the form',
        authenticatedUser: req.authenticatedUser,
      });
    }
  }
}
