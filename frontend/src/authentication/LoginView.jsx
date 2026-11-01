import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { fetchAPI } from "../api.mjs";

function LoginView() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);

  console.log("Render!");

  const onLoginClick = useCallback(() => {
    console.log(email);
    console.log(password);
  }, [email, password]);

  return (
    <section className="flex flex-col gap-4 p-4 items-center">
      <h1 className="text-3xl">Login</h1>
      <label className="input w-full">
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
      {status && <span className="text-error">{status}</span>}
    </section>
  );
}
export default LoginView;
