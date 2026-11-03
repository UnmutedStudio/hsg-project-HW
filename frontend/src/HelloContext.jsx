import { createContext, useCallback, useContext, useState } from "react";

const UserKeyContext = createContext(null);

function HelloContext() {
  const [page, setPage] = useState("login");
  const [userKey, setUserKey] = useState(null);

  return (
    <section>
      <UserKeyContext.Provider value={[userKey, setUserKey]}>
        <NavBar userKey={userKey} setPage={setPage} />
        {page == "login" && <LoginPage setUserKey={setUserKey} />}
        {page == "orders" && <AdminOrdersPage userKey={userKey} />}
        {page == "staff" && <AdminStaffPage userKey={userKey} />}
      </UserKeyContext.Provider>
    </section>
  );
}

function NavBar({ setPage }) {
  const [userKey, setUserKey] = useContext(UserKeyContext);
  return (
    <nav className="border-b mb-4">
      <ul>
        <li onClick={() => setPage("orders")}>Orders</li>
        <li onClick={() => setPage("staff")}>Staff</li>
        <li onClick={() => setPage("login")}>Login</li>
      </ul>
    </nav>
  );
}

function AdminOrdersPage() {
  const [userKey, setUserKey] = useContext(UserKeyContext);
  return (
    <section>
      {userKey ? <h2>Admin Orders</h2> : <span>Error not logged in</span>}
      <DownloadXMLButton />
      {userKey}
    </section>
  );
}

function DownloadXMLButton() {
  const [userKey, setUserKey] = useContext(UserKeyContext);
  return <button>Download using user key {userKey}</button>;
}

function AdminStaffPage() {
  const [userKey, setUserKey] = useContext(UserKeyContext);
  return (
    <section>
      {userKey ? <h2>Admin Staff</h2> : <span>Error not logged in</span>}
      {userKey}
    </section>
  );
}

function LoginPage() {
  const [userKey, setUserKey] = useContext(UserKeyContext);

  const login = useCallback(() => {
    const userKey = crypto.randomUUID();
    console.log("Logged in with " + userKey);
    setUserKey(userKey);
  }, [setUserKey]);

  return (
    <section>
      <h2>Login</h2>
      <button className="btn btn-sm" onClick={() => login()}>
        Login Now
      </button>
    </section>
  );
}
export default HelloContext;
