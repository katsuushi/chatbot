import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

function LLmResponseBox(text) {
    const [response, setResponse] = useState("");

    // temporarily there's no animation for waiting for the response
    return (
        <div className="w-full mt-8">
            {text.text === "01000011" ? <></> : <ReactMarkdown>{text.text}</ReactMarkdown>}
        </div>
    );
}

export default LLmResponseBox;
