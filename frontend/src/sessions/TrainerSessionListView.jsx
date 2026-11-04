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
            const trainerSessions = response.body;
            if (trainerSessions.length > 0) {
              setSessions(trainerSessions);
              setError(null);
            } else {
              setSessions([]);
              setError('No trainer sessions found');
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
  useEffect(() => {
    if(user) {
        getTrainerSessions();
    }
  }, [user, getTrainerSessions]);

  return (
    <section className="flex flex-col items-center">
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
                  {sessionDetail.session.dateSession} at{' '}
                  {sessionDetail.session.timeSession}
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
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
export default TrainerSessionListView;
