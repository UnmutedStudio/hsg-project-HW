import { DatabaseModel } from "./DatabaseModel.mjs";
import { BlogPostModel } from "./BlogPostModel.mjs";
import { UserModel } from "./UserModel.mjs";

/**
 * this combines the blog post and the user details in order to display the author and not the FK
 */
export class BlogPostDetailModel extends DatabaseModel {
  /**
   * 
   * @param {BlogPostModel} blogPost | the blog post details
   * @param {UserModel} user | the auther that is linked to the blog post
   */
  constructor(blogPost, user) {
    super();
    this.blogPost = blogPost;
    this.user = user;
  }
  /**
   * this converts the joined database rows into the BlogPostDetailModel object
   * 
   * @param {Object} row | this is the joined row that contains the blog post and user details.
   * @returns {BlogPostDetailModel} the converted BlogPostDetailModel Object
   */
  static tableToModel(row) {
    return new BlogPostDetailModel(
      BlogPostModel.tableToModel(row.blog_posts),
      UserModel.tableToModel(row.users),
    );
  }
  /**
   * This returns all the acitive blog posts with related details
   * 
   * @returns {Promise<Array<BlogPostDetailModel>>}
   */
  static getAll() {
    return this.query(
      `
        SELECT *
        FROM blog_posts
        INNER JOIN users
          ON blog_posts.user_id = users.id
        WHERE blog_posts.deleted = 0
          AND users.deleted = 0
        `,
    ).then((result) => result.map((row) => this.tableToModel(row)),
    );
  }
  /**
   * 
   * @param {string} term | the serach term  used to find details in the blog post
   * @returns {Promise<Array<BlogPostDetailModel>>}
   */
  static getBySearch(term) {
    return this.query(
      `
        SELECT *
        FROM blog_posts
        INNER JOIN users
          ON blog_posts.user_id = users.id
        WHERE blog_posts.deleted = 0
          AND users.deleted = 0
          AND (
            blog_posts.title LIKE ?
            OR blog_posts.content LIKE ?
            OR users.first_name LIKE ?
            OR users.last_name LIKE ?
          )
      `,
      [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`,],
    ).then((result) =>
      result.map((row) => this.tableToModel(row)),
    );
  }
  /**
   * This returns one active blog post with the related user details
   * 
   * @param {number} id | the blog post unique identifier
   * @returns {Promise<BlogPostDetailModel>}
   */
  static getById(id) {
    return this.query(
      `
          SELECT *
          FROM blog_posts
          INNER JOIN users
            ON blog_posts.user_id = users.id
          WHERE blog_posts.id = ?
            AND blog_posts.deleted = 0
            AND users.deleted = 0
        `,
        [id],
      ).then((result) =>
        result.length > 0
          ? this.tableToModel(result[0])
          : Promise.reject("not found"),
      );
  }
}
