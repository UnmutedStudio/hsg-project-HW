import express from 'express';
import { BlogPostModel } from '../models/BlogPostModel.mjs';
import { AuthenticationController } from './AuthenticationController.mjs';
/**
 * This controller is for managing and displayin gthe blog posts for HIgh St Gym application.
 */
export class BlogPostController {
  /**
   * 
   * This express router contains all BlogPostController routes
   */
  static routes = express.Router();
  static {
    this.routes.get('/', this.viewBlogPostList); // /blog posts/
    this.routes.get(
      '/create',
      AuthenticationController.restrict(['member', 'trainer']),
      this.viewCreateBlogPost,
    );
    this.routes.post(
      '/create',
      AuthenticationController.restrict(['member', 'trainer']),
      this.createBlogPost,
    );
    this.routes.post(
      '/:id/delete',
      AuthenticationController.restrict(['member', 'trainer']),
      this.deleteOwnBlogPost,
    );
    this.routes.get(
      '/admin',
      AuthenticationController.restrict(['admin']),
      this.viewBlogPostManagement,
    );
    this.routes.get(
      '/admin/:id',
      AuthenticationController.restrict(['admin']),
      this.viewBlogPostManagement,
    );
    this.routes.post(
      '/admin',
      AuthenticationController.restrict(['admin']),
      this.handleBlogPostManagement,
    );
    this.routes.post(
      '/admin/:id',
      AuthenticationController.restrict(['admin']),
      this.handleBlogPostManagement,
    );  
  }
  /**
   * Render the blog posts page, optionally filtered by a search term.
   * 
   * @type {express.RequestHandler}
   */
  static viewBlogPostList(req, res) {
    if (req.query.search_term) {
      BlogPostModel.getBySearch(req.query.search_term)
        .then((blogPosts) => {
          res.render('blog_post_list.ejs', {
            blogPosts,
            authenticatedUser: req.authenticatedUser,
          });
        })
        .catch((error) => {
          console.error(error);
          res.status(500).render('status.ejs', {
            status: 'Database error',
            message: 'Blog posts could not be loaded.',
            authenticatedUser: req.authenticatedUser,
          });
        });  
    } else {
      BlogPostModel.getAll()
        .then((blogPosts) => {
          res.render('blog_post_list.ejs', {
            blogPosts,
            authenticatedUser: req.authenticatedUser,
          });
        })
        .catch((error) => {
          console.error(error);
          res.status(500).render('status.ejs', {
            status: 'Database error',
            message: 'Blog posts could not be loaded.',
            authenticatedUser: req.authenticatedUser,
          });
        }); 
    }
  }
  /**
   * This renders the form that creates a new blog post
   *
   * @type {express.RequestHandler}
   */
  static viewCreateBlogPost(req, res) {
    res.render('blog_post_create.ejs', {
      authenticatedUser: req.authenticatedUser,
    });
  }
  /**
   * This validates the form that is submitted and creates a new post in the blog
   *
   * @type {express.RequestHandler}
   */
  static createBlogPost(req, res) {
    const formData = req.body;
    if (
      typeof formData.title !== 'string' ||
      formData.title.trim().length === 0 ||
      formData.title.trim().length > 100 ||
      /["*:<>?\/\\|{}]/.test(formData.title)
    ) {
      res.status(400).render('status.ejs', {
        status: 'Invalid input provided.',
        message: 'Please enter a title between 1 and 100 characters. Do not use these characters: " * : < > ? / \ | { }.',
        authenticatedUser: req.authenticatedUser,
      });
      return;
    }
    if (
      typeof formData.content !== 'string' ||
      formData.content.trim().length === 0 ||
      formData.content.trim().length > 1000 ||
      /["*:<>?\/\\|{}]/.test(formData.content)
    ) {
      res.status(400).render('status.ejs', {
        status: 'Invalid input provided.',
        message: 'Please ensure the content is between 1 and 1000 characters. " * : < > ? / \ | { }',
        authenticatedUser: req.authenticatedUser,
      });
      return;
    }
    // this is the the new blog post structure
    const blogPost = new BlogPostModel(
      null,
      formData.title.trim(),
      formData.content.trim(),
      req.authenticatedUser.id,
      new Date(),
      0,
    );

    //this now passes the validated post and authenticated user and handles the post through to the model
    // and returns the new post on the blog page
    BlogPostModel.create(blogPost)
      .then(() => {
        res.redirect('/blog-posts');
      })
      .catch((error) => {
        console.error(error);
        res.status(500).render('status.ejs', {
          status: 'Failed to create blog post.',
          message:
            'There was an issue creating the post - please contact the admin at High Street Gym.',
          authenticatedUser: req.authenticatedUser,
        });
      });
  }
  /**
   * This deletes a blog post if the user is authenticated and is the owner of the post
   * @type {express.RequestHandler}
   */
  static deleteOwnBlogPost(req, res) {
    BlogPostModel.getById(req.params.id)
      .then((blogPost) => {
        if (blogPost.userId !== req.authenticatedUser.id) {
          res.status(403).render('status.ejs', {
            status: 'Access is forbidden',
            message: 'You can only delete your own blog posts',
            authenticatedUser: req.authenticatedUser,
          });
          return;
        }
        BlogPostModel.delete(blogPost.id)
          .then((result) => {
            if (result.affectedRows > 0) {
              res.redirect('/blog-posts');
            } else {
              res.status(404).render('status.ejs', {
                status: 'Blog post not found',
                message:
                  'The Blog Post could not be deleted as it does not exist.',
                authenticatedUser: req.authenticatedUser,
              });
            }
          })
          .catch((error) => {
            console.error(error);
            res.status(500).render('status.ejs', {
              status: 'Database error',
              message:
                'There was an issue deleting the post - please contact the admin at High Street Gym.',
              authenticatedUser: req.authenticatedUser,
            });
          });
      })
      .catch((error) => {
        console.error(error);
        res.status(404).render('status.ejs', {
          status: 'Blog post not found',
          message:
            'The Blog Post could not be deleted as it does not exist or the ID may be incorrect.',
          authenticatedUser: req.authenticatedUser,
        });
      });
  }
  /**
   * This renders the admin mangement page for Blog posts and has the option 
   * to select a post by using the Id in the URL
   * 
   * @type {express.RequestHandler}
   */
  static viewBlogPostManagement(req, res) {
    const selectedBlogPostId = req.params.id;

    BlogPostModel.getAll()
      .then((blogPosts) => {
        //search the list of all blog posts
        const selectedBlogPost =
          blogPosts.find((blogPost) => blogPost.id == selectedBlogPostId,) ??
          //undefined if we cannot find a post with the id
          //in the url params (it could be that the id in the
          //url params is not present)
          new BlogPostModel(
            null,
            "",
            "",
            req.authenticatedUser.id,
            new Date(),
            0,
          );
        res.render("management_blog_posts.ejs", {
          blogPosts,
          selectedBlogPost,
          authenticatedUser: req.authenticatedUser,
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).render('status.ejs', {
          status: 'Database error',
          message: 'The blog post could not be loaded',
          authenticatedUser: req.authenticatedUser,
        });
      });
  }
  /**
   * This handles the management of the Blog posts in the admin page for CREATE and DELETE actions
   * @type {express.RequestHandler}
   */
  static handleBlogPostManagement(req, res) {
    const selectedBlogPostId = req.params.id;
    const formData = req.body;
    const action = formData.action;

    if (action === "create") {
    if (
      typeof formData.title !== 'string' ||
      formData.title.trim().length === 0 ||
      formData.title.trim().length > 100 ||
      /["*:<>?\/\\|{}]/.test(formData.title)
    ) {
      res.status(400).render('status.ejs', {
        status: 'Invalid input provided.',
        message: 'Please enter a title between 1 and 100 characters. Do not use these characters: " * : < > ? / \ | { }.',
        authenticatedUser: req.authenticatedUser,
      });
      return;
    }
    if (
      typeof formData.content !== 'string' ||
      formData.content.trim().length === 0 ||
      formData.content.trim().length > 1000 ||
      /["*:<>?\/\\|{}]/.test(formData.content)
    ) {
      res.status(400).render('status.ejs', {
        status: 'Invalid input provided.',
        message: 'Please ensure the content is between 1 and 1000 characters. Do not use these characters: " * : < > ? / \ | { }.',
        authenticatedUser: req.authenticatedUser,
      });
      return;
    }
    // this is the the new blog post structure
    const blogPost = new BlogPostModel(
      null,
      formData.title.trim(),
      formData.content.trim(),
      req.authenticatedUser.id,
      new Date(),
      0,
    );
    // this handles the validated post and authenticated user and renders post through to the model
    // and returns the new post on the admin blog post dashboard
      BlogPostModel.create(blogPost)
        .then(() => {
          res.redirect('/blog-posts/admin');
        })
        .catch((error) => {
          console.error(error);
          res.status(500).render('status.ejs', {
            status: 'Error in the database',
            message: 'The blog post was not able to be created',
            authenticatedUser: req.authenticatedUser,
          });
        });
    } else if (action === "delete") {
      if (!selectedBlogPostId) {
        res.status(400).render("status.ejs", {
          status: "Blog post was ID was not valid",
          message: "A valid blog post must be selected to delete",
          authenticatedUser: req.authenticatedUser,
        });
        return;
      }
      BlogPostModel.delete(selectedBlogPostId)
        .then((result) => {
          if (result.affectedRows > 0) {
            res.redirect("/blog-posts/admin");
          } else {
            res.status(404).render("status.ejs", {
              status: "Blog post was not found",
              message: "The Blog post could not be found.",
              authenticatedUser: req.authenticatedUser,
            });
          }
        })
        .catch((error) => {
          console.error(error);
          res.status(500).render("status.ejs", {
            status: "Database error",
            message: "The Blog post could not be deleted.",
            authenticatedUser: req.authenticatedUser,
          });
        });
    } else {
      res.status(400).render("status.ejs", {
        status: "The action is invalid",
        message: "This action does not work on the form",
        authenticatedUser: req.authenticatedUser,
      });
    }
  }
}
