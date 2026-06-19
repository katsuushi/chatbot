import { useState, useEffect } from "react";

function Leftbar({ sessionKey }) {
    const [sessions, setSessions] = useState([]);

    function handle1() {
        sessionKey("default");
    }

    function handle2() {
        sessionKey("notdefault");
    }

    // UseEffect which gets user's sessions and stores them into "sessions"
    // Each session has its session name, then on clicking one of the sessions a handleSession function
    // passses the session name into the props session which goes into Chat, and then into Chatbox which then loads with a useEffect

    return (
        <div className="min-h-screen sm:min-w-80 lg:min-w-lg flex-col fixed left-0 top-0 bottom-0 bg-black">
            <div className="border border-gray-500 h-[20%] p-4">
                <h1 className="text-3xl text-white">ChatBot</h1>
            </div>
            <div className="border h-[67%] text-white text-3xl flex flex-col justify-evenly items-center">
                <button onClick={handle1}>Default</button>
                <button onClick={handle2}>Default2</button>
            </div>
            <div className="border border-gray-500 text-white h-[13%]"></div>
        </div>
    );
}

export default Leftbar;
