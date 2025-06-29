import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "https://movie-booking-app-backend-46kw.onrender.com"; // ✅ Update for deployment

const Home = () => {
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get(`${BACKEND_URL}/api/shows`)
            .then((res) => {
                if (Array.isArray(res.data)) {
                    setShows(res.data);
                } else {
                    console.error("Unexpected response format:", res.data);
                    setShows([]); // fallback to empty array
                }
            })
            .catch((err) => {
                console.error("Error fetching shows:", err);
                setShows([]);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
                🎬 Now Showing
            </h1>

            {loading ? (
                <p className="text-center text-gray-500">Loading shows...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {shows.length === 0 ? (
                        <p className="text-center text-gray-500 col-span-full">
                            No shows available right now.
                        </p>
                    ) : (
                        shows.map((show) => (
                            <div
                                key={show._id}
                                className="bg-white shadow-lg rounded-xl p-6 flex flex-col justify-between transition hover:shadow-xl"
                            >
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {show.title}
                                    </h2>
                                    <p className="text-gray-600 mt-1">🕒 {show.time}</p>
                                </div>

                                <button
                                    onClick={() => navigate(`/select-seats/${show._id}`)}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                >
                                    🎟️ Book Seats
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;
