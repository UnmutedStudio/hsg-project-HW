import { useEffect, useCallback, useState } from "react";
import { useParams } from "react-router";
import { fetchAPI } from "../api.mjs";

function BookingCreateView() {
  const { sessionId } = useParams();

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

//   // Order details state
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [email, setEmail] = useState("");

  //Form validation and submission state
//   const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const submitBooking = useCallback(() => {
    setLoading(true);
  }, [setLoading]);

  return (
    <section className="flex flex-col items-center gap-4 p-4">
      {/* <span className="loading loading-spinner loading-xl"></span> */}
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
