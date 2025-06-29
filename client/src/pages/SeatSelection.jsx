import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

function SeatSelection() {
    const { showId } = useParams();
    const navigate = useNavigate();
    const [seats, setSeats] = useState([]);
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        if (!showId) return;

        socket.emit("joinRoom", showId);

        socket.on("seatUpdate", (updatedSeats) => {
            setSeats(updatedSeats);
            setIsBooking(false);
        });

        socket.on("seatSelectResult", (result) => {
            if (!result.success) {
                alert(result.message || "Failed to book seat.");
                setIsBooking(false);
            }
        });

        return () => {
            socket.off("seatUpdate");
            socket.off("seatSelectResult");
        };
    }, [showId]);

    const selectSeat = (index) => {
        if (isBooking || seats[index].booked) return;
        setIsBooking(true);
        socket.emit("selectSeat", { showId, index });
    };

    return (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
            <button
                onClick={() => navigate("/")}
                style={{
                    marginBottom: "20px",
                    backgroundColor: "#f3f3f3",
                    border: "1px solid #ccc",
                    padding: "8px 16px",
                    borderRadius: "5px",
                    cursor: "pointer",
                }}
            >
                ← Go Back
            </button>

            <h2 style={{ fontSize: "24px", textAlign: "center", marginBottom: "10px" }}>
                Select Your Seat
            </h2>
            <p style={{ textAlign: "center", color: "#666" }}>
                Booked: {seats.filter((s) => s.booked).length} / {seats.length}
            </p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(8, 1fr)",
                    gap: "10px",
                    marginTop: "20px",
                }}
            >
                {seats.map((seat, i) => (
                    <button
                        key={i}
                        onClick={() => selectSeat(i)}
                        disabled={seat.booked || isBooking}
                        style={{
                            padding: "10px",
                            backgroundColor: seat.booked ? "#999" : "#4CAF50",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: seat.booked ? "not-allowed" : "pointer",
                            opacity: isBooking && !seat.booked ? 0.7 : 1,
                        }}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            {isBooking && (
                <p style={{ textAlign: "center", marginTop: "20px", color: "#999" }}>
                    Booking seat...
                </p>
            )}
        </div>
    );
}

export default SeatSelection;
