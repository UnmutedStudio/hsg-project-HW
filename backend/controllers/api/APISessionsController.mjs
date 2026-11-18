import express from "express";
import { SessionModel } from "../../models/SessionModel.mjs";
import { APIAuthenticationController } from "./APIAuthenticationController.mjs";
import { SessionDetailModel } from "../../models/SessionDetailModel.mjs";
import { DatabaseModel } from "../../models/DatabaseModel.mjs";

export class APISessionsController {
  static routes = express.Router();

  static {
    this.routes.get("/",
       APIAuthenticationController.restrict(["member", "trainer"]),
    this.getSessions
    );
    this.routes.get("/xml",
      APIAuthenticationController.restrict(["trainer"]),
      this.getSessionsXML,
    );
    this.routes.get("/trainer", 
      APIAuthenticationController.restrict(["trainer"]),
      this.getTrainerSessions,
    );
    this.routes.get("/:id",
      APIAuthenticationController.restrict(["member", "trainer"]), 
      this.getSessionById,
    );
    this.routes.delete(
      "/:id",
      APIAuthenticationController.restrict(["trainer"]),
      this.deleteSession,
    );
  }

  /**
   * @type {express.RequestHandler}
   * @openapi
   *  /api/sessions:
   *    get:
   *      summary: "Get the list of all sessions"
   *      tags: [Sessions]
   *      security:
   *        - ApiKey: []
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
   *                  $ref: "#/components/schemas/SessionDetails"
   *        '401':
   *          $ref: "#/components/responses/Unauthorised" 
   *        '403':
   *          $ref: "#/components/responses/Forbidden"
   *        '500':
   *          $ref: "#/components/responses/ServerError"
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
   * Return sessions that belong to the authenticated trainer.
   * @type {express.RequestHandler}
   * @openapi
   *  /api/sessions/trainer:
   *    get:
   *      summary: "Get sessions for the authenticated trainer"
   *      tags: [Sessions]
   *      security:
   *        - ApiKey: []
   *      responses:
   *        '200':
   *          description: "Authenticated trainer session details"
   *          content:
   *            application/json:
   *              schema:
   *                type: array
   *                items:
   *                  $ref: "#/components/schemas/SessionDetails"
   *        '401':
   *          $ref: "#/components/responses/Unauthorised"
   *        '403':
   *          $ref: "#/components/responses/Forbidden"
   *        '500':
   *          $ref: "#/components/responses/ServerError"
   */
  static async getTrainerSessions(req, res) {
    try {
      const sessionDetails = await SessionDetailModel.getByTrainerId(
        req.authenticatedUser.id,
      );
    res.status(200).json(sessionDetails);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to load trainer sessions",
      });
    }
  }

  /**
   *Export future sessions for the authenticated trainer to XML.
   *
   * @type {express.RequestHandler}
   * @openapi
   * /api/sessions/xml:
   *    get:
   *        summary: "Export future sessions for the authenticated trainer to XML"
   *        tags: [Sessions]
   *        security:
   *          - ApiKey: []
   *        responses:
   *            '200':
   *                description: "Authenticated trainer future sessions XML"
   *                content:
   *                  text/xml:
   *                    schema:
   *                      type: array
   *                      xml:
   *                        name: sessions  
   *                      items:
   *                        $ref: "#/components/schemas/SessionDetails"
   *            '401':
   *              $ref: "#/components/responses/Unauthorised"
   *            '403':
   *              $ref: "#/components/responses/Forbidden"
   *            '500':
   *              $ref: "#/components/responses/ServerError"
   */
  static async getSessionsXML(req, res) {
    try {
      const date = DatabaseModel.toMySqlDate(new Date());
      
      let sessionDetails = await SessionDetailModel.getByTrainerId(
        req.authenticatedUser.id,
      );
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      sessionDetails = sessionDetails.filter(
          (sessionDetail) => 
            new Date (sessionDetail.session.dateSession) >= today,
      );
      res
        .status(200)
        .contentType('text/xml')
        .render('xml/sessions.xml.ejs', { sessionDetails, date });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Failed to export sessions as XML from database',
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
   *      security:
   *        - ApiKey: []
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
   *                $ref: "#/components/schemas/SessionDetails"
   *        '401':
   *          $ref: "#/components/responses/Unauthorised"
   *        '403':
   *          $ref: "#/components/responses/Forbidden"
   *        '404':
   *          $ref: "#/components/responses/SessionNotFound"
   *        '500':
   *          $ref: "#/components/responses/ServerError"
   *
   */
  static async getSessionById(req, res) {
    try {
      const session = await SessionDetailModel.getById(req.params.id);
      res.status(200).json(session);
    } catch (error) {
      //TODO: Handle not found
      if (error === "not found") {
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
   *         $ref: "#/components/responses/SessionDeleted"
   *       '401':
   *         $ref: "#/components/responses/Unauthorised"
   *       '403':
   *         $ref: "#/components/responses/Forbidden"
   *       '404':
   *         $ref: "#/components/responses/NotFound"
   *       '500':
   *         $ref: "#/components/responses/ServerError"
   */
  static async deleteSession(req, res) {
    try {
    const sessionDetail = await SessionDetailModel.getById(
      req.params.id,
    );
    if (
      sessionDetail.session.trainerId !==req.authenticatedUser.id){
      res.status(403).json({
        message: "You can only cancel your own sessions",
      });
      return;
    }
    const result = await SessionModel.delete(req.params.id);

      if (result.affectedRows == 1) {
        res.status(200).json({
          message: "Session deleted",
        });
      } else {
        res.status(404).json({
          message: "Session not found - delete failed",
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete session - database error",
      });
    }
  }
}
