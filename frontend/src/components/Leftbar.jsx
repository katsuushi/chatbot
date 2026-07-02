import { useState, useEffect, createContext, useContext } from "react";
import { SessionContext } from "../contexts/sessionContext";
import { useNavigate } from "react-router-dom";
import HistorySession from "./HistorySession.jsx";
function Leftbar({
    sessionKey,
    trigger,
    reloadSessions,
    burger,
    active,
    setActive,
}) {
    const [sessions, setSessions] = useState([]);
    const [userData, setUserData] = useState({ em: "", us: "" });
    const navigate = useNavigate();
    const { setLoadFn } = useContext(SessionContext);
    function handleSwitch(data) {
        console.log(sessions);
        console.log("sessions: " + sessions);
        sessionKey(data);
    }

    function handleActive() {
        console.log("handleActive Runs")
        if (active) {
            setActive()
        }
    }

    function newChat() { 
        sessionKey({ skey: "new", sname: "" });
        trigger(crypto.randomUUID());
    }

    function handleChange(skey) {
        const filtered = sessions.filter((session) => session.sKey !== skey);

        setSessions(filtered);
        sessionKey("undefined");
    }

    async function loadSessions() {
        const call = await fetch("http://localhost:8000/api/getUserSessions", {
            credentials: "include",
        });
        const res = await call.json();
        setSessions(res);
        console.log(res);
    }

    async function getUserInfo() {
        const call = await fetch("http://localhost:8000/users/me", {
            credentials: "include",
        });
        const res = await call.json();

        if (res.username == "") {
            setUserData({ em: "undefined", us: "undefined" });
        } else {
            setUserData({ em: res.email, us: res.username });
        }
    }

    useEffect(() => {
        setLoadFn(() => loadSessions);
        getUserInfo();
        loadSessions();
    }, []);
    // UseEffect which gets user's sessions and stores them into "sessions"
    // Each session has its session name, then on clicking one of the sessions a handleSession function
    // passses the session name into the props session which goes into Chat, and then into Chatbox which then loads with a useEffect

    return (
        <div
            className={`${active ? "fixed sm:max-w-lg! max-w-80!" : "hidden"} z-999 max-h-[100dvh]  md:fixed md:block md:max-w-80 lg:min-w-lg flex-col left-0 top-0 bottom-0 bg-black`}
        >
            <div className=" h-[20%] text-white p-4">
                <h1 className="md:text-3xl text-2xl text-white flex gap-x-2 items-center  ">
                    <img
                        src="../../public/robot.png"
                        className="w-[48px] md:w-[64px] lg:pb-1 pb-2"
                    />
                    ChatBot
                    <button
                        onClick={setActive}
                        className="md:hidden ml-auto mr-8"
                    >
                        <img
                            src="../../public/cross.png"
                            className="w-[16px]"
                        />
                    </button>
                </h1>
                <button 
                    onClick={() => {newChat(); handleActive();}}
                    className="text-2xl flex gap-x-2 items-center hover:bg-[#303030] active:bg-[#202020] px-2 py-2 rounded-xl"
                >
                    {" "}
                    <img
                        src="../../public/plus.png"
                        className="w-[5%] h-[5%]"
                    />
                    <p>New Chat</p>
                </button>
            </div>
            <div className="h-[67%] text-white text-xl lg:text-2xl flex p-2 flex-col items-start overflow-y-scroll overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:#000_#000] scrollbar-thumb-rounded-[32px] hover:[scrollbar-color:#292929_#000]">
                {sessions.map((session) => (
                    <HistorySession
                        onClick={() => {handleActive();}}
                        key={session.sKey}
                        skey={session.sKey}
                        sname={session.sName}
                        switchSession={handleSwitch}
                        deleteSession={handleChange}
                    ></HistorySession>
                ))}
            </div>
            <div className=" flex justify-between items-center p-8 text-white h-[13%]">
                <span className="flex justify-center items-center gap-x-2">
                    <img src="../../public/user.png" className="w-[10%]" />
                    <h1 className="text-2xl">{userData.us}</h1>
                </span>
                <button
                    onClick={burger}
                    className="flex justify-center items-center py-6 px-1 w-[50%] h-[100%] rounded-full  hover:bg-[#303030] hover:cursor-pointer active:bg-[#202020]"
                >
                    <img src="../../public/cog.png" className="w-[80%]" />
                </button>
            </div>
        </div>
    );
}
export default Leftbar;
