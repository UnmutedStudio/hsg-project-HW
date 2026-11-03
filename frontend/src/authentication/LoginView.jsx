import { useCallback, useEffect, useState } from "react";
import { useAuthenticate } from "./useAuthenticate";
import { useNavigate } from "react-router";

function LoginView() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, status, user } = useAuthenticate();

  console.log("Render!");

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
    <section className="flex flex-col gap-4 p-4 items-center">
      <h1 className="text-3xl">Login</h1>
      <label className="input w-full">
        <span className="label">Email</span>
        <input
          value={username}
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
          className="grow"
          type="password"
        />
      </label>
      <button
        onClick={() => onLoginClick()}
        className="btn btn-primary btn-lg self-stretch"
      >
        Login
      </button>
      <span>{status}</span>
      {JSON.stringify(user)}
    </section>
  );
}
export default LoginView;
