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
    const [sessionHistory, setSessionHistory] = useState({ current_leaf: "m0", nodes: {} }) // session data  
    const [responses, setResponses] = useState([]); // branch
    const [nodeCount, setNodeCount] = useState(0) // amount of nodes in sessionhistory
    const [branches, setBranches] = useState({}) // stores the amount of branches a node has

    const [leftbar, setLeftbar] = useState(false);
    const [prevResponses, setPrevResponses] = useState([]);
    const [currentSession, setCurrentSession] = useState(sessionKey); // session key
    const [temporary, setTemporary] = useState(false);
    const [loading, setLoading] = useState(true);
    const [tempHistory, setTempHistory] = useState([]);

    function testSession() {
        console.log(sessionKey);
    }

    // Handles submiting a prompt
    function handleResponse(data) {
        console.log(data)
        if (sessionKey != "temp") {
            const postLength = Object.keys(sessionHistory.nodes).length
            console.log(postLength + " here postLength")
            const newSessionData = { current_leaf: `m${Number(nodeCount - 1) + 2}`, nodes: { ...sessionHistory.nodes, [`m${postLength}`]: { parent_id: `m${postLength - 1}`, role: "user", text: data.prompt }, [`m${postLength + 1}`]: { parent_id: `m${postLength}`, role: "model", text: data.response } } }
            const value = Number(nodeCount - 1) + 2
            setSessionHistory({ ...sessionHistory, current_leaf: `m${value}` })
            console.log(newSessionData)
            setSessionHistory(newSessionData)
            setNodeCount(nodeCount + 2)
        } else {
            setTempHistory([...tempHistory, data])
        }
    }

    function handleTempMessage(prompt) {
        setResponses((pr) => [...pr, { prompt: prompt, response: "01000011" }])
    }

    function onBranchChange(value) {
        setSessionHistory({ ...sessionHistory, current_leaf: value })
    }

    function leafIncremention(key) {
        setCurrentSession(key)

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
        console.log(branches);
    }

    function debug2() {
        console.log(sessionHistory)
    }

    function timerReset(timer) {
        setLoading(false);
        clearTimeout(timer);
    }

    // Loads Session - passes the session data to a state 
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
            const ref = result.nodes // reference 
            setNodeCount(Object.keys(ref).length)
            let branches = {}
            for (let i = 0; i <= Object.keys(ref).length - 1; i++) {
                const parent = ref[`m${i}`]["parent_id"]
                branches[parent] = [...(branches[parent] ?? []), `m${i}`];
            }
            setBranches(branches)
            setSessionHistory(result)
            setTimeout(() => {
                setLoading(false)
            }, 10)
        }
        loadSession();
    }, [sessionKey, trigger]);

    // This useEffect is responsible for generating the current branch - or what we see on the site
    useEffect(() => {
        function generateBranch() {
            // checking if sessionKey is a uuid
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionKey) == true) {
                let current_leaf = Number(sessionHistory.current_leaf.slice(1))
                const nodes = sessionHistory.nodes
                let branch = []
                let sets = []
                console.log(sessionHistory)
                console.log(nodeCount)

                // Similar logic to backend - start at current_leaf, get the highest descendant
                // then iterate in reverse

                console.log("begin while loop")
                let i = 1
                let temp;
                let temp2;
                while (current_leaf + i <= Object.keys(nodes).length - 1) {
                    console.log(`${current_leaf}, ${i}, ${Object.keys(nodes).length}`)
                    console.log(nodes[`m${current_leaf + i}`])
                    if (nodes[`m${current_leaf + i}`]["parent_id"] == `m${current_leaf}`) {
                        console.log("pass")
                        temp = current_leaf + i + 1
                        temp2 = current_leaf + i
                        while (temp <= Object.keys(nodes).length - 1) {
                            if (nodes[`m${temp}`]["parent_id"] == `m${current_leaf}`) {
                                temp2 = temp
                            }
                            temp++
                        }

                        current_leaf = temp2
                        i = 1
                    } else {
                        console.log("fail")
                        i += 1
                    }
                }
                console.log("current_leaf: ", current_leaf)
                //console.log(nodes[`m${current_leaf}`])
                let s_node = current_leaf
                for (let j = current_leaf; j >= 0; j--) {
                    //console.log(j)
                    if (j == s_node || nodes[`m${j}`]["parent_id"] == null & nodes[`m${j}`]["parent_id"] == "m0" || j == current_leaf) {
                        let node = { "node": `m${j}`, "parent_id": nodes[`m${j}`]["parent_id"], "role": nodes[`m${j}`]["role"], "text": nodes[`m${j}`]["text"] }
                        branch.push(node)
                        //      console.log("pass")
                        if (j != 0) {
                            s_node = Number(nodes[`m${j}`]["parent_id"].slice(1))
                            //       console.log("new s_node ", s_node)
                        }
                    } else {
                        //     console.log("fail " + j + " " + s_node)
                        continue
                    }
                }

                console.log(branch)

                // Now we generate the sets
                for (let k = 0; k < branch.length; k = k + 2) {
                    const set = {
                        "prompt": branch[k + 1]["text"], "response": branch[k]["text"], "pnode": branch[k + 1]["node"], "rnode": branch[k]["node"]
                    }
                    sets.unshift(set)
                }
                setResponses(sets)
            }
        }
        generateBranch()

    }, [nodeCount, sessionHistory.nodes, sessionHistory.current_leaf])

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
                             <UserResponseBox responseid={i} text={res.prompt} branches={branches[res.pnode]} branchChange={onBranchChange} repromptCall={handleReprompt} />
                                <LLmResponseBox text={res.response} branches={branches[res.rnode]} branchChange={onBranchChange} />                        </div>
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
                                <UserResponseBox responseid={i} text={res.prompt} branches={branches[res.pnode]} branchChange={onBranchChange} repromptCall={handleReprompt} />
                                <LLmResponseBox text={res.response} branches={branches[res.rnode]} branchChange={onBranchChange} />                            </div>
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

                                <UserResponseBox responseid={i} text={res.prompt} branches={branches[res.pnode]} branchChange={onBranchChange} repromptCall={handleReprompt} />
                                <LLmResponseBox text={res.response} branches={branches[res.rnode]} branchChange={onBranchChange} />

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
                tempMessage={handleTempMessage}
                leafIncremention={leafIncremention}
            />
            <div className="w-[100%] h-[15vh]"></div>
        </div>
    );
}

export default Chatbox;
