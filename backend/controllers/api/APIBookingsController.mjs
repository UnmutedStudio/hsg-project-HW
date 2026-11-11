import express from 'express';
import { BookingModel } from '../../models/BookingModel.mjs';
import { BookingDetailsModel } from '../../models/BookingDetailsModel.mjs';
import { DatabaseModel } from '../../models/DatabaseModel.mjs';
import { APIAuthenticationController } from './APIAuthenticationController.mjs';

export class APIBookingsController {
  static routes = express.Router();

  static {
    this.routes.get(
      '/',
      APIAuthenticationController.restrict(['member']),
      this.getBookings,
    );
    this.routes.get(
      '/xml',
      APIAuthenticationController.restrict(['member']),
      this.getBookingsXML,
    );
    this.routes.post(
      '/',
      APIAuthenticationController.restrict(['member']),
      this.createBooking,
    );
    this.routes.delete(
      "/:id",
      APIAuthenticationController.restrict(["member"]),
      this.deleteBooking,
    );
  }

  /**
   * return the booking details for the authenticated member.
   *
   * @type {express.RequestHandler}
   * @openapi
   * /api/bookings:
   *  get:
   *    summary: "Get bookings for the authenticated member"
   *    tags: [Bookings]
   *    security:
   *      - ApiKey: []
   *    parameters:
   *      - name: start_date
   *        in: query
   *        required: false
   *        schema:
   *          type: string
   *          format: date
   *      - name: end_date
   *        in: query
   *        required: false
   *        schema:
   *          type: string
   *          format: date
   *    responses:
   *      '200':
   *        description: "Member booking details"
   *        content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: "#/components/schemas/BookingDetails"
   *      '401':
   *        $ref: "#/components/responses/Error"
   *      '500':
   *        $ref: "#/components/responses/Error"
   */
  static async getBookings(req, res) {
    try { 
      let bookingDetails = await BookingDetailsModel.getByMemberId(
        req.authenticatedUser.id,
      );
      const dateFrom = req.query.start_date?.trim() ?? '';
      const dateTo = req.query.end_date?.trim() ?? '';
      if (dateFrom) {
        bookingDetails = bookingDetails.filter(
          (bookingDetail) =>
          bookingDetail.session.dateSession >=
          new Date(`${dateFrom}T00:00:00`),
        );
      }
      if (dateTo) {
        bookingDetails = bookingDetails.filter(
          (bookingDetail) =>
          bookingDetail.session.dateSession <=
          new Date(`${dateTo}T23:59:59`),
        );
      }
      res.status(200).json(bookingDetails);
    } catch (error) {
        console.error(error);
        res.status(500).json({
          message: "Bookings could not be loaded.",
          errors: [error],
        });
      }
  }
  /**
   * Handle exporting bookings for the authenticated member to XML
   *
   * @type {express.RequestHandler}
   * @openapi
   * /api/bookings/xml:
   *    get:
   *        summary: "Export the authenticated member's bookings to XML"
   *        tags: [Bookings]
   *        security:
   *          - ApiKey: []
   *        responses:
   *            '200':
   *                description: "Authenticated member bookings XML"
   *                content:
   *                  text/xml:
   *                    schema:
   *                      type: array
   *                      xml:
   *                        name: bookings  
   *                      items:
   *                        $ref: "#/components/schemas/BookingDetails"
   *            '401':
   *              $ref: "#/components/responses/Error"
   *            '500':
   *              $ref: "#/components/responses/Error"
   */
  static async getBookingsXML(req, res) {
    try {
      const date = DatabaseModel.toMySqlDate(new Date());
      const bookingDetails = await BookingDetailsModel.getByMemberId(
        req.authenticatedUser.id,
      );

      res
        .status(200)
        .contentType('text/xml')
        .render('xml/bookings.xml.ejs', { bookingDetails, date });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Failed to export bookings as XML from database',
        errors: [error],
      });
    }
  }

  /**
   * Handle creating a new booking
   *
   * @type {express.RequestHandler}
   * @openapi
   * /api/bookings:
   *  post:
   *    summary: "Create a new booking"
   *    tags: [Bookings]
   *    security:
   *      - ApiKey: []
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: "#/components/schemas/Booking"
   *    responses:
   *      '200':
   *        $ref: "#/components/responses/Created"
   *      '400':
   *        $ref: "#/components/responses/Error"
   *      '401':
   *        $ref: "#/components/responses/Error"
   *      '500':
   *        $ref: "#/components/responses/Error"
   */
  static async createBooking(req, res) {
    try {
      const booking = new BookingModel(
        null,
        req.authenticatedUser.id,
        req.body.sessionId,
        "confirmed",
        0,
      );
      const result = await BookingModel.create(booking);
      res.status(200).json({
        id: result.insertId,
        message: 'Booking created',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Failed to create booking.',
        errors: [error],
      });
    }
  }
  /**
   * Soft delete a booking belonging to the authenticated member.
   *
   * @type {express.RequestHandler}
   * @openapi
   * /api/bookings/{id}:
   *   delete:
   *     summary: "Delete a booking belonging to the authenticated member"
   *     tags: [Bookings]
   *     security:
   *       - ApiKey: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: number
   *           example: 1
   *     responses:
   *       '200':
   *         $ref: "#/components/responses/Updated"
   *       '401':
   *         $ref: "#/components/responses/Error"
   *       '403':
   *         $ref: "#/components/responses/Error"
   *       '404':
   *         $ref: "#/components/responses/NotFound"
   *       '500':
   *         $ref: "#/components/responses/Error"
   */
  static async deleteBooking(req, res) {
    try {
      const result = await BookingModel.deleteByMember(
        req.params.id,
        req.authenticatedUser.id,
      );
      if (result.affectedRows == 1) {
        res.status(200).json({
          message: "Booking deleted",
        });
      } else {
        res.status(404).json({
          message: "Booking not found or does not belong to this member",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to delete booking",
      });
    }
  }
}
