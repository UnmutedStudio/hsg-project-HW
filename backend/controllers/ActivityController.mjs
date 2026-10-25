import express from 'express';
import { ActivityModel } from '../models/ActivityModel.mjs';
import { AuthenticationController } from './AuthenticationController.mjs';
/**
 * This Activity controller manages the activities that are in the High st Gym app.
 * It handles administrator only create, Read, update and delete (CRUD) operations for each activity record.
 */
export class ActivityController {
  /**
   * This express router contains all ActivityController routes
   */
  static routes = express.Router();
  static {
    this.routes.get(
      '/',
      AuthenticationController.restrict(['admin']),
      this.viewActivityManagement,
    );
    this.routes.get(
      '/:id',
      AuthenticationController.restrict(['admin']),
      this.viewActivityManagement,
    );
    this.routes.post(
      '/',
      AuthenticationController.restrict(['admin']),
      this.handleActivityManagement,
    );
    this.routes.post(
      '/:id',
      AuthenticationController.restrict(['admin']),
      this.handleActivityManagement,
    );
  }
  /**
   * This renders the Activity management page for administrators
   * It has the option to select an activity by ID in the URL
   *
   * @type {express.RequestHandler}
   */
  static viewActivityManagement(req, res) {
    const selectedActivityId = req.params.id;
    const searchTerm = req.query.search_term?.trim() ?? '';
    const activityQuery = searchTerm
      ? ActivityModel.getBySearch(searchTerm)
      : ActivityModel.getAll();
    // Searches the list of all activites for the selected activity
    activityQuery
      .then((activities) => {
        const activityFilters = [];
          for (const activity of activities) {
            if (!activityFilters.includes(activity.activityName)) {
              activityFilters.push(activity.activityName);
            }
          }
        const selectedActivityFilter =
          req.query.activity_filter?.trim() ?? '';
        if (selectedActivityFilter) {
          activities = activities.filter(
            (activity) =>
              activity.activityName === selectedActivityFilter,
          );
        }  
        const sortOrder = req.query.sort ?? 'default';
        if (sortOrder === 'activity_asc') {
          activities.sort((a, b) =>
            a.activityName.localeCompare(b.activityName),
          );
        }
        if (sortOrder === 'activity_desc') {
          activities.sort((a, b) =>
            b.activityName.localeCompare(a.activityName),
          );
        }
        if (sortOrder === 'description_asc') {
          activities.sort((a, b) =>
            a.activityDescription.localeCompare(b.activityDescription),
          );
        }
        if (sortOrder === 'description_desc') {
          activities.sort((a, b) =>
            b.activityDescription.localeCompare(a.activityDescription),
          );
        }
        const selectedActivity =
          activities.find((activity) => activity.id == selectedActivityId) ??
          //uses an empty activity object if no activity is selected
          new ActivityModel(null, '', '', 0);
        res.render('management_activities.ejs', {
          activities,
          activityFilters,
          selectedActivityFilter,
          selectedActivity,
          authenticatedUser: req.authenticatedUser,
          sortOrder,
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).render('status.ejs', {
          status: 'Database error',
          message: 'The activities could not be loaded.',
          authenticatedUser: req.authenticatedUser,
        });
      });
  }
  /**
   * This handles CREATE, UPDATE and DELETE actions that are completed on the Activity management page
   *
   * @type {express.RequestHandler}
   */
  static handleActivityManagement(req, res) {
    const selectedActivityId = req.params.id;
    const formData = req.body;
    const action = formData.action;

    if (!/^[a-zA-Z0-9 ]{2,50}$/.test(formData.activityName)) {
      res.status(400).render('status.ejs', {
        status: 'Invalid input provided',
        message:
          'Please enter a valid activity name, containing only 2 to 50 alphanumeric characters.',
        authenticatedUser: req.authenticatedUser,
      });
      return;
    }
    if (!/^[^<>{}]{2,200}$/.test(formData.activityDescription)) {
        res.status(400).render('status.ejs', {
        status: 'Invalid input provided',
        message:
          'Please enter a valid activity description, between 2 and 200 characters without without using <, >, { or }.',
        authenticatedUser: req.authenticatedUser,
      });
      return;
    }
    const activity = new ActivityModel(
      selectedActivityId,
      formData.activityName,
      formData.activityDescription,
      0,
    );
    if (action === 'create') {
      ActivityModel.create(activity)
        .then(() => {
          res.redirect('/activities');
        })
        .catch((error) => {
          console.error(error);
          res.status(500).render('status.ejs', {
            status: 'Database error',
            message: 'The activity could not be created.',
            authenticatedUser: req.authenticatedUser,
          });
        });
    } else if (action === 'update') {
      ActivityModel.update(activity)
        .then((result) => {
          if (result.affectedRows > 0) {
            res.redirect('/activities');
          } else {
            res.status(500).render('status.ejs', {
              status: 'Activity update error',
              message: 'The activity could not be found.',
              authenticatedUser: req.authenticatedUser,
            });
          }
        })
        .catch((error) => {
          console.error(error);
          res.status(500).render('status.ejs', {
            status: 'Database error',
            message: 'The activity could not be updated',
            authenticatedUser: req.authenticatedUser,
          });
        });
    } else if (action === 'delete') {
      ActivityModel.delete(activity.id)
        .then((result) => {
          if (result.affectedRows > 0) {
            res.redirect('/activities');
          } else {
            res.status(500).render('status.ejs', {
              status: 'Activity delete error',
              message: 'The activity could not be found.',
              authenticatedUser: req.authenticatedUser,
            });
          }
        })
        .catch((error) => {
          console.error(error);
          res.status(500).render('status.ejs', {
            status: 'Database error',
            message: 'The Activity could not be deleted.',
            authenticatedUser: req.authenticatedUser,
          });
        });
    } else {
      res.status(500).render('status.ejs', {
        status: 'Invalid action',
        message: "The form doesn't support this action.",
        authenticatedUser: req.authenticatedUser,
      });
    }
  }
}
