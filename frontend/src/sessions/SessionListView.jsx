import { useState, useEffect, useCallback } from "react";
import { FaSearch, FaDumbbell, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router";
import { fetchAPI } from "../api.mjs";
import { useAuthenticate } from "../authentication/useAuthenticate";

function SessionListView() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
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
          const today = new Date();
          const mondayOfSelectedWeek = new Date();
          mondayOfSelectedWeek.setDate(
            today.getDate() - (today.getDay() - 1) + weekOffset * 7,
          );
          const startDate = toLocaleDateString(mondayOfSelectedWeek);
          const sundayOfSelectedWeek = new Date(mondayOfSelectedWeek);
          sundayOfSelectedWeek.setDate(
            sundayOfSelectedWeek.getDate() + 6,
          );
          const endDate = toLocaleDateString(sundayOfSelectedWeek);
          const weeklySessions = response.body
            .filter(
              (sessionDetail) =>
                sessionDetail.session.dateSession >= startDate &&
                sessionDetail.session.dateSession <= endDate,
            )
            .sort(
              (a, b) =>
                new Date(
                  `${a.session.dateSession}T${a.session.timeSession}`,
                ) -
                new Date(
                  `${b.session.dateSession}T${b.session.timeSession}`,
                ),
            );
          if (weeklySessions.length > 0) {
            setSessions(weeklySessions);
            setError(null);
          } else {
            setSessions([]);
            setError("No sessions found for this week");
          }
        })
          .catch((error) => {
            setError(error);
          });
        },
        [weekOffset],
      );
      useEffect(() => {
        getSessions();
      }, [getSessions]);
    return (
    <section className="w-full max-w-md mx-auto bg-base-100 rounded-box shadow-md p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-primary text-center mb-4">
        Session Timetable
      </h1>
      <div className="flex items-center justify-between gap-3 mb-4">
      <button
        type="button"
        onClick={() => setWeekOffset(weekOffset - 1)}
        className="btn btn-outline btn-sm w-24"
      >
        <FaChevronLeft />
        Previous
      </button>
      <span className="text-sm font-semibold text-center">
        {weekOffset === 0
          ? "This week"
          : weekOffset === 1
            ? "Next week"
            : weekOffset === -1
              ? "Last week"
              : weekOffset > 1
                ? `${weekOffset} weeks ahead`
                : `${Math.abs(weekOffset)} weeks ago`}
        </span>
        <button
          type="button"
          onClick={() => setWeekOffset(weekOffset + 1)}
          className="btn btn-outline btn-sm w-24"
        >
          Next
          <FaChevronRight />
        </button>
      </div>
      <div className="join w-full mb-4">
        <input
          onChange={(e) => setFilter(e.target.value)}
          value={filter}
          className="input join-item w-full"
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
                <div className="text-xs opacity-60 font-semibold">
                  {new Date(
                    sessionDetail.session.dateSession,
                  ).toLocaleDateString("en-AU", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <div className="text-xs opacity-60 font-semibold">
                  At: {sessionDetail.session.timeSession.slice(0, 5)}
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
  function toLocaleDateString(date) {
  const year = date.toLocaleString("en-AU", { year: "numeric" });
  const month = date.toLocaleString("en-AU", { month: "2-digit" });
  const day = date.toLocaleString("en-AU", { day: "2-digit" });
  return [year, month, day].join("-");
}
export default SessionListView;