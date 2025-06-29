import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard() {
    const [shows, setShows] = useState([]);
    const [newTitle, setNewTitle] = useState("");
    const [newTime, setNewTime] = useState("");

    useEffect(() => {
        loadShows();
    }, []);

    const loadShows = async () => {
        const res = await axios.get("http://localhost:5000/api/shows");
        setShows(res.data);
    };

    const addShow = async () => {
        await axios.post("http://localhost:5000/api/shows", {
            title: newTitle,
            time: newTime,
        });
        setNewTitle("");
        setNewTime("");
        loadShows();
    };

    const deleteShow = async (id) => {
        await axios.delete(`http://localhost:5000/api/shows/${id}`);
        loadShows();
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>🎬 Admin Dashboard</h1>

            <h3>Add New Show</h3>
            <input
                type="text"
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{ marginRight: "10px" }}
            />
            <input
                type="text"
                placeholder="Time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
            />
            <button onClick={addShow} style={{ marginLeft: "10px" }}>
                Add Show
            </button>

            <hr />

            <h3>All Shows</h3>
            {shows.map((show) => (
                <div key={show._id}>
                    <strong>{show.title}</strong> - {show.time}
                    <button
                        onClick={() => deleteShow(show._id)}
                        style={{ marginLeft: "10px", color: "red" }}
                    >
                        Delete
                    </button>
                </div>
            ))}
        </div>
    );
}

export default AdminDashboard;
