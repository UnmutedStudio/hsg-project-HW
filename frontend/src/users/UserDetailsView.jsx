import { useCallback, useEffect, useState } from "react";
import { fetchAPI } from "../api.mjs";
import { useAuthenticate } from "../authentication/useAuthenticate";

function UserDetailsView() {
    const { user, refresh } = useAuthenticate([
        "member",
        "trainer",
    ]);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName);
            setLastName(user.lastName);
            setEmail(user.email);
        }
    }, [user]);

    const updateProfile = useCallback(() => {
    setStatus(null);

    if (!/^[a-zA-Z\-'\ ]{2,50}$/.test(firstName)) {
      setStatus("Please enter a valid first name.");
      return;
    }
    if (!/^[a-zA-Z\-'\ ]{2,50}$/.test(lastName)) {
      setStatus("Please enter a valid last name.");
      return;
    }
    if (
      !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
    ) {
      setStatus("Please enter a valid email address.");
      return;
    }
    const passwordWasEntered = password.length > 0;
    if (
      passwordWasEntered &&
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(
        password,
      )
    ) {
      setStatus(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number.",
      );
      return;
    }
    if (passwordWasEntered && password !== confirmPassword) {
      setStatus("Passwords do not match.");
      return;
    }
    setLoading(true);
    fetchAPI(
      "PATCH",
      "/users/self",
      {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      },
      user && user.authenticationKey,
    )
      .then((response) => {
        if (response.status == 200) {
          setStatus("Profile updated successfully");
          setPassword("");
          setConfirmPassword("");
          refresh();
        } else {
          setStatus(response.body.message);
        }
        setLoading(false);
      })
      .catch((error) => {
        setStatus(error);
        setLoading(false);
      });
  }, [firstName, lastName, email, password, confirmPassword, user, refresh]);

  if (!user) {
    return (
      <span className="loading loading-spinner loading-xl block mx-auto mt-8">
      </span>
    );
  }
  return (
    <section className="w-full max-w-md mx-auto bg-base-100 rounded-box shadow-md p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-primary text-center mb-4 capitalize">
        {user.role} Profile
      </h1>
      <label className="fieldset mb-3">
        <span className="label">First name</span>
        <input
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          className="input w-full"
          type="text"
          maxLength="50"
        />
      </label>
      <label className="fieldset mb-3">
        <span className="label">Last name</span>
        <input
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          className="input w-full"
          type="text"
          maxLength="50"
        />
      </label>
      <label className="fieldset mb-3">
        <span className="label">Email</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="input w-full"
          type="email"
        />
      </label>
      <label className="fieldset mb-3">
        <span className="label">New password</span>
        <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input w-full"
            type="password"
            placeholder="Please leave blank to keep your current password"
        />
        </label>
        <label className="fieldset mb-3">
        <span className="label">Confirm new password</span>
        <input
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="input w-full"
            type="password"
            placeholder="Repeat your new password"
        />
        </label>
      {status && (
        <p className="mb-4 text-sm">
          {status}
        </p>
      )}
      <button
        type="button"
        disabled={loading == true}
        onClick={() => updateProfile()}
        className="btn btn-primary w-full"
      >
        Update profile
        {loading && (
          <span className="loading loading-spinner loading-sm"></span>
        )}
      </button>
    </section>
  );
}

export default UserDetailsView;