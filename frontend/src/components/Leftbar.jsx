import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HistorySession from "./HistorySession.jsx";
function Leftbar({ sessionKey }) {
    const [sessions, setSessions] = useState([]);

    const navigate = useNavigate();

    function handleSwitch(data) {
        console.log(sessions);
        console.log("sessions: " + sessions);
        sessionKey(data);
    }

    async function handleLogout() {
        const call = await fetch("http://localhost:8000/auth/cookie/logout", {
            method: "POST",
            credentials: "include",
        });
        return navigate("/login", { replace: true });
    }

    useEffect(() => {
        async function loadSessions() {
            const call = await fetch(
                "http://localhost:8000/api/getUserSessions",
                {
                    credentials: "include",
                },
            );
            const res = await call.json();
            setSessions(res);
            console.log(res);
        }
        loadSessions();
    }, []);

    // UseEffect which gets user's sessions and stores them into "sessions"
    // Each session has its session name, then on clicking one of the sessions a handleSession function
    // passses the session name into the props session which goes into Chat, and then into Chatbox which then loads with a useEffect

    return (
        <div className="min-h-screen hidden sm:block sm:min-w-80 md:min-w-80 lg:min-w-lg md:max-w-lg flex-col fixed left-0 top-0 bottom-0 bg-black">
            <div className="border border-gray-500 h-[20%] p-4">
                <h1 className="text-3xl text-white">ChatBot</h1>
            </div>
            <div className="border h-[67%] text-white text-xl lg:text-2xl flex p-2 flex-col items-start">
                {sessions.map((session) => (
                    <HistorySession
                        skey={session.sKey}
                        sname={session.sName}
                        switchSession={handleSwitch}
                    ></HistorySession>
                ))}
            </div>
            <div className="border border-gray-500 flex justify-center items-center text-white h-[13%]">
                <button onClick={handleLogout}>Log out</button>
            </div>
        </div>
    );
}

export default Leftbar;
