import { useCallback, useEffect, useState } from 'react';
import { FaComments } from 'react-icons/fa';
import { fetchAPI } from '../api.mjs';
import { useAuthenticate } from '../authentication/useAuthenticate';
import { useNavigate } from "react-router";

function BlogListView() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useAuthenticate();
  const navigate = useNavigate();

  //Define how to get blog posts from the API
  const getBlogPosts = useCallback(() => {
    setBlogPosts([]);
    setError(null);
    fetchAPI('GET', '/blog-posts')
      .then((response) => {
        if (response.status == 200) {
          if (response.body.length > 0) {
            setBlogPosts(response.body);
          } else {
            setError('No blog posts found');
          }
        } else {
          setError(response.body.message);
        }
      })
      .catch((error) => {
        setError(error);
      });
  }, []);
  useEffect(() => {
    getBlogPosts();
  }, [getBlogPosts]);

  const deleteBlogPost = useCallback(
    (blogPostId) => {
      fetchAPI(
        'DELETE',
        '/blog-posts/' + blogPostId,
        null,
        user && user.authenticationKey,
      )
        .then((response) => {
          if (response.status == 200) {
            getBlogPosts();
          } else {
            setError(response.body.message);
          }
        })
        .catch((error) => {
          setError(error);
        });
    },
    [user, getBlogPosts],
  );
  return (
    <section className="w-full max-w-md mx-auto bg-base-100 rounded-box shadow-md p-4 sm:p-6">
      <h1 className="text-2xl font-bold p-4">Community Gym Blog</h1>
        {user && (
          <button
            type="button"
            onClick={() => navigate("/blog/create")}
            className="btn btn-primary mx-4 mb-4 self-stretch"
          >
        Create blog post
        </button>
        )}
      {error && <span className="p-4">{error}</span>}
      {!error && blogPosts.length == 0 ? (
        <span className="loading loading-spinner loading-xl"></span>
      ) : (
        <ul className="list self-stretch">
          {blogPosts.map((blogPostDetail) => (
            <li key={blogPostDetail.blogPost.id} className="list-row bg-base-100 mx-4 mb-3 rounded-box shadow-sm border border-base-300">
              <div>
                <FaComments className="size-10" />
              </div>
              <div>
                <div className="font-semibold">
                  {blogPostDetail.blogPost.title}
                </div>
                <div className="text-sm">
                  {blogPostDetail.blogPost.content}
                </div>
                <div className="text-xs opacity-60 mt-2">
                  By {blogPostDetail.user.firstName}{" "}
                  {blogPostDetail.user.lastName}
                </div>
              </div>
              {user &&
                (user.role == "admin" || blogPostDetail.blogPost.userId == user.id) && (
                  <button
                    type="button"
                    onClick={() => deleteBlogPost(blogPostDetail.blogPost.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    Delete
                  </button>
                )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
export default BlogListView;
