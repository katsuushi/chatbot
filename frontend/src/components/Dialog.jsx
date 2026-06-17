import { useState, useEffect } from "react";
import LLmResponseBox from "./LLmResponseBox.jsx";
import UserResponseBox from "./UserResponseBox.jsx";

function Dialog(response, prompt) {
    console.log(prompt);
    console.log(response);
    return (
        <div className="w-full mt-12">
            <UserResponseBox text={prompt} />
            <LLmResponseBox text={response} />
        </div>
    );
}

export default Dialog;
