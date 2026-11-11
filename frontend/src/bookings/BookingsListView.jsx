import { Fragment, useCallback, useEffect, useState } from "react";
import { FaCalendarCheck, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { fetchAPI } from "../api.mjs";
import { useAuthenticate } from "../authentication/useAuthenticate";

function BookingsListView() {
  const [bookingsByDay, setBookingsByDay] = useState({});
  const [weekOffset, setWeekOffset] = useState(0);
  const [error, setError] = useState(null);
  const { user } = useAuthenticate(["member"]);

  //Define how to get bookings from the API
  const getBookings = useCallback(() => {
    //Get today's date
    const today = new Date();

    //Calculate the date of the Monday of the current week
    const mondayOfSelectedWeek = new Date();
    mondayOfSelectedWeek.setDate(
      today.getDate() - (today.getDay() - 1) + weekOffset * 7,
    );
    const startDate = toLocaleDateString(mondayOfSelectedWeek);

    //Calculate the date of the Sunday of the current week
    const sundayOfSelectedWeek = new Date(mondayOfSelectedWeek);
    sundayOfSelectedWeek.setDate(sundayOfSelectedWeek.getDate() + 6);
    const endDate = toLocaleDateString(sundayOfSelectedWeek);

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
  }, [user, weekOffset]);
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
    <section className="w-full max-w-md mx-auto bg-base-100 rounded-box shadow-md p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-primary text-center mb-4">
        My Gym Bookings
      </h1>
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          type="button"
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="btn btn-outline btn-sm w-24"
        >
          <FaChevronLeft />Previous
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
          Next <FaChevronRight />
        </button>
      </div>
      {error && <span className="p-4 self-center">{error}</span>}
      {!error && Object.entries(bookingsByDay).length === 0 ? (
        <span className="loading loading-spinner loading-xl block m-4"></span>
      ) : (
        <ul className="list bg-base-100 self-stretch">
          {Object.entries(bookingsByDay)
            .filter(([, bookings]) => bookings.length > 0)
            .map(([day, bookings]) => (
            <Fragment key={day}>
              <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
                {day}, {" "}
                {new Date(bookings[0].session.dateSession).toLocaleDateString(
                  "en-AU",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                )}
              </li>
              {bookings.map((booking) => (
                <li key={booking.booking.id} className="list-row bg-base-100 mx-4 mb-3 rounded-box shadow-sm border border-base-300">
                    <div>
                        <FaCalendarCheck className="size-10" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">
                        {booking.activity.activityName}
                        </div>
                      <div className="text-xs font-semibold opacity-60">
                        Time: {booking.session.timeSession.slice(0, 5)}
                      </div>
                      <div className="text-xs font-semibold opacity-60">
                        Duration: {booking.session.duration} minutes
                      </div>
                      <div className="text-sm font-semibold">
                          {booking.location.locationName}
                      </div>
                      <div className="text-sm">
                        Trainer: {booking.trainer.firstName} {booking.trainer.lastName}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteBooking(booking.booking.id)}
                      className="btn btn-secondary btn-sm"
                    >
                    Cancel booking
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
