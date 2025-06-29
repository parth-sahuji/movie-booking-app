import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const [shows, setShows] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get("/api/shows")
            .then((res) => setShows(res.data))
            .catch((err) => console.error("Error fetching shows:", err));
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
                🎬 Now Showing
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {shows.length === 0 && (
                    <p className="text-center text-gray-500 col-span-full">
                        No shows available right now.
                    </p>
                )}

                {shows.map((show) => (
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
                ))}
            </div>
        </div>
    );
};

export default Home;
