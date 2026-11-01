import express from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import * as ApiValidator from "express-openapi-validator";
import { APIAuthenticationController } from "./APIAuthenticationController.mjs";
import { APISessionsController } from "./APISessionsController.mjs";

const options = {
  failOnErrors: true,
  definition: {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Minute Coffee API",
      description:
        "JSON REST API for interacting with the minute coffee backend",
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
    //TODO: set up docs pages
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
    //TODO: set up validator
    this.routes.use(
      ApiValidator.middleware({
        apiSpec: specification,
        validateRequests: true,
        validateResponses: true,
      }),
    );

    //TODO: set up error response handling (in JSON format)
    this.routes.use((err, req, res, next) => {
      res.status(err.status || 500).json({
        message: err.message,
        errors: err.errors,
      });
    });

    //API Authentication middleware and routes
    this.routes.use(APIAuthenticationController.middleware);
    this.routes.use(APIAuthenticationController.routes);
    this.routes.use("/sessions", APISessionsController.routes);
  }
}
