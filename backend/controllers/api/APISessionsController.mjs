import express from "express";
import { SessionModel } from "../../models/SessionModel.mjs";
import { APIAuthenticationController } from "./APIAuthenticationController.mjs";
import { SessionDetailModel } from "../../models/SessionDetailModel.mjs";

export class APISessionsController {
  static routes = express.Router();

  static {
    this.routes.get("/", this.getSessions);
    this.routes.get("/:id", this.getSessionById);
    this.routes.post(
      "/",
      APIAuthenticationController.restrict(["admin"]),
      this.createSession,
    );
    this.routes.patch(
      "/:id",
      APIAuthenticationController.restrict(["admin"]),
      this.updateSession,
    );
    this.routes.delete(
      "/:id",
      APIAuthenticationController.restrict(["admin"]),
      this.deleteSession,
    );
  }

  /**
   * @type {express.RequestHandler}
   * @openapi
   *  /api/sessions:
   *    post:
   *      summary: "Create a new session"
   *      tags: [Sessions]
   *      security:
   *        - ApiKey: []
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              $ref: "#/components/schemas/Session"
   *      responses:
   *        '200':
   *          $ref: "#/components/responses/Created"
   *        '500':
   *          $ref: "#/components/responses/Error"
   *        default:
   *          $ref: "#/components/responses/Error"
   */
  static async createSession(req, res) {
    try {
      const session = new SessionModel(
        req.body.id,
        req.body.activityId,
        req.body.locationId,
        req.body.trainerId,
        req.body.dateSession,
        req.body.timeSession,
        req.body.duration,
        req.body.availability,
        req.body.deleted ?? 0,
      );

      const result = await SessionModel.create(session);
      res.status(200).json({
        id: result.insertId,
        message: "Session created",
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to create session",
        errors: [error],
      });
    }
  }

  /**
   * @type {express.RequestHandler}
   * @openapi
   *  /api/sessions:
   *    get:
   *      summary: "Get the list of all sessions"
   *      tags: [Sessions]
   *      parameters:
   *        - name: filter
   *          in: query
   *          description: Search filter on activity, trainer and location details
   *          required: false
   *          schema:
   *            type: string
   *            example: yoga
   *      responses:
   *        '200':
   *          description: "Session list"
   *          content:
   *            application/json:
   *              schema:
   *                type: array
   *                items:
   *                  $ref: "#/components/schemas/Session"
   *        '500':
   *          $ref: "#/components/responses/Error"
   */
  static async getSessions(req, res) {
    try {
      const sessions = req.query.filter
        ? await SessionDetailModel.getBySearch(req.query.filter)
        : await SessionDetailModel.getAll();
      res.status(200).json(sessions);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to load sessions from database",
      });
    }
  }

  /**
   * @type {express.RequestHandler}
   * @openapi
   *  /api/sessions/{id}:
   *    get:
   *      summary: "Get a specific session by ID"
   *      tags: [Sessions]
   *      parameters:
   *        - name: id
   *          in: path
   *          description: Session ID
   *          required: true
   *          schema:
   *            type: number
   *            example: 1
   *      responses:
   *        '200':
   *          description: Session details including the related activity, location and trainer
   *          content:
   *            application/json:
   *              schema:
   *                $ref: "#/components/schemas/Session"
   *        '500':
   *          $ref: "#/components/responses/Error"
   *        '404':
   *          $ref: "#/components/responses/NotFound"
   *
   */
  static async getSessionById(req, res) {
    try {
      const session = await SessionDetailModel.getById(req.params.id);
      res.status(200).json(session);
    } catch (error) {
      //TODO: Handle not found
      if (error == "not found") {
        res.status(404).json({
          message: "Session not found",
        });
      } else {
        console.error(error);
        res.status(500).json({
          message: "Failed to load session from database",
        });
      }
    }
  }

  /**
   * @type {express.RequestHandler}
   * @openapi
   * /api/sessions/{id}:
   *   patch:
   *     summary: "Update an existing session"
   *     tags: [Sessions]
   *     security:
   *       - ApiKey: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: number
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/Session"
   *     responses:
   *       '200':
   *         $ref: "#/components/responses/Updated"
   *       '404':
   *         $ref: "#/components/responses/NotFound"
   *       '500':
   *         $ref: "#/components/responses/Error"
   */
  static async updateSession(req, res) {
    try {
      const session = new SessionModel(
        req.params.id,
        req.body.activityId,
        req.body.locationId,
        req.body.trainerId,
        req.body.dateSession,
        req.body.timeSession,
        req.body.duration,
        req.body.availability,
        req.body.deleted ?? 0,
      );
      const result = await SessionModel.update(session);

      if (result.affectedRows == 1) {
        res.status(200).json({
          message: "Session updated",
        });
      } else {
        res.status(404).json({
          message: "Session not found - update failed",
          errors: ["not found", "update failed"],
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to update session",
        errors: [error],
      });
    }
  }

  /**
   * @type {express.RequestHandler}
   * @openapi
   * /api/sessions/{id}:
   *   delete:
   *     summary: "Delete an existing session"
   *     tags: [Sessions]
   *     security:
   *       - ApiKey: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: number
   *     responses:
   *       '200':
   *         description: "Session deleted"
   *       '404':
   *         $ref: "#/components/responses/NotFound"
   *       '500':
   *         $ref: "#/components/responses/Error"
   */
  static async deleteSession(req, res) {
    try {
      const result = await SessionModel.delete(req.params.id);

      if (result.affectedRows == 1) {
        res.status(200).json({
          message: "Session deleted",
        });
      } else {
        res.status(404).json({
          message: "Session not found - delete failed",
          errors: ["not found", "delete failed"],
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete session - database error",
        errors: [error],
      });
    }
  }
}
