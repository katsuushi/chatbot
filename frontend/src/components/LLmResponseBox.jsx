import { useState, useEffect } from "react";

function LLmResponseBox(text) {
    const [response, setResponse] = useState("");
    

    // temporarily there's no animation for waiting for the response
    return (
        <div className="w-full mt-8">
            {text.text === "01000011" ? <></> : <h1>{text.text}</h1>}
        </div>
    );
}

export default LLmResponseBox;
