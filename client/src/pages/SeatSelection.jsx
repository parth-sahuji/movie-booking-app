import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

// Use your Render backend URL
const BACKEND_URL = "https://movie-booking-app-backend-46kw.onrender.com";

// Connect with socket
const socket = io(BACKEND_URL, {
    transports: ["websocket"],
    withCredentials: true,
});

const SeatSelection = ({ showId }) => {
    const [seats, setSeats] = useState([]);
    const [selected, setSelected] = useState([]);

    useEffect(() => {
        // Join the show room
        socket.emit("joinRoom", showId);

        // Listen for real-time seat updates
        socket.on("seatUpdate", (updatedSeats) => {
            setSeats(updatedSeats);
        });

        // Initial fetch
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

        // Cleanup
        return () => {
            socket.off("seatUpdate");
            socket.off("seatSelectResult");
        };
    }, [showId]);

    const handleSelect = (index) => {
        if (seats[index].booked) {
            alert("Seat already booked.");
            return;
        }

        socket.emit("selectSeat", { showId, index });

        socket.once("seatSelectResult", ({ success, message }) => {
            if (success) {
                setSelected([...selected, index]);
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
