import { DatabaseModel } from "./DatabaseModel.mjs";
import mysql from "mysql2/promise";
/**
 * The BlogPostModel is used for the High ST gym app.
 * Records are stored in the database table called blog_posts and it has CRUD operations
 */
export class BlogPostModel extends DatabaseModel {
  /**
   * Creates the BlogPostModel object
   * 
   * @param {number} id | unique identifier for the blog post
   * @param {string} title | The title of the blog post
   * @param {string} content | the content within the blog post
   * @param {number} userId | the linked identifier of ther user who created the post
   * @param {Date} dateCreated | the date the blog post was created
   * @param {number} deleted | shows deleted or not using a soft delete flag 0 = active or 1 = deleted 
   */
  constructor(
    id,
    title,
    content,
    userId,
    dateCreated,
    deleted,
  ) {
    super();
    this.id = id;
    this.title = title;
    this.content = content;
    this.userId = userId;
    this.dateCreated = dateCreated;
    this.deleted = deleted;
  }
  /**
   * This method converts a database row into an BlogPostModel object
   * 
   * @param {Object} row | this is the database row from the blog_posts table
   * @returns {BlogPostModel}
   */
  static tableToModel(row) {
    return new BlogPostModel(
      Number(row["id"]),
      row["title"],
      row["content"],
      Number(row["user_id"]),
      row["date_created"],
      row["deleted"],
    );
  }
  /**
   * This returns all blog posts from the database.
   *
   * @returns {Promise<Array<BlogPostModel>>}
   */
  static getAll() {
    return this.query("SELECT * FROM blog_posts WHERE deleted = 0").then(
      (result) => result.map((row) => this.tableToModel(row.blog_posts)),
    );
  }
  /**
   *Returns blog posts that match a search term
   *
   * @param {string} term | the search term used to find blog posts
   * @returns {Promise<Array<BlogPostModel>>}
   */
  static getBySearch(term) {
    return this.query(
      `
        SELECT * FROM blog_posts 
        WHERE deleted = 0 
        AND ( 
          title LIKE ?
          OR content LIKE ?
        )
      `,
      [`%${term}%`,`%${term}%`,],
    ).then((result) => result.map((row) => this.tableToModel(row.blog_posts)));
  }
  /**
   *Returns a blog post by its unique identifer
   * 
   * @param {number} id | the unique identifier for each blog post
   * @returns {Promise<BlogPostModel>}
   */
  static getById(id) {
    return this.query("SELECT * FROM blog_posts WHERE id = ?", [id]).then(
      (result) =>
        result.length > 0
          ? this.tableToModel(result[0].blog_posts)
          : Promise.reject("not found"),
    );
  }

  /**
   * CREATE - creates a new blogPost and places the record into the database
   * 
   * @param {BlogPostModel} blogPost | The blogPost object that will be inserted in the database
   * @returns {Promise<mysql.OkPacket>}
   */
  static create(blogPost) {
    return this.query(
      `
        INSERT INTO blog_posts
        (    
          title,
          content,
          user_id,
          date_created,
          deleted
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        blogPost.title,
        blogPost.content,
        blogPost.userId,
        blogPost.dateCreated,
        blogPost.deleted,
      ],
    );
  }
   /**
   * UPDATE - this updates a blog post record in the database
   * 
   * @param {BlogPostModel} blogPost | The blogPost object that will be updated in the database
   * @returns {Promise<mysql.OkPacket>}
   */
  static update(blogPost) {
    return this.query(
      `
        UPDATE blog_posts
        SET title = ?,
            content =?,
            user_id =?,
            date_created =?,
            deleted = ?
        WHERE id = ?
      `,
      [
        blogPost.title,
        blogPost.content,
        blogPost.userId,
        blogPost.dateCreated,
        blogPost.deleted,
        blogPost.id,
      ],
    );
  }
  /**
   * DELETE - this soft deletes a record by changing the delete flag to 1
   * 
   * @param {number} id | the blog post unique identifier
   * @returns {Promise<mysql.OkPacket>}
   */
  static delete(id) {
    return this.query(`UPDATE blog_posts SET deleted = 1 WHERE id = ?`, [id]);
  }
}

// TESTING AREA 6 of 6 completed
// 1. Test Get all works correctly: COMPLETED
// BlogPostModel.getAll()
// .then((blog_posts) => console.log(blog_posts));

// 2. TESTED get by ID using the below: COMPLETED
// BlogPostModel.getById(99)
//   .then((blogPost) => {
//     console.log("Getting blogPost with id 1: ");
//     console.log(blogPost);
//   })
//   .catch((error) =>
//     console.error("There was an issue loading the blog post: " + error),
//   );

// 3. TEST get by search : COMPLETED
// BlogPostModel.getBySearch("yoga")
//   .then((blog_posts) => {
//     console.log("Getting blog posts that contain yoga:");
//     console.log(blog_posts);
//   })
//   .catch((error) => {
//     console.error("There was an issue loading the blog post: " + error);
//   });

// 4. TESTED create new blogPost and insert into DB: COMPLETED
// const newblogPost = new BlogPostModel(
//   null,
//   "Take back your health",
//   "Join us every Wednesday at 6pm for a new interactive seminar on taking back your health",
//   2,
//   "2026-10-01",
//   0,
// );

// BlogPostModel.create(newblogPost)
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// 5. TESTED Update by id: COMPLETED
// BlogPostModel.getById(4)
//   .then((blogPost) => {
//     blogPost.title = "Seminar - Take back your health";
//     BlogPostModel.update(blogPost)
//       .then((result) => {
//         console.log(result);
//       })
//       .catch((error) => {
//         console.error("There was an issue saving the blogPost: " + error);
//       });
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// // 6. TESTED soft delete: COMPLETED
// BlogPostModel.delete(4)
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((error) => {
//     console.error(error);
//   });