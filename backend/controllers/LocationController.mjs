import express from "express";
import { LocationModel } from "../models/LocationModel.mjs";
import { AuthenticationController } from "./AuthenticationController.mjs";
/**
 * This location controller manages the locations that are in the High st Gym app. 
 * It handles administrator only create, Read, update and delete (CRUD) operations for each location record.
 */
export class LocationController {
  /**
   * This express router contains all LocationController routes
   */
  static routes = express.Router();
  static {
    this.routes.get(
      "/",
      AuthenticationController.restrict(["admin"]),
      this.viewLocationManagement,
    );
    this.routes.get(
      "/:id",
      AuthenticationController.restrict(["admin"]),
      this.viewLocationManagement,
    );
    this.routes.post(
      "/",
      AuthenticationController.restrict(["admin"]),
      this.handleLocationManagement,
    );
    this.routes.post(
      "/:id",
      AuthenticationController.restrict(["admin"]),
      this.handleLocationManagement,
    );
  }
  /**
   * This renders the location management page for administrators
   * It has the option to select an location by ID in the URL
   * 
   * @type {express.RequestHandler}
   */
  static viewLocationManagement(req, res) {
    const selectedLocationId = req.params.id;
    const searchTerm = req.query.search_term?.trim() ?? "";
    const locationQuery = searchTerm
      ? LocationModel.getBySearch(searchTerm)
      : LocationModel.getAll();
    // Searches the list of all locations for the selected locatioN
    locationQuery
      .then((locations) => {
        const locationFilters = [];
        for (const location of locations) {
          if (!locationFilters.includes(location.locationName)) {
            locationFilters.push(location.locationName);
          }
        }
        const selectedLocationFilter =
          req.query.location_filter?.trim() ?? '';

        if (selectedLocationFilter) {
          locations = locations.filter(
            (location) =>
              location.locationName === selectedLocationFilter,
          );
        }
        const sortOrder = req.query.sort ?? "default";
          if (sortOrder === "location_asc") {
            locations.sort((a, b) =>
              a.locationName.localeCompare(b.locationName),
            );
          }

          if (sortOrder === "location_desc") {
            locations.sort((a, b) =>
              b.locationName.localeCompare(a.locationName),
            );
          }

          if (sortOrder === "address_asc") {
            locations.sort((a, b) =>
              a.locationAddress.localeCompare(b.locationAddress),
            );
          }

          if (sortOrder === "address_desc") {
            locations.sort((a, b) =>
              b.locationAddress.localeCompare(a.locationAddress),
            );
          }
        const selectedLocation =
          locations.find((location) => location.id == selectedLocationId) ??
          //uses an empty location object if no location is selected
          new LocationModel(
            null,
            "",
            "",
            0,
          );
        res.render("management_locations.ejs", {
          locations,
          selectedLocation,
          locationFilters,
          selectedLocationFilter,
          authenticatedUser: req.authenticatedUser,
          sortOrder,
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).render("status.ejs", {
            status: "Database error",
            message: "The locations could not be loaded.",
            authenticatedUser: req.authenticatedUser,
        });
      });
  }
  /**
   * This handles CREATE, UPDATE and DELETE actions that are completed on the location management page
   * 
   * @type {express.RequestHandler}
   */
  static handleLocationManagement(req, res) {
    const selectedLocationId = req.params.id;
    const formData = req.body;
    const action = formData.action;

    if (!/^[a-zA-Z0-9 ]{2,50}$/.test(formData.locationName)) {
      res.status(400).render("status.ejs", {
        status: "Invalid input provided",
        message: "Please enter a valid location name, containing only 2 to 50 alphanumeric characters.",
        authenticatedUser: req.authenticatedUser,
      });
      return;
    }
    if (!/^[^<>{}]{2,200}$/.test(formData.locationAddress)) {
      res.status(400).render("status.ejs", {
        status: "Invalid input provided",
        message:
          "Please enter a valid location address between 2 and 200 characters.",
        authenticatedUser: req.authenticatedUser,
      });
      return;
    }
    const location = new LocationModel(
      selectedLocationId,
      formData.locationName,
      formData.locationAddress,
      0,
    );
    if (action === "create") {
      LocationModel.create(location)
        .then(() => {
          res.redirect("/locations");
        })
        .catch((error) => {
          console.error(error);
          res.status(500).render("status.ejs", {
            status: "Database error",
            message: "The location could not be created.",
            authenticatedUser: req.authenticatedUser,
          });
        });
    } else if (action === "update") {
      LocationModel.update(location)
        .then((result) => {
          if (result.affectedRows > 0) {
            res.redirect("/locations");
          } else {
            res.status(500).render("status.ejs", {
              status: "location update error",
              message: "The location could not be found.",
              authenticatedUser: req.authenticatedUser,
            });
          }
        })
        .catch((error) => {
          console.error(error);
          res.status(500).render("status.ejs", {
            status: "Database error",
            message: "The location could not be updated",
            authenticatedUser: req.authenticatedUser,
          });
        });
    } else if (action === "delete") {
      LocationModel.delete(location.id)
        .then((result) => {
          if (result.affectedRows > 0) {
            res.redirect("/locations");
          } else {
            res.status(500).render("status.ejs", {
              status: "location delete error",
              message: "The location could not be found.",
              authenticatedUser: req.authenticatedUser,
            });
          }
        })
        .catch((error) => {
          console.error(error);
          res.status(500).render("status.ejs", {
            status: "Database error",
            message: "The location could not be deleted.",
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
