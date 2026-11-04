import { useState, useEffect, useCallback } from "react";
import { FaSearch, FaDumbbell } from "react-icons/fa";
import { useNavigate } from "react-router";
import { fetchAPI } from "../api.mjs";
import { useAuthenticate } from "../authentication/useAuthenticate";

function SessionListView() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const { user } = useAuthenticate();

  const getSessions = useCallback(
    (filter = "") => {
      setSessions([]);
      setError(null);

      const request =
        filter.length > 0
          ? fetchAPI("GET", "/sessions?filter=" + filter)
          : fetchAPI("GET", "/sessions");

      request
        .then((response) => {
          console.log(response);
          if (response.status == 200) {
            if (response.body.length > 0) {
              setSessions(response.body);
              setError(null);
            } else {
              setSessions([]);
              setError("No sessions found");
            }
          } else {
            setError(response.body.message);
          }
        })
        .catch((error) => {
          setError(error);
        });
    },
    [setSessions, setError],
  );

  useEffect(() => {
    getSessions();
  }, [getSessions]);

  return (
    <section className="flex flex-col items-center">
      <div className="join p-4 self-stretch">
        <input
          onChange={(e) => setFilter(e.target.value)}
          value={filter}
          className="input join-item grow"
          placeholder="Search sessions"
          type="text"
        />
        <button onClick={() => getSessions(filter)} className="btn join-item" type="button" aria-label="Search sessions">
          <FaSearch />
        </button>
      </div>

      {error && <span className="p-4">{error}</span>}
      {!error && sessions.length == 0 ? (
        <span className="loading loading-spinner loading-xl"></span>
      ) : (
        <ul className="list self-stretch">
          {sessions.map((sessionDetail) => (
            <li key={sessionDetail.session.id} className="list-row bg-base-100 mx-4 mb-3 rounded-box shadow-sm border border-base-300">
              <div>
                <FaDumbbell className="size-10" />
              </div>
              <div className="font-semibold">
                <div>{sessionDetail.activity.activityName}</div>
                <div className="text-xs uppercase opacity-60 font-semibold">
                  {sessionDetail.session.dateSession} at{" "}
                  {sessionDetail.session.timeSession}
                </div>
                <div className="text-sm">
                  {sessionDetail.location.locationName}
                </div>
                <div className="text-sm">
                  Trainer: {sessionDetail.trainer.firstName}{" "}
                  {sessionDetail.trainer.lastName}
                </div>
                <div className="text-sm">
                    Spots left: {sessionDetail.session.availability}
                </div>
              </div>
              <button
                disabled={!(user && user.role == "member")}
                onClick={() =>
                  navigate("/bookings/create/" + sessionDetail.session.id)
                }
                className="btn btn-primary"
              >
                Book now
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
export default SessionListView;