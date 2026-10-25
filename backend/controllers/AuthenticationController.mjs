import express from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/UserModel.mjs";
/**
 * THis controller authenticates users who are accessing the high street gym applicaton
 * 
 */
export class AuthenticationController {
  /**
   * this express router uses authentication middleware
   */
  static middleware = express.Router();
  /**
   * this express routher contains all the AuthenticationController routes.
   */
  static routes = express.Router();
  static {
    this.middleware.use(
      session({
        secret: "5af36f38-7dfb-43b3-aefe-b9c7fd4562c3",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: "auto" },
      }),
    );
    this.middleware.use(this.#session_authentication);

    this.routes.get("/", this.viewAuthenticate);
    this.routes.post("/", this.handleAuthenticate);

    this.routes.delete("/", this.handleDeauthenticate);
    this.routes.get("/logout", this.handleDeauthenticate);
  }
  /**
   * This is a middleware function it loads the authenticated user from the database 
   * from an existing user id that is active in the current session
   *
   * @type {express.RequestHandler}
   *
   */
  static async #session_authentication(req, res, next) {
    if (req.session.userId && !req.authenticatedUser) {
      try {
        req.authenticatedUser = await UserModel.getById(req.session.userId);
      } catch (error) {
        console.error(error);
      }
    }
    next();
  }

  /**
   * Implements getting the login page / view. It will have a form that allows the user to enter their email and password
   *
   * @type {express.RequestHandler}
   */
  static viewAuthenticate(req, res) {
    res.render("login.ejs", {
      authenticatedUser: req.authenticatedUser,
    });
  }

  /**
   * Handles the login process, checks the body for an email and password, then attempts to find a matching user in the database.
   * If password verification is successful the user ID will be stored in the session, enabling the server to remember that the user has logged in.
   *
   * @type {express.RequestHandler}
   */
  static async handleAuthenticate(req, res) {
    const email = req.body.email;
    const password = req.body.password;
      try {
        const user = await UserModel.getByEmail(email);
        const isCorrectPassword = await bcrypt.compare(
          password,
          user.passwordHash,
        );
      if (isCorrectPassword) {  
        req.session.userId = user.id;
        if (user.role === "admin") {
          res.redirect("/admin");
          } else if (user.role === "trainer") {
          res.redirect("/trainer");
          } else {
          res.redirect("/dashboard");
          }
      } else {
        res.status(401).render("status.ejs", {
          status: "Authenticate failed",
          message: "Invalid credentials",
        });
      }
    } catch (error) {
      if (error == "not found") {
        res.status(401).render("status.ejs", {
          status: "Authenticate failed",
          message: "Invalid credentials",
        });
      } else {
        console.log(error);
        res.status(500).render("status.ejs", {
          status: "Database error",
          message: "Authentication failed",
        });
      }
    }
  }
  /**
   * Handles the logging out the current user by clearing their session
   * @type {express.RequestHandler}
   *
   */
  static handleDeauthenticate(req, res) {
    if (req.authenticatedUser) {
      if (req.session.userId) {
        req.session.destroy();
        res.status(200).render("status.ejs", {
          status: "Logged out",
          message: "You have been logged out",
        });
      }
    } else {
      res.status(401).render("status.ejs", {
        status: "Unautheticated",
        message: "Please login to access the requested page.",
      });
    }
  }
  /**
   * This is a middleware building function (i.e. a higher order function - meaning that it will build and return another function as a result.)
   *
   * We use this function to restrict specific routes in various controllers.
   *
   * @param {Array<string>} allowedRoles | this specifies which roles are allowed access
   * @returns {express.RequestHandler}
   */
  static restrict(allowedRoles) {
    return function (req, res, next) {
      if (req.authenticatedUser) {
        if (allowedRoles.includes(req.authenticatedUser.role)) {
          next();
        } else {
          res.status(403).render("status.ejs", {
            status: "Access forbidden",
            message: "Role does not have access to the requested resource.",
          });
        }
      } else {
        res.status(401).render("status.ejs", {
          status: "Unauthenticated",
          message: "Please login to access the requested page",
        });
      }
    };
  }
}
