import express from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import * as ApiValidator from "express-openapi-validator";
import { APIAuthenticationController } from "./APIAuthenticationController.mjs";
import { APISessionsController } from "./APISessionsController.mjs";
import { APIBookingsController } from "./APIBookingsController.mjs";
import { APIUserController } from "./APIUserController.mjs";

const options = {
  failOnErrors: true,
  definition: {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "High Street Gym API",
      description:
        "JSON REST API for interacting with the High Street Gym backend",
    },
    components: {
      securitySchemes: {
        ApiKey: {
          type: "apiKey",
          in: "header",
          name: "x-auth-key",
        },
      },
    },
  },
  apis: ["./controllers/**/*.{js,mjs,yaml}", "./components.yaml"],
};
const specification = swaggerJSDoc(options);

export class APIController {
  static routes = express.Router();

  static {
    //Swagger API documentation
    /**
     * @openapi
     * /api/docs:
     *  get:
     *    summary: "View automatically generated documentation pages"
     *    tags: [Documentation]
     *    responses:
     *      '200':
     *        description: "The documentation page"
     */
    this.routes.use("/docs", swaggerUI.serve, swaggerUI.setup(specification));
    //Validate API requests and responses against the OpenAPI
    this.routes.use(
      ApiValidator.middleware({
        apiSpec: specification,
        validateRequests: true,
        validateResponses: true,
      }),
    );

    //API Authentication middleware and routes
    this.routes.use(APIAuthenticationController.middleware);
    this.routes.use(APIAuthenticationController.routes);
    this.routes.use("/sessions", APISessionsController.routes);
    this.routes.use("/bookings", APIBookingsController.routes);
    this.routes.use("/users", APIUserController.routes);

    //API error response handling
    this.routes.use((err, req, res, next) => {
      res.status(err.status || 500).json({
        message: err.message,
        errors: err.errors,
      });
    });
  }
}
