import express from 'express';
import { BlogPostModel } from '../../models/BlogPostModel.mjs';
import { BlogPostDetailModel } from '../../models/BlogPostDetailModel.mjs';
import { APIAuthenticationController } from "./APIAuthenticationController.mjs";
/**
 * This controller is for managing and displayin gthe blog posts for HIgh St Gym application.
 */
export class APIBlogPostsController {
  static routes = express.Router();
  
  static {
    this.routes.get("/", this.getBlogPosts);

    this.routes.post(
        "/",
        APIAuthenticationController.restrict(["member", "trainer", "admin"]),
        this.createBlogPost,
    );

    this.routes.delete(
        "/:id",
        APIAuthenticationController.restrict(["member", "trainer", "admin"]),
        this.deleteBlogPost,
    );
  }

  /**
   * Create a blog post for the authenticated user.
   * @type {express.RequestHandler}
   * @openapi
   *  /api/blog-posts:
   *    post:
   *      summary: "Create a new blog post"
   *      tags: [Blog Posts]
   *      security:
   *        - ApiKey: []
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              $ref: "#/components/schemas/BlogPost"
   *      responses:
   *        '200':
   *          $ref: "#/components/responses/Created"
   *        '500':
   *          $ref: "#/components/responses/Error"
   *        default:
   *          $ref: "#/components/responses/Error"
   */
  static async createBlogPost(req, res) {
    try {
      const formData = req.body;
        if (
          typeof formData.title !== "string" ||
          formData.title.trim().length === 0 ||
          formData.title.trim().length > 100 ||
          /["*:<>?\/\\|{}]/.test(formData.title)
        ) {
          res.status(400).json({
            message:
              'Please enter a title between 1 and 100 characters. Do not use these characters: " * : < > ? / \\ | { }.',
          });
          return;
        }
        if (
          typeof formData.content !== "string" ||
          formData.content.trim().length === 0 ||
          formData.content.trim().length > 1000 ||
          /["*:<>?\/\\|{}]/.test(formData.content)
        ) {
          res.status(400).json({
            message:
              'Please ensure the content is between 1 and 1000 characters. Do not use these characters: " * : < > ? / \\ | { }.',
          });
          return;
        }
      const blogPost = new BlogPostModel(
        null,
        req.body.title.trim(),
        req.body.content.trim(),
        req.authenticatedUser.id,
        new Date(),
        0,
      );
      const result = await BlogPostModel.create(blogPost);
      res.status(200).json({
        id: result.insertId,
        message: "Blog post created",
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to create blog post",
        errors: [error],
      });
    }
  }

  /**
   * Return all blog posts, and can be filtered by a search term.
   *
   * @type {express.RequestHandler}
   * @openapi
   * /api/blog-posts:
   *   get:
   *     summary: "Get the list of blog posts"
   *     tags: [Blog Posts]
   *     parameters:
   *       - name: filter
   *         in: query
   *         description: "Search blog post titles, content and author details"
   *         required: false
   *         schema:
   *           type: string
   *           example: "workout"
   *     responses:
   *       '200':
   *         description: "Blog post list"
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: "#/components/schemas/BlogPostDetails"
   *       '500':
   *         $ref: "#/components/responses/Error"
   */
  static async getBlogPosts(req, res) {
    try {
      const blogPosts = req.query.filter
        ? await BlogPostDetailModel.getBySearch(req.query.filter)
        : await BlogPostDetailModel.getAll();
      res.status(200).json(blogPosts);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to load blog posts from database",
      });
    }
  }

  /**
   * Delete blog post when the authenticated user owns the post,
   * or by admin user
   *
   * @type {express.RequestHandler}
   * @openapi
   * /api/blog-posts/{id}:
   *   delete:
   *     summary: "Delete a blog post"
   *     tags: [Blog Posts]
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
   *         description: "Blog post deleted"
   *       '401':
   *         $ref: "#/components/responses/Error"
   *       '403':
   *         $ref: "#/components/responses/Error"
   *       '404':
   *         $ref: "#/components/responses/NotFound"
   *       '500':
   *         $ref: "#/components/responses/Error"
   */
  static async deleteBlogPost(req, res) {
    try {
      const blogPost = await BlogPostModel.getById(req.params.id);
      if (
        req.authenticatedUser.role !== "admin" &&
        blogPost.userId !== req.authenticatedUser.id
      ) {
        res.status(403).json({
          message: "You can only delete your own blog posts",
        });
        return;
      }
      const result = await BlogPostModel.delete(blogPost.id);
      if (result.affectedRows > 0) {
        res.status(200).json({
          message: "Blog post deleted",
        });
      } else {
        res.status(404).json({
          message: "Blog post not found",
        });
      }
    } catch (error) {
      if (error === "not found") {
        res.status(404).json({
          message: "Blog post not found",
        });
      } else {
        console.error(error);
          res.status(500).json({
            message: "Failed to delete blog post",
        });
      }
    }
  }
}
