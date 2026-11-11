import { useCallback, useState } from "react";
import { fetchAPI } from "../api.mjs";
import { useNavigate } from "react-router";

function RegisterView() {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const register = useCallback(() => {

    setStatus(null);
    // applying the same validation rules from API user controller.
    if (!/^[a-zA-Z\-'\ ]{2,50}$/.test(firstName)) {
        setStatus("Please enter a valid first name.");
        return;
    }
    if (!/^[a-zA-Z\-'\ ]{2,50}$/.test(lastName)) {
        setStatus("Please enter a valid last name.");
        return;
    }
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        setStatus("Please enter a valid email address.");
        return;
    }
    if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(
        password,
        )
    ) {
        setStatus(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number.",
        );
        return;
    }
    if (password !== confirmPassword) {
        setStatus("Passwords do not match.");
        return;
    }
    setLoading(true);

    fetchAPI(
      "POST",
      "/users",
      {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
      })
      .then((response) => {
        if (response.status == 200) {
          navigate("/login");
        } else {
        setStatus(response.body.message);
        setLoading(false);
        }
      })
      .catch((error) => {
        setStatus(error);
        setLoading(false);
      });
  }, [firstName, lastName, email, password, confirmPassword, navigate]);
  return (
    <section className="w-full max-w-md mx-auto bg-base-100 rounded-box shadow-md p-4">
      <h1 className="text-2xl font-bold text-primary text-center mb-4">
        Register Member Account
      </h1>
      <label className="fieldset mb-2">
        <span className="label">First name</span>
        <input
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          className="input input-sm w-full"
          type="text"
          maxLength="50"
        />
      </label>
      <label className="fieldset mb-2">
        <span className="label">Last name</span>
        <input
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          className="input input-sm w-full"
          type="text"
          maxLength="50"
        />
      </label>
      <label className="fieldset mb-2">
        <span className="label">Email</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="input input-sm w-full"
          type="email"
        />
      </label>
      <label className="fieldset mb-2">
        <span className="label">Create a password</span>
        <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input input-sm w-full"
            type="password"
            placeholder="Please enter a secure new password"
        />
        </label>
        <label className="fieldset mb-2">
        <span className="label">Confirm password</span>
        <input
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="input input-sm w-full"
            type="password"
            placeholder="Repeat your password"
        />
        </label>
        {status && (
            <p className="mb-4 text-sm text-error">
            {status}
            </p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="btn btn-outline flex-1"
          >
            Back to login
          </button>
          <button
            type="button"
            disabled={loading == true}
            onClick={() => register()}
            className="btn btn-primary flex-1"
          >
            Join now
            {loading && (
              <span className="loading loading-spinner loading-sm"></span>
            )}
          </button>
        </div>
      <div className="flex justify-center items-center gap-2 mt-4 text-sm">
        <a
            href="http://localhost:8080/privacy"
            className="link link-hover text-primary"
        >
            Privacy Policy
        </a>
        <span aria-hidden="true">|</span>
        <a
            href="http://localhost:8080/contact"
            className="link link-hover text-primary"
        >
            Contact Us
        </a>
        </div>
    </section>
  );
}

export default RegisterView;