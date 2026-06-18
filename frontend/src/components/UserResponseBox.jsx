import { useState, useEffect } from "react";

function UserResponseBox(text) {
    const [response, setResponse] = useState("");
    
    return (
        <div className="ml-auto w-fit max-w-[66%] my-6 p-4 px-6 bg-black rounded-4xl">
            <h1 className="">{text.text}</h1>
        </div>
    );
}

export default UserResponseBox;
