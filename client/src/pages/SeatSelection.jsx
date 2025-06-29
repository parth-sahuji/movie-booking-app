import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";

// Your backend deployed URL
const BACKEND_URL = "https://movie-booking-app-backend-46kw.onrender.com";

const SeatSelection = ({ showId }) => {
    const [seats, setSeats] = useState([]);
    const [selected, setSelected] = useState([]);
    const socketRef = useRef(null); // To keep socket persistent

    useEffect(() => {
        // Connect socket only once
        if (!socketRef.current) {
            socketRef.current = io(BACKEND_URL, {
                transports: ["websocket"],
                withCredentials: true,
            });
        }

        const socket = socketRef.current;

        // Join room for the selected show
        socket.emit("joinRoom", showId);

        // Listen for seat updates
        socket.on("seatUpdate", (updatedSeats) => {
            setSeats(updatedSeats);
        });

        // Fetch initial seat data
        axios.get(`${BACKEND_URL}/api/shows`)
            .then((res) => {
                const show = res.data.find((s) => s._id === showId);
                if (show) {
                    setSeats(show.seats);
                }
            })
            .catch((err) => {
                console.error("Failed to load seats:", err);
            });

        return () => {
            // Cleanup listeners
            socket.off("seatUpdate");
            socket.off("seatSelectResult");
        };
    }, [showId]);

    const handleSelect = (index) => {
        if (seats[index].booked) {
            alert("Seat already booked.");
            return;
        }

        const socket = socketRef.current;

        // Emit seat selection request
        socket.emit("selectSeat", { showId, index });

        // Handle result
        socket.once("seatSelectResult", ({ success, message }) => {
            if (success) {
                setSelected((prev) => [...prev, index]);
            } else {
                alert(message || "Seat booking failed.");
            }
        });
    };

    return (
        <div className="seat-container">
            <h2>Seat Selection</h2>
            <div className="seats-grid">
                {seats.map((seat, index) => (
                    <button
                        key={index}
                        className={`seat ${seat.booked ? "booked" : selected.includes(index) ? "selected" : ""}`}
                        onClick={() => handleSelect(index)}
                        disabled={seat.booked}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SeatSelection;
