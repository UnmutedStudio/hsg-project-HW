import { useEffect, useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { fetchAPI } from "../api.mjs";
import { useAuthenticate } from "../authentication/useAuthenticate";

function BookingCreateView() {
  const { sessionId } = useParams();
  const { user } = useAuthenticate(["member"]);
  const navigate = useNavigate();

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
        sessionId: Number(sessionId),
      },
      user && user.authenticationKey,
    )
      .then((response) => {
        if (response.status == 200) {
          navigate("/bookings");
        } else {
          setStatus(response.body.message);
        }

        setLoading(false);
      })
      .catch((error) => {
        setStatus(error);
        setLoading(false);
      });
  }, [sessionId, user, navigate]);

  return (
    <section className="w-full max-w-md mx-auto bg-base-100 rounded-box shadow-md p-4 sm:p-6">
    <h1 className="text-2xl font-bold text-primary text-center mb-4">
      Book a Session
    </h1>
    {status && (
      <p className="text-center mb-4">
        {status}
      </p>
    )}
      {sessionDetail && (
      <div className="space-y-3 mb-5 text-center">
      <h2 className="text-xl font-bold">
          {sessionDetail.activity.activityName}
        </h2>
      <p>
        {new Date(
          sessionDetail.session.dateSession,
        ).toLocaleDateString("en-AU", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
      <p>
        {sessionDetail.session.timeSession.slice(0, 5)}
        {" | "}
        {sessionDetail.session.duration} minutes
      </p>
      <p>
        <span className="font-semibold">Location:</span>{" "}
        {sessionDetail.location.locationName}
      </p>
      <p>
        <span className="font-semibold">Trainer:</span>{" "}
        {sessionDetail.trainer.firstName}{" "}
        {sessionDetail.trainer.lastName}
      </p>
      <p>
        <span className="font-semibold">Places available:</span>{" "}
        {sessionDetail.session.availability}
      </p>
      </div>
    )}
      <button
        type="button"
        disabled={loading == true}
        onClick={() => submitBooking()}
        className="btn btn-primary w-full"
      >
        Confirm Booking
        {loading && (
          <span className="loading loading-spinner loading-sm"></span>
        )}
      </button>
    </section>
  );
}
export default BookingCreateView;
