import { useState, useEffect } from "react";
import Bottombar from "./Bottombar";
import LLmResponseBox from "./LLmResponseBox";
import UserResponseBox from "./UserResponseBox";

function Chatbox(session) {
    const [responses, setResponses] = useState([]);
    const [currentSession, setCurrentSession] = useState(session.session);
    console.log(session.session);
    // Handles submiting a prompt
    function handleResponse(data) {
        console.log(data);
        setResponses([...responses, data]);
    }

    // Loads Session (currently only loading default)
    useEffect(() => {
        setResponses([])
        console.log("runs");
        async function loadSession() {
            console.log("this is session");
            console.log(session.session);
            const res = await fetch(
                `http://localhost:8000/api/loadSession?session=${session.session}`,
            );
            const result = await res.json();
            console.log(result);
            for (let i = 0; i < result.length; i = i + 2) {
                const set = {
                    prompt: result[i].text,
                    response: result[i + 1].text,
                };

                setResponses((pr) => [...pr, set]);
            }
        }
        loadSession();
    }, [session]);

    return (
        <div className="bg-[#202020] w-full h-full min-h-screen text-white flex flex-col items-center text-2xl relative">
            <div className="w-full left-80 lg:left-128 min-h-[8vh] bg-black flex items-center fixed right-0">
                <h1 className="text-3xl text-white px-8">ChatBot</h1>{" "}
                <h1 className="text-2xl text-gray-400!">put history here</h1>
            </div>
            <div className="w-full min-h-[77vh] p-16 px-2 lg:px-12 2xl:px-128 flex flex-col gap-y-8 mb-64 mt-24">
                {responses.length === 0 ? (
                    <>
                        <div className="flex justify-center items-center h-[66vh]">
                            <h1>
                                This is the beginning of your converstation.
                            </h1>
                        </div>
                    </>
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

            <Bottombar response={handleResponse} session={session.session} />
        </div>
    );
}

export default Chatbox;
