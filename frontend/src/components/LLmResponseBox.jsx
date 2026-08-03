import { useState, useEffect } from "react"; import ReactMarkdown from "react-markdown";
function LLmResponseBox({ text, branches, branchChange }) {

    // temporarily there's no animation for waiting for the response

    return (
        <div className="w-full mt-8">
            {text === "01000011" ? <></> : <ReactMarkdown>{text}</ReactMarkdown>}
        </div>
    );
}

export default LLmResponseBox;
