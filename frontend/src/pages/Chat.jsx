import { useState } from "react";

import Chatbox from "../components/Chatbox";
import Leftbar from "../components/Leftbar";

function Chat() {
    const [currentSession, setCurrentSession] = useState("default");

    function handleSession(data) {
        setCurrentSession(data);
    }

    return (
        <div className="flex">
            <div className="min-h-screen sm:min-w-80 lg:min-w-lg"></div>
            <Leftbar sessionKey={handleSession} />
            <Chatbox session={currentSession} />
        </div>
    );
}

export default Chat;

