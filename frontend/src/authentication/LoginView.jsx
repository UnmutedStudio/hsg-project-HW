import { useCallback, useEffect, useState } from "react";
import { useAuthenticate } from "./useAuthenticate";
import { useNavigate } from "react-router";

function LoginView() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, status, user } = useAuthenticate();

  // console.log("Render!");

  const onLoginClick = useCallback(() => {
    login(email, password);
  }, [email, password, login]);

  useEffect(() => {
    if (user?.role === "member") {
      navigate("/bookings");
    } else if (user?.role === "trainer") {
      navigate("/trainer/sessions");
    } else if (user?.role === "admin") {
      navigate("/admin");
    }
  }, [user, navigate]);

  return (
    <section className="w-full max-w-md mx-auto bg-base-100 rounded-box shadow-md p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-primary text-center mb-4">Login</h1>
      <label className="input w-full mb-3">
        <span className="label">Email</span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="grow"
          type="email"
        />
      </label>
      <label className="input w-full">
        <span className="label">Password</span>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input w-full"
          type="password"
        />
      </label>
      <button
        onClick={() => onLoginClick()}
        className="btn btn-primary w-full mt-2"
      >
        Login
      </button>
      {status &&
        status !== "logged out" &&
        status !== "loaded" && (
          <p className="text-sm text-error mt-3">
            {status}
          </p>
        )}
      {/* {JSON.stringify(user)} */}
    </section>
  );
}
export default LoginView;
