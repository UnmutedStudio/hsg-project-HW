import { useEffect, useCallback, useState } from "react";
import { useParams } from "react-router";
import { fetchAPI } from "../api.mjs";
import { useAuthenticate } from "../authentication/useAuthenticate";

function BookingCreateView() {
  const { sessionId } = useParams();
  const { user } = useAuthenticate(["member"]);

  const [sessionDetail, setSessionDetail] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (sessionId) {
      fetchAPI("GET", "/sessions/" + sessionId)
        .then((response) => {
          console.log("////");
          console.log(
            "Session Details response body: " + JSON.stringify(response.body),
          );
          console.log("Status: " + response.status);
          if (response.status === 200) {
            setSessionDetail(response.body);
            setStatus(null);
          } else {
            setStatus(response.body.message);
          }
        })
        .catch((error) => {
          setStatus(error);
        });
    }
  }, [sessionId, setSessionDetail, setStatus]);

  const [loading, setLoading] = useState(false);
  const submitBooking = useCallback(() => {
    setLoading(true);
    setStatus(null);

    fetchAPI(
      "POST",
      "/bookings",
      {
        sessionId,
      },
      user && user.authenticationKey,
    )
      .then((response) => {
        if (response.status == 200) {
          setStatus("Booking created successfully");
        } else {
          setStatus(response.body.message);
        }

        setLoading(false);
      })
      .catch((error) => {
        setStatus(error);
        setLoading(false);
      });
  }, [sessionId, user]);

  return (
    <section className="flex flex-col items-center gap-4 p-4">
      {status && <span className="p-4">{status}</span>}

      <h1 className="text-3xl">{sessionDetail?.activity.activityName}</h1>
      <p>
        {sessionDetail?.session.dateSession} at{" "}
        {sessionDetail?.session.timeSession}
      </p>
      <p>{sessionDetail?.location.locationName}</p>
      <p>
        Trainer: {sessionDetail?.trainer.firstName}{" "}
        {sessionDetail?.trainer.lastName}
      </p>
      <button
        disabled={loading == true}
        onClick={() => submitBooking()}
        className="btn btn-outline btn-xl self-stretch"
      >
        Book session
        {loading && (
          <span className="loading loading-spinner loading-sm"></span>
        )}
      </button>
    </section>
  );
}
export default BookingCreateView;
