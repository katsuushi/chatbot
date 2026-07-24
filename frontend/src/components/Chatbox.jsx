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
    const [sessionHistory, setSessionHistory] = useState({current_leaf: 0})
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
        if (sessionKey != "temp") {
            const length = Object.keys(sessionHistory).length
            setSessionHistory({...sessionHistory, [`m${length}`]: {parent_id: `m${length-1}`, role: "user", text: data.prompt}, [`m${length+1}`]: {parent_id: `m${length}`, role: "model", text: data.response}})
        } else {
            setTempHistory([...tempHistory, data])
        }
    }

    function leafIncremention(key){
        sessionKey == key
        const value = Number(sessionHistory.current_leaf.slice(1) + 1)
        setCurrentSession({...sessionHistory, current_leaf: value})
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

    async function handleReprompt(dialogdata) {
        // dialogdata contains the id (number of the messages' place in the conversation) and the new prompt
        if (dialogdata.newPrompt === "") {
            throw new Error("Field cannot be empty")
        }



        if (sessionKey != "temp") {
            const newBranch = responses.slice(0, dialogdata.Iteration)
            setResponses([
                ...newBranch, { "prompt": dialogdata.newPrompt, "response": "01000011" }
            ])
            const call = await fetch("http://localhost:8000/api/reprompt", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    "sessionKey": sessionKey,
                    "iteration": dialogdata.Iteration,
                    "newPrompt": dialogdata.newPrompt
                })
            })
            if (call.ok) {
                const res = await call.json()
                console.log(res)
                setResponses(res)
            }
        }

        else {
            console.log("calling temp with this history")
            console.log(tempHistory)
            const newBranch = tempHistory.slice(0, dialogdata.Iteration)

            setTempHistory([
                ...newBranch, { "prompt": dialogdata.newPrompt, "response": "01000011" }
            ])
            const call = await fetch("http://localhost:8000/api/repromptTemporary", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    "iteration": dialogdata.Iteration,
                    "newPrompt": dialogdata.newPrompt,
                    "history": tempHistory
                }),
            })
            if (call.ok) {
                const res = await call.json()
                console.log(res)
                setTempHistory(res)
            }
            else {
                const res = await call.json()
                console.log(res)
            }

        }
    }


    if (sessionName == null) {
        sessionName = "undefined";
    }

    function initKey(data) {
        initChatKey(data);
    }

    function debug1() {
        console.log(responses);
    }

    function debug2(){
        console.log(sessionHistory)
    }

    function timerReset(timer) {
        setLoading(false);
        clearTimeout(timer);
    }

    // Loads Session (currently only loading default)
    useEffect(() => {
        setTempHistory([])
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
            setSessionHistory(result)
            setTimeout(() => {
                setLoading(false)
            }, 10)
        }
        loadSession();
    }, [sessionKey, trigger]);

    useEffect(() => {
        function generateBranch() {
            // checking if sessionKey is a uuid
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionKey) == true) {
                let current_leaf = sessionHistory.current_leaf
                let branch = []
                let sets = []
                // Going backwards to navigate through the active branch - once we have it we reverse it
                for (let i = Object.keys(sessionHistory.nodes).length - 1; i > -1; i--) {
                    if (current_leaf == `m${i}` || sessionHistory.nodes[`m${i}`].parent_id == null) {
                        // current node
                        const c_node = sessionHistory.nodes[`m${i}`]
                        current_leaf = c_node.parent_id
                        const node = { parent_id: c_node.parent_id, role: c_node.role, text: c_node.text }
                        // honestly i got lost and dont know what this is for yet
                        branch.push(node)
                    } else {
                        continue

                    }
                }
                for (let i = branch.length - 1; i > -1; i=i-2) {
                    // sets to render on frontend
                    const set = {
                        prompt: branch[i].text,
                        response: branch[i-1].text 
                    }
                    sets.push(set)
                }
                setResponses(sets)
            }
        }
        generateBranch()
    }, [sessionHistory])

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

                        <h1 onClick={debug1} className="xl:text-3xl lg:text-2xl text-xl text-white">
                            ChatBot
                        </h1>

                    </div>
                    <h1 onClick={debug2} className="xl:text-2xl lg:text-xl text-lg hidden sm:block text-gray-400!">
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
                            <UserResponseBox responseid={i} text={res.prompt} repromptCall={handleReprompt} />
                            <LLmResponseBox text={res.response} />
                        </div>
                    ))
                ) : sessionKey === "temp" & (tempHistory.length == 0) ? (
                    <div className="h-[50vh] mt-24 text-center flex flex-col justify-center items-center">
                        {" "}
                        <h1>Temporary chat</h1>
                        <p className="text-lg! text-gray-400! mt-4">
                            This conversation won't be saved, nor kept in our
                            servers.
                        </p>
                    </div>
                ) : sessionKey === "temp" & (tempHistory.length != 0) ? (
                    console.log(tempHistory),
                    tempHistory.map(
                        (res, i) => (
                            <div key={i}>
                                <UserResponseBox responseid={i} text={res.prompt} repromptCall={handleReprompt} />
                                <LLmResponseBox text={res.response} />
                            </div>
                        )
                    )
                ) : responses.length == 0 ? (
                    <div className="h-[50vh] mt-16 text-center flex justify-center items-center">
                        {" "}
                        <h1>This is the beginning of your conversation.</h1>
                    </div>
                ) : (
                    responses.map(
                        (res, i) => (
                            <div key={i}>

                                <UserResponseBox responseid={i} text={res.prompt} repromptCall={handleReprompt} />
                                <LLmResponseBox text={res.response} />
                            </div>
                        ),
                    )
                )}
            </div>

            <Bottombar
                response={handleResponse}
                session={sessionKey}
                initKey={initKey}
                temporaryHistory={tempHistory}
                leafIncremention={leafIncremention}
            />
            <div className="w-[100%] h-[15vh]"></div>
        </div>
    );
}

export default Chatbox;
