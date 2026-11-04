import { Fragment, useCallback, useEffect, useState } from "react";
import { FaCalendarCheck } from "react-icons/fa";
import { fetchAPI } from "../api.mjs";
import { useAuthenticate } from "../authentication/useAuthenticate";
import XMLDownloadButton from "../common/XMLDownloadButton";

function BookingsListView() {
  const [bookingsByDay, setBookingsByDay] = useState({});
  const [error, setError] = useState(null);
  const { user } = useAuthenticate(["member"]);

  //Define how to get bookings from the API
  const getBookings = useCallback(() => {
    //Get today's date
    const today = new Date();

    //Calculate the date of the Monday of the current week
    const mondayOfThisWeek = new Date();
    mondayOfThisWeek.setDate(today.getDate() - (today.getDay() - 1));
    const startDate = toLocaleDateString(mondayOfThisWeek);

    //Calculate the date of the Sunday of the current week
    const sundayOfThisWeek = new Date(mondayOfThisWeek);
    sundayOfThisWeek.setDate(sundayOfThisWeek.getDate() + 6);
    const endDate = toLocaleDateString(sundayOfThisWeek);

    fetchAPI(
      "GET",
      `/bookings?start_date=${startDate}&end_date=${endDate}`,
      null,
      user && user.authenticationKey,
    ).then((response) => {
      if (response.status === 200) {
        if (response.body.length > 0) {
          setBookingsByDay(partitionByDay(response.body));
          setError(null);
        } else {
          setBookingsByDay({});
          setError("No results");
        }
      } else {
        setError(response.body.message);
      }
    })
    .catch((error) => {
      setError(error);
    });
  }, [user]);
  //Fetch bookings once the member who is authenticated has loaded
  useEffect(() => {
   if (user) {
    getBookings();
   }
  }, [user, getBookings]);
  const deleteBooking = useCallback(
    (bookingId) => {
      fetchAPI(
        "DELETE",
        "/bookings/" + bookingId,
        null,
        user && user.authenticationKey,
      )
        .then((response) => {
          if (response.status == 200) {
            getBookings();
          } else {
            setError(response.body.message);
          }
        })
        .catch((error) => {
          setError(error);
        });
    },
      [user, getBookings],
  );
  return (
    <section className="flex flex-col items-center pb-32">
      <h1 className="text-2xl font-bold text-primary p-4">
        My Gym Bookings
      </h1>
      {error && <span className="p-4 self-center">{error}</span>}
      {!error && Object.entries(bookingsByDay).length === 0 ? (
        <span className="loading loading-spinner loading-xl block m-4"></span>
      ) : (
        <ul className="list bg-base-100 self-stretch">
          {Object.entries(bookingsByDay).map(([day, bookings]) => (
            <Fragment key={day}>
              <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
                {day}
              </li>
              {bookings.map((booking) => (
                <li key={booking.booking.id} className="list-row bg-base-100 mx-4 mb-3 rounded-box shadow-sm border border-base-300">
                    <div>
                        <FaCalendarCheck className="size-10" />
                    </div>
                    <div>
                        <div>{booking.activity.activityName}</div>
                        <div className="text-xs uppercase font-semibold opacity-60">
                            {booking.session.timeSession}
                        </div>
                        <div className="text-sm">
                            {booking.location.locationName}
                        </div>
                        <div className="text-sm">
                            Trainer: {booking.trainer.firstName} {booking.trainer.lastName}
                        </div>
                        <div className="text-sm">
                            Status: {booking.booking.bookingStatus}
                        </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteBooking(booking.booking.id)}
                      className="btn btn-secondary btn-sm"
                    >
                    Cancel my booking
                  </button>
                </li>
              ))}
            </Fragment>
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

function partitionByDay(bookings) {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const dayPartitions = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  for (const booking of bookings) {
    const dayOfBooking =
      daysOfWeek[new Date(booking.session.dateSession).getDay()];
    dayPartitions[dayOfBooking].push(booking);
  }
  return dayPartitions;
}

export default BookingsListView;
