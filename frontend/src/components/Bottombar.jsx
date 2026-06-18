import { useState } from "react";

function Bottombar({ response, session }) {
    const [prompt, setPrompt] = useState("");
    console.log("below session from bot")
    console.log(session)
    async function promptSubmit() {
        response({
            prompt: prompt,
            response: "01000011",
        });
        const promptarea = document.getElementById("textpromptarea");
        promptarea.value = "";
        const result = await fetch(
            "http://localhost:8000/api/promptFlashLite",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: prompt,
                    session: session,
                }),
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
        <div className="right-0 left-80 lg:left-128 min-h-[15vh] flex flex-col items-center justify-start p-4 pt-0 gap-y-4.5 fixed bottom-0 bg-[#202020]">
            {
                // Finish the message bar
            }
            <div className="w-[50%] flex items-center bg-[#303030] rounded-xl text-center h-24">
                <textarea
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask anything"
                    id="textpromptarea"
                    onKeyDown={handleKey}
                    className="rounded-xl overflow-hidden border-none outline-0 resize-none px-4 w-[90%]"
                ></textarea>
                <button
                    className="bg-black h-full w-[10%] rounded-r-xl hover:cursor-pointer hover:text-gray-500"
                    onClick={promptSubmit}
                >
                    →
                </button>
            </div>

            <div>
                <h1 className="text-m lg:text-2xl">
                    Chatbot can make mistakes. Double check important
                    information.
                </h1>
            </div>
        </div>
    );
}

export default Bottombar;
