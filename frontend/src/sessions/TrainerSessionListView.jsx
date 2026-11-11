import { useState, useEffect, useCallback } from 'react';
import { FaDumbbell } from 'react-icons/fa';
import { fetchAPI } from '../api.mjs';
import { useAuthenticate } from '../authentication/useAuthenticate';

function TrainerSessionListView() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useAuthenticate(['trainer']);

  const getTrainerSessions = useCallback(() => {
      setSessions([]);
      setError(null);

      fetchAPI('GET', '/sessions/trainer', null, user && user.authenticationKey)
        .then((response) => {
        //   console.log(response);
          if (response.status == 200) {
          const now = new Date();
          
          const trainerSessions = response.body.filter((sessionDetail) => {
            const sessionDateTime = new Date(
              `${sessionDetail.session.dateSession}T${sessionDetail.session.timeSession}`,
            );
            return sessionDateTime >= now;
          })
          .sort((a, b) => {
            const aDateTime = new Date(
              `${a.session.dateSession}T${a.session.timeSession}`,
            );
            const bDateTime = new Date(
              `${b.session.dateSession}T${b.session.timeSession}`,
            );
          return aDateTime - bDateTime;
          });
            if (trainerSessions.length > 0) {
              setSessions(trainerSessions);
              setError(null);
            } else {
              setSessions([]);
              setError('No upcoming sessions found');
            }
          } else {
            setError(response.body.message);
          }
        })
        .catch((error) => {
          setError(error);
        });
    },
    [user],
  );
  const deleteSession = useCallback(
    (sessionId) => {
      setError(null);
      fetchAPI(
        "DELETE",
        "/sessions/" + sessionId,
        null,
        user && user.authenticationKey,
      )
      .then((response) => {
        if (response.status == 200) {
          getTrainerSessions();
        } else {
          setError(response.body.message);
        }
      })
      .catch((error) => {
        setError(error);
      });
    },
    [user, getTrainerSessions],
  );
  useEffect(() => {
    if(user) {
        getTrainerSessions();
    }
  }, [user, getTrainerSessions]);

  return (
    <section className="w-full max-w-md mx-auto bg-base-100 rounded-box shadow-md p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-primary text-center mb-4">
        My Upcoming Sessions
      </h1>
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
                {" at "}
                {sessionDetail.session.timeSession.slice(0, 5)}
                </div>
                <div className="text-sm">
                  {sessionDetail.location.locationName}
                </div>
                <div className="text-sm">
                  Trainer: {sessionDetail.trainer.firstName}{' '}
                  {sessionDetail.trainer.lastName}
                </div>
                <div className="text-sm">
                  Spots left: {sessionDetail.session.availability}
                </div>
              </div>
              <button
                type="button"
                onClick={() => deleteSession(sessionDetail.session.id)}
                className="btn btn-secondary btn-sm ml-auto self-start"
              >
              Cancel session
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
export default TrainerSessionListView;
