import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Chatbox from "../components/Chatbox";
import Leftbar from "../components/Leftbar";

function Chat() {
    const [currentSession, setCurrentSession] = useState({
        skey: "undefined",
        sname: "",
    });
    const [trigger, setTrigger] = useState("");
    const navigate = useNavigate();

    function handleSession(data) {
        setCurrentSession(data);
        console.log(data);
    }

    function handleTrigger(data) {
        setTrigger(data);
    }

    useEffect(() => {
        async function checkAuth() {
            const call = await fetch("http://localhost:8000/users/me", {
                credentials: "include",
            });
            console.log(call.status);
            if (call.status === 401) {
                return navigate("/login", { replace: true });
            }
        }
        checkAuth();
    }, []);

    return (
        <div className="flex">
            <div className="min-h-screen sm:min-w-80 lg:min-w-lg"></div>
            <Leftbar sessionKey={handleSession} trigger={handleTrigger} />
            <Chatbox
                sessionKey={currentSession.skey}
                sessionName={currentSession.sname}
                trigger={trigger}
            />
        </div>
    );
}

export default Chat;
