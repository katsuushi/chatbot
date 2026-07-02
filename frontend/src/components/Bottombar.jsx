import { useState, useContext } from "react";
import { SessionContext } from "../contexts/sessionContext";
function Bottombar({ response, session, reload }) {
    const [prompt, setPrompt] = useState("");
    let reloadSessions = false;
    const { loadFn } = useContext(SessionContext);

    async function promptSubmit() {
        if (
            session == "new" ||
            session === undefined ||
            session == "undefined"
        ) {
            session = crypto.randomUUID();
            reloadSessions = true;
        }
        response({
            prompt: prompt,
            response: "01000011",
        });
        const promptarea = document.getElementById("textpromptarea");
        promptarea.value = "";
        console.log("fetching with this session: " + session);
        const result = await fetch(
            `http://localhost:8000/api/promptFlashLite?session=${session}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: prompt,
                }),
                credentials: "include",
            },
        );
        const data = await result.json();
        response({
            prompt: prompt,
            response: data,
        });
        console.log(data);
        console.log("sent data to response");
        setPrompt("");
        if (reloadSessions) {
            console.log("OH");
            loadFn && loadFn();
        }
    }

    function handleKey(event) {
        if (event.key == "Enter" && prompt != "") {
            event.preventDefault();
            promptSubmit();
        } else if (event.key != "Enter") {
        } else if (event.key == "Enter" && prompt == "") {
            event.preventDefault();
        }
    }

    return (
        <div className="md:right-0 md:left-80 w-[100%] md:w-auto lg:left-128 min-h-[15vh] flex flex-col items-center justify-center py-2 gap-y-4.5 fixed bottom-0 bg-[#202020]">
            <div className="w-[75%] 2xl:w-[50%] flex items-center bg-[#303030] rounded-xl text-center h-24 max-h-64">
                <textarea
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask anything"
                    id="textpromptarea"
                    onKeyDown={handleKey}
                    className="rounded-xl text-xl md:text-2xl overflow-hidden border-none  outline-0 resize-none px-4 w-[90%]"
                ></textarea>
                <button
                    className="bg-black h-full w-[10%] rounded-r-xl hover:cursor-pointer hover:text-gray-500"
                    onClick={promptSubmit}
                >
                    →
                </button>
            </div>

            <div>
                <h1 className="text-center opacity-[80%] text-sm lg:text-xl">
                    Chatbot can make mistakes. Double check important
                    information.
                </h1>
            </div>
        </div>
    );
}

export default Bottombar;
