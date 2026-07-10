import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SessionProvider } from "../contexts/sessionContext";
import Chatbox from "../components/Chatbox";
import Leftbar from "../components/Leftbar";
import SearchSessions from "../components/searchSessions.jsx";
function Chat() {
    const [currentSession, setCurrentSession] = useState({
        skey: "undefined",
        sname: "",
    });
    const [leftbar, setLeftbar] = useState(false);
    const [burger, setBurger] = useState(false);
    const [reload, setReload] = useState(0);
    const [trigger, setTrigger] = useState("");
    const [searchToggle, setSearchToggle] = useState(false);
    const [userSessions, setUserSessions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function loadAllSessions() {
            const call = await fetch(
                "http://localhost:8000/api/getUserSessions",
                {
                    credentials: "include",
                },
            );
            const res = await call.json();
            setUserSessions(res.reverse());
            console.log(res);
        }
        loadAllSessions();
    }, []);

    async function handleLogout() {
        const call = await fetch("http://localhost:8000/auth/cookie/logout", {
            method: "POST",
            credentials: "include",
        });
        return navigate("/login", { replace: true });
    }

    function handleSearchToggle(data) {
        setSearchToggle(data);
    }

    function handleLeftbar() {
        const timer = setTimeout(() => {
            setLeftbar(!leftbar);
        }, 50);
    }

    function handleTriggerTemp(data) {
        setCurrentSession({ skey: data, sname: "" })
    }

    function initChatKey(data) {
        console.log("chatkey data");
        console.log(data);
        setCurrentSession({ skey: data.newSKey, sname: data.newSName });
    }

    function handleSession(data) {
        setCurrentSession(data);
        console.log(data);
    }

    function handleBurger() {
        setBurger(!burger);
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
        <SessionProvider>
            <div className="flex min-h-screen">
                <div className="hidden md:block min-h-screen sm:min-w-80 lg:min-w-lg"></div>
                <Leftbar
                    sessionKey={handleSession}
                    trigger={handleTrigger}
                    reload={reload}
                    burger={handleBurger}
                    active={leftbar}
                    setActive={handleLeftbar}
                    toggleSearch={handleSearchToggle}
                    currentSearchState={searchToggle}
                />
                <Chatbox
                    sessionKey={currentSession.skey}
                    sessionName={currentSession.sname}
                    trigger={trigger}
                    leftbarstate={handleLeftbar}
                    initChatKey={initChatKey}
                    triggerTemp={handleTriggerTemp}
                />
                {burger ? (
                    <div className="bg-[#101010] rounded-3xl z-99999 fixed w-64 h-32 text-white bottom-24 left-96 flex flex-col justify-center items-center p-2 px-4">
                        <button
                            onClick={handleLogout}
                            className="text-2xl flex gap-x-2 justify-center items-center hover:bg-[#050505] hover:cursor-pointer active:bg-[#000] h-fit p-4 rounded-xl"
                        >
                            <svg width="24" height="24">
                                <image
                                    width="24"
                                    height="24"
                                    href="../../public/door.svg"
                                />
                            </svg>
                            Log out
                        </button>
                    </div>
                ) : (
                    <></>
                )}
                {searchToggle ? (
                    <SearchSessions
                        disablePopup={handleSearchToggle}
                        userSessions={userSessions}
                        sessionInfo={handleSession}
                    ></SearchSessions>
                ) : (
                    <></>
                )}
            </div>
        </SessionProvider>
    );
}

export default Chat;
