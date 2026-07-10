import { useState, useEffect } from "react";
import Bottombar from "./Bottombar";
import LLmResponseBox from "./LLmResponseBox";
import UserResponseBox from "./UserResponseBox";

function Chatbox({
    sessionKey,
    sessionName,
    trigger,
    leftbarstate,
    initChatKey,
    triggerTemp,
}) {
    const [responses, setResponses] = useState([]);
    const [leftbar, setLeftbar] = useState(false);
    const [prevResponses, setPrevResponses] = useState([]);
    const [currentSession, setCurrentSession] = useState(sessionKey);
    const [temporary, setTemporary] = useState(false);
    const [loading, setLoading] = useState(true);
    const [tempHistory, setTempHistory] = useState([]);

    function testSession() {
        console.log(sessionKey);
    }

    // Handles submiting a prompt
    function handleResponse(data) {
        console.log(data);
        setResponses([...responses, data]);
    }

    function handleTemporary() {
        if (sessionKey === "temp") {
            // triggerTemp is a prop that calls a function which changes the session key to the value
            triggerTemp("new")
            setTempHistory([])
        } else {
            triggerTemp("temp")
        }
        setTemporary(!temporary);

    }

    function handleTemporaryResponse(prompt, res) {

        setTempHistory((prev) => [
            ...prev,
            { role: "user", text: prompt },
            { role: "model", text: res },
        ]);

    }

    if (sessionName == null) {
        sessionName = "undefined";
    }

    function initKey(data) {
        initChatKey(data);
    }

    function debug1() {
        console.log(temporary);
    }

    function timerReset(timer) {
        setLoading(false);
        clearTimeout(timer);
    }

    // Loads Session (currently only loading default)
    useEffect(() => {
        setLoading(true);
        setPrevResponses(responses);
        setResponses([]);
        console.log("USEEFFECT runs");
        console.log(sessionKey);
        console.log(responses.length);
        async function loadSession() {
            if (
                sessionKey == "new" ||
                sessionKey === undefined ||
                sessionKey == "undefined" ||
                sessionKey === "temp"
            ) {
                setLoading(false);
                return;
            }
            const res = await fetch(
                `http://localhost:8000/api/loadSession?session=${sessionKey}`,
                {
                    credentials: "include",
                },
            );
            const result = await res.json();
            console.log("LoadSession response:");
            console.log(result);
            console.log(result.length);
            for (let i = 0; i < result.length; i = i + 2) {
                const set = {
                    prompt: result[i].text,
                    response: result[i + 1].text,
                };

                setResponses((pr) => [...pr, set]);
                const timer = setTimeout(() => {
                    timerReset(timer);
                }, 10);
            }
        }
        loadSession();
    }, [sessionKey, trigger]);

    function handleLeftbar() {
        leftbarstate(!leftbar);
        setLeftbar(!leftbar);
    }

    return (
        <div className="bg-[#202020] w-full min-h-[100dvh] text-white flex flex-col items-center justify-between text-2xl">
            <div className="w-full md:w-auto md:left-80 lg:left-128 min-h-[8vh] p-4 bg-black flex items-center justify-between fixed gap-x-4 right-0">
                <div className="flex items-center gap-x-4">
                    <div className="flex items-center">
                        <button className="" onClick={handleLeftbar}>
                            <img
                                src="../../public/hamburger.png"
                                className="w-[24px] mr-6 block md:hidden"
                            />
                        </button>

                        <h1 className="xl:text-3xl lg:text-2xl text-xl text-white">
                            ChatBot
                        </h1>

                    </div>
                    <h1 className="xl:text-2xl lg:text-xl text-lg hidden sm:block text-gray-400!">
                        {sessionName}
                    </h1>
                </div>
                <button
                    onClick={handleTemporary}
                    className="text-white! text-2xl rounded-4xl hover:bg-[#303030] hover:cursor-pointer active:bg-[#404040] p-2 mr-2"
                >
                    {sessionKey === "temp" ? <img src="./cloud.png" className="w-[32px]" /> : <img src="./cloud2.png" className="w-[32px]" />}


                </button>
            </div>
            <div className="w-full max-h-full p-16 sm:my-8 px-4 sm:px-12 2xl:px-64 3xl:px-128 flex flex-col gap-y-8 xl:mt-12 text-lg md:text-xl xl:text-2xl">
                {loading ? (
                    prevResponses.map((res, i) => (
                        <div key={i}>
                            <UserResponseBox text={res.prompt} />
                            <LLmResponseBox text={res.response} />
                        </div>
                    ))
                ) : sessionKey === "temp" & (responses.length == 0) ? (
                    <div className="h-[50vh] mt-24 text-center flex flex-col justify-center items-center">
                        {" "}
                        <h1>Temporary chat</h1>
                        <p className="text-lg! text-gray-400! mt-4">
                            This conversation won't be saved, nor kept in our
                            servers.
                        </p>
                    </div>
                ) : responses.length == 0 ? (
                    <div className="h-[50vh] mt-16 text-center flex justify-center items-center">
                        {" "}
                        <h1>This is the beginning of your conversation.</h1>
                    </div>
                ) : (
                    responses.map(
                        (res, i) => (
                            <div key={i}>
                                <UserResponseBox text={res.prompt} />
                                <LLmResponseBox text={res.response} />
                            </div>
                        ),
                        <h1>test</h1>,
                    )
                )}
            </div>

            <Bottombar
                response={handleResponse}
                session={sessionKey}
                initKey={initKey}
                temporaryHistory={tempHistory}
                appendTempHist={handleTemporaryResponse}
            />
            <div className="w-[100%] h-[15vh]"></div>
        </div>
    );
}

export default Chatbox;
