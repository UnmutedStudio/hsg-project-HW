import express from "express";
import bcrypt from "bcryptjs";
import { UserModel } from "../../models/UserModel.mjs";
import { APIAuthenticationController } from "./APIAuthenticationController.mjs";

export class APIUserController {
  static routes = express.Router();

  static {
    this.routes.post("/", this.createUser);
    this.routes.get(
      "/self",
      APIAuthenticationController.restrict("any"),
      this.getAuthenticatedUser,
    );
    this.routes.patch(
      "/self",
      APIAuthenticationController.restrict("any"),
      this.updateAuthenticatedUser,
    );
  }
  /**
   * Register a new user
   *
   * @type {express.RequestHandler}
   * @openapi
   * /api/users:
   *   post:
   *     summary: "Register a new member account"
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/UserRegistration"
   *     responses:
   *       '200':
   *         $ref: "#/components/responses/Created"
   *       '400':
   *         $ref: "#/components/responses/Error"
   *       '500':
   *         $ref: "#/components/responses/Error"
   */
  static async createUser(req, res) {
    const formData = req.body;
    if (!/^[a-zA-Z\-'\ ]{2,50}$/.test(formData.firstName)) {
      res.status(400).json({
        message:
          "Please enter a valid first name containing 2 to 50 letters, spaces, hyphens or apostrophes.",
      });
      return;
    }
    if (!/^[a-zA-Z\-'\ ]{2,50}$/.test(formData.lastName)) {
      res.status(400).json({
        message:
          "Please enter a valid last name containing 2 to 50 letters, spaces, hyphens or apostrophes.",
      });
      return;
    }
    if (
      !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
        formData.email,
      )
    ) {
      res.status(400).json({
        message: "Please enter a valid email address.",
      });
      return;
    }
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(
        formData.password,
      )
    ) {
      res.status(400).json({
        message:
          "Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number.",
      });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      res.status(400).json({
        message: "Passwords do not match.",
      });
      return;
    }
    try {
      await UserModel.getByAllEmail(formData.email.trim());
      res.status(400).json({
        message: "An account already exists for this email address.",
      });
    } catch (error) {
      if (error !== "not found") {
        console.error(error);
        res.status(500).json({
          message: "The account could not be created.",
        });
        return;
      }
      try {
        const passwordHash = bcrypt.hashSync(formData.password);

        const user = new UserModel(
          null,
          formData.firstName.trim(),
          formData.lastName.trim(),
          formData.email.trim(),
          passwordHash,
          "member",
          0,
          null,
        );
        const result = await UserModel.create(user);
        res.status(200).json({
          id: result.insertId,
          message: "Member account created",
        });
      } catch (createError) {
        console.error(createError);
        res.status(500).json({
          message: "The account could not be created.",
        });
      }
    }
  }
  /**
   * Handle getting a user by their current authentication key
   * @type {express.RequestHandler}
   * @openapi
   * /api/users/self:
   *    get:
   *        summary: "Get user by current authentication key"
   *        tags: [Users]
   *        security:
   *            - ApiKey: []
   *        responses:
   *            '200':
   *                description: "User with provided authentication key"
   *                content:
   *                    application/json:
   *                        schema:
   *                            $ref: "#/components/schemas/User"
   *            '401':
   *                $ref: "#/components/responses/Error"
   *            '500':
   *                $ref: "#/components/responses/Error"
   *
   */
  static async getAuthenticatedUser(req, res) {
    res.status(200).json(req.authenticatedUser);
  }
  /**
   * Update personal details for the authenticated user.
   *
   * @type {express.RequestHandler}
   * @openapi
   * /api/users/self:
   *   patch:
   *     summary: "Update personal details for the authenticated user"
   *     tags: [Users]
   *     security:
   *       - ApiKey: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - firstName
   *               - lastName
   *               - email
   *             properties:
   *               firstName:
   *                 type: string
   *                 example: "Han"
   *               lastName:
   *                 type: string
   *                 example: "Solo"
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "han.solo@member.com"
   *     responses:
   *       '200':
   *         $ref: "#/components/responses/Updated"
   *       '400':
   *         $ref: "#/components/responses/Error"
   *       '401':
   *         $ref: "#/components/responses/Error"
   *       '500':
   *         $ref: "#/components/responses/Error"
   */
  static async updateAuthenticatedUser(req, res) {
    try {
      const formData = req.body;
      if (!/^[a-zA-Z\-'\ ]{2,50}$/.test(formData.firstName)) {
        res.status(400).json({
          message:
            "Please enter a valid first name containing 2 to 50 letters, spaces, hyphens or apostrophes.",
        });
        return;
      }
      if (!/^[a-zA-Z\-'\ ]{2,50}$/.test(formData.lastName)) {
        res.status(400).json({
          message:
            "Please enter a valid last name containing 2 to 50 letters, spaces, hyphens or apostrophes.",
        });
        return;
      }
      if (
        !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
          formData.email,
        )
      ) {
        res.status(400).json({
          message: "Please enter a valid email address.",
        });
        return;
      }
      const passwordWasEntered =
        typeof formData.password === "string" &&
        formData.password.length > 0;

      // Validate the new password only when one was entered
      if (
        passwordWasEntered &&
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(
          formData.password,
        )
      ) {
        res.status(400).json({
          message:
            "Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number.",
        });
        return;
      }
      // Confirm both new password fields match
      if (
        passwordWasEntered &&
        formData.password !== formData.confirmPassword
      ) {
        res.status(400).json({
          message: "Passwords do not match.",
        });
        return;
      }
      const user = await UserModel.getById(req.authenticatedUser.id);
      user.firstName = formData.firstName.trim();
      user.lastName = formData.lastName.trim();
      user.email = formData.email.trim();
      if (passwordWasEntered) {
        user.passwordHash = bcrypt.hashSync(formData.password);
      }

      const result = await UserModel.update(user);
      if (result.affectedRows > 0) {
        res.status(200).json({
          message: "Profile updated",
        });
      } else {
        res.status(404).json({
          message: "User not found",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to update profile",
      });
    }
  }
}
