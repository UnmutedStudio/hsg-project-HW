import express from "express";
import { APIAuthenticationController } from "./APIAuthenticationController.mjs";

export class APIUserController {
  static routes = express.Router();

  static {
    this.routes.get(
      "/self",
      APIAuthenticationController.restrict("any"),
      this.getAuthenticatedUser,
    );
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
}
