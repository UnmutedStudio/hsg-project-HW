import express from "express";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/UserModel.mjs";
import { AuthenticationController } from "./AuthenticationController.mjs";
/**
 * This User controller manages the users that are in the High st Gym app. 
 * It is for admin only CRUD operations for each user account.
 */
export class UserController {
  /**
   * this express router contains all the UserController routes
   */
  static routes = express.Router();
  static {
    //
    this.routes.get(
      "/",
      AuthenticationController.restrict(["admin"]),
      this.viewUserManagement,
    );
    this.routes.get(
      "/:id",
      AuthenticationController.restrict(["admin"]),
      this.viewUserManagement,
    );
    this.routes.post(
      "/",
      AuthenticationController.restrict(["admin"]),
      this.handleUserManagement,
    );
    this.routes.post(
      "/:id",
      AuthenticationController.restrict(["admin"]),
      this.handleUserManagement,
    );
  }
  /**
   * Implements getting the sign up page / view.
   * It will have a form that allows the user to enter first & last name and their email and password to become a member
   *
   * @type {express.RequestHandler}
   */
  static viewSignup(req, res) {
    res.render("signup.ejs", {
      authenticatedUser: req.authenticatedUser,
    });
  }
  /**
   * THis validates the sign up of a guest user and creates a new member account
   * 
   * @type {express.RequestHandler}
   */
  static async handleSignup(req, res) {
    const formData = req.body;
    if (!/^[a-zA-Z\-'\ ]{2,50}$/.test(formData.firstName)) {
      res.status(400).render("status.ejs", {
        status: "Invalid input provided",
        message: "Please enter a valid first name, containing only a-z,-,', with 2 to 50 characters.",
        authenticatedUser: req.authenticatedUser,
      });
      return;
    }
    if (!/^[a-zA-Z\-\'\ ]{2,50}$/.test(formData.lastName)) {
      res.status(400).render("status.ejs", {
        status: "Invalid input provided",
        message: "Please enter a valid last name, containing only a-z, -, ', with 2 to 50 characters.",
        authenticatedUser: req.authenticatedUser,
      });
      return;
    }
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      res.status(400).render("status.ejs", {
        status: "Invalid input provided.",
        message: "Please enter a valid email address.",
        authenticatedUser: req.authenticatedUser,
      });
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      res.status(400).render("status.ejs", {
        status: "Invalid input provided.",
        message: "Password must contain at least 8 characters, one upper case letter, one lowercase letter and one number",
        authenticatedUser: req.authenticatedUser,
      });
      return;
    } 
    if (formData.password !== formData.confirmPassword) {
      res.status(400).render("status.ejs", {
        status: "Passwords do not match",
        message: "Please enter the same password in both password fields.",
        authenticatedUser: req.authenticatedUser,
      });
      return;
    }
    try {
    await UserModel.getByAllEmail(formData.email.trim());

    res.status(400).render("status.ejs", {
      status: "Account already exists",
      message: "An account already exists for this email address.",
      authenticatedUser: req.authenticatedUser,
    });
  } catch (error) {
    if (error !== "not found") {
      console.error(error);

      res.status(500).render("status.ejs", {
        status: "Database error",
        message: "The account could not be created.",
        authenticatedUser: req.authenticatedUser,
      });
      return;
    }
    const passwordHash = bcrypt.hashSync(formData.password);
    const user = new UserModel(
      null,
      formData.firstName.trim(),
      formData.lastName.trim(),
      formData.email.trim(),
      passwordHash,
      "member",
      0,
    );
    UserModel.create(user)
      .then(() => {
        res.redirect("/login");
      })
      .catch((createError) => {
        console.error(createError);
        res.status(500).render("status.ejs", {
          status: "Database error",
          message: "The account could not be created.",
          authenticatedUser: req.authenticatedUser,
        });
      });
    }
  }
  /**
   * This renders the User management CRUD page for the admin role and has the option to select a user by ID 
   * 
   * @type {express.RequestHandler}
   */
  static viewUserManagement(req, res) {
    const selectedUserId = req.params.id;
    // this searches a list of all the users for the Id of the one user that has been selected
    UserModel.getAll()
      .then((users) => {
        const selectedUser =
          users.find((u) => u.id == selectedUserId) ??
          //uses an empty user object if no user is selected
          new UserModel(
            null,
            "",
            "",
            "",
            "",
            "",
            0,
          );
        res.render("management_users.ejs", {
          users,
          selectedUser,
          authenticatedUser: req.authenticatedUser,
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).render("status.ejs", {
            status: "Database error",
            message: "The user could not be loaded.",
            authenticatedUser: req.authenticatedUser,

          });
        });
  }
  /**
   * This handles CREATE, UPDATE and DELETE actions that are completed on the user management page
   * 
   */
  static handleUserManagement(req, res) {
    const selectedUserId = req.params.id;
    const formData = req.body;
    const action = formData.action;
    const passwordWasEntered =
      typeof formData.password === "string" &&
      formData.password.length > 0;
    if (!/^[a-zA-Z\-'\ ]{2,50}$/.test(formData.firstName)) {
      res.status(400).render("status.ejs", {
        status: "Invalid input provided",
        message: "Please enter a valid first name, containing only a-z,-,', with 2 to 50 characters.",
        authenticatedUser: req.authenticatedUser,
      });
      return;
    }
    if (!/^[a-zA-Z\-\'\ ]{2,50}$/.test(formData.lastName)) {
      res.status(400).render("status.ejs", {
        status: "Invalid input provided",
        message: "Please enter a valid last name, containing only a-z, -, ', with 2 to 50 characters.",
        authenticatedUser: req.authenticatedUser,
      });
      return;
    }
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      res.status(400).render("status.ejs", {
        status: "Invalid input provided.",
        message: "Please enter a valid email address.",
        authenticatedUser: req.authenticatedUser,
      });
      return;
    }
    if ( (action === "create" || passwordWasEntered) && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password,)
    ) {
      res.status(400).render("status.ejs", {
        status: "Invalid input provided.",
        message: "Password must contain at least 8 characters, one upper case letter, one lowercase letter and one number",
        authenticatedUser: req.authenticatedUser,
      });
      return;
    }
    if (!["member", "trainer", "admin"].includes(formData.role,)
    ) {
      res.status(400).render("status.ejs", {
        status: "Invalid input provided.",
        message: "Please enter a valid role",
        authenticatedUser: req.authenticatedUser,
      });
      return;
    }

    const user = new UserModel(
      selectedUserId,
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.password,
      formData.role,
      0,
    );
    //We need to hash the password if it is not hashed
    if (passwordWasEntered && !user.passwordHash.startsWith("$2b")) {
      user.passwordHash = bcrypt.hashSync(user.passwordHash);
    }
    if (action === "create") {
      UserModel.create(user)
        .then((result) => {
          res.redirect("/users");
        })
        .catch((error) => {
          res.status(500).render("status.ejs", {
            status: "Database error",
            message: "The user could not be created.",
            authenticatedUser: req.authenticatedUser,
          });
        });
    } else if (action === "update") {
      if (!selectedUserId) {
        res.status(400).render("status.ejs", {
          status: "Invalid user ID",
          message: "Please select a valid user to update.",
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      UserModel.getById(selectedUserId)
        .then((existingUser) => {
          if (!passwordWasEntered) {
            user.passwordHash = existingUser.passwordHash;
          }
      return UserModel.update(user); })
        .then((result) => {
          if (result.affectedRows > 0) {
            res.redirect("/users");
          } else {
            res.status(404).render("status.ejs", {
              status: "User update error",
              message: "The user could not be found.",
              authenticatedUser: req.authenticatedUser,
            });
          }
        })
        .catch((error) => {
          console.error(error);
          res.status(500).render("status.ejs", {
            status: "Database error",
            message: "The user could not be updated",
            authenticatedUser: req.authenticatedUser,
          });
        });
    } else if (action === "delete") {
      UserModel.delete(user.id)
        .then((result) => {
          if (result.affectedRows > 0) {
            res.redirect("/users");
          } else {
            res.status(500).render("status.ejs", {
              status: "user delete error",
              message: "The user could not be found.",
              authenticatedUser: req.authenticatedUser,
            });
          }
        })
        .catch((error) => {
          console.error(error);
          res.status(500).render("status.ejs", {
            status: "Database error",
            message: "The user could not be deleted.",
            authenticatedUser: req.authenticatedUser,
          });
        });
    } else {
      res.status(500).render("status.ejs", {
        status: "Invalid action",
        message: "The form doesn't support this action.",
        authenticatedUser: req.authenticatedUser,
      });
    }
  }
}
