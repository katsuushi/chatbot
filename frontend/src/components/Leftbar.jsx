import { useState, useEffect, createContext, useContext } from "react";
import { SessionContext } from "../contexts/sessionContext";
import { useNavigate } from "react-router-dom";
import HistorySession from "./HistorySession.jsx";
function Leftbar({ sessionKey, trigger, reloadSessions }) {
    const [sessions, setSessions] = useState([]);
    const navigate = useNavigate();
    const { setLoadFn } = useContext(SessionContext);
    function handleSwitch(data) {
        console.log(sessions);
        console.log("sessions: " + sessions);
        sessionKey(data);
    }

    function newChat() {
        console.log("LEFTBAR NEWCHAT");
        sessionKey({ skey: "new", sname: "" });
        trigger(crypto.randomUUID());
    }

    function handleChange(skey) {
        const filtered = sessions.filter((session) => session.sKey !== skey);

        setSessions(filtered);
        sessionKey("undefined");
    }

    async function handleLogout() {
        const call = await fetch("http://localhost:8000/auth/cookie/logout", {
            method: "POST",
            credentials: "include",
        });
        return navigate("/login", { replace: true });
    }

    async function loadSessions() {
        console.log("ITS FUCKING CALINGGGGGGGGGGGGGGGGGGGGGG");
        const call = await fetch("http://localhost:8000/api/getUserSessions", {
            credentials: "include",
        });
        const res = await call.json();
        setSessions(res);
        console.log(res);
    }

    useEffect(() => {
        setLoadFn(() => loadSessions);
        loadSessions();
    }, []);
    // UseEffect which gets user's sessions and stores them into "sessions"
    // Each session has its session name, then on clicking one of the sessions a handleSession function
    // passses the session name into the props session which goes into Chat, and then into Chatbox which then loads with a useEffect

    return (
        <div className="min-h-screen hidden sm:block sm:min-w-80 md:min-w-80 lg:min-w-lg md:max-w-lg flex-col fixed left-0 top-0 bottom-0 bg-black">
            <div className=" h-[20%] text-white p-4">
                <h1 className="text-3xl text-white flex gap-x-2 items-center">
                    <img src="../../public/robot.png" className="w-[10%]" />
                    ChatBot
                </h1>
                <button
                    onClick={newChat}
                    className="text-2xl my-8 flex gap-x-2 items-center hover:bg-[#303030] active:bg-[#202020] px-2 py-2 rounded-xl"
                >
                    {" "}
                    <img
                        src="../../public/plus.png"
                        className="w-[5%] h-[5%]"
                    />
                    <p>New Chat</p>
                </button>
            </div>
            <div className=" h-[67%] text-white text-xl lg:text-2xl flex p-2 flex-col items-start overflow-y-scroll overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:#000_#000] scrollbar-thumb-rounded-[32px] hover:[scrollbar-color:#292929_#000]">
                {sessions.map((session) => (
                    <HistorySession
                        key={session.sKey}
                        skey={session.sKey}
                        sname={session.sName}
                        switchSession={handleSwitch}
                        deleteSession={handleChange}
                    ></HistorySession>
                ))}
            </div>
            <div className=" flex justify-center items-center text-white h-[13%]">
                <button onClick={handleLogout}>Log out</button>
            </div>
        </div>
    );
}
export default Leftbar;
