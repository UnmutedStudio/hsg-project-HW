import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { fetchAPI } from "../api.mjs";
import { useAuthenticate } from "../authentication/useAuthenticate";

function BlogCreateView() {
  const navigate = useNavigate();
  const { user } = useAuthenticate(["member", "trainer", "admin"]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const createBlogPost = useCallback(() => {
    setLoading(true);
    setStatus(null);

    fetchAPI(
      "POST",
      "/blog-posts",
      {
        title,
        content,
      },
      user && user.authenticationKey,
    )
    .then((response) => {
       if (response.status == 200) {
         navigate("/blog");
       } else {
         setStatus(response.body.message);
         setLoading(false);
       }
    })
    .catch((error) => {
      setStatus(error);
      setLoading(false);
    });
  }, [title, content, user, navigate]);
    return (
    <section className="flex flex-col gap-4 p-4 pb-20">
      <h1 className="text-2xl font-bold text-primary mb-4">Create blog post</h1>
      <label className="fieldset">
        <span className="label">Title</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="input w-full"
          type="text"
          maxLength="100"
        />
      </label>
      <label className="fieldset">
        <span className="label">Content</span>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="textarea w-full"
          maxLength="1000"
          rows="8"
        ></textarea>
      </label>
      {status && <span className="text-error">{status}</span>}
      <div className="flex gap-2">
      <button
        type="button"
        onClick={() => navigate("/blog")}
        className="btn btn-secondary btn-sm"
      >
        Cancel
      </button>
      <button
        type="button"
        disabled={loading == true}
        onClick={() => createBlogPost()}
        className="btn btn-primary flex-1"
      >
        Create post
        {loading && (
          <span className="loading loading-spinner loading-sm"></span>
        )}
      </button>
      </div>
    </section>
  );
}
export default BlogCreateView;
