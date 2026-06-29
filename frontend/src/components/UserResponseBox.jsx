import { useState, useEffect } from "react";

function UserResponseBox(text) {
    const [response, setResponse] = useState("");

    return (
        <div className="ml-auto max-w-[66%] w-fit my-6 p-4 px-6 bg-black rounded-4xl">
            <h1 className="text-wrap w-full text-end">{text.text}</h1>
        </div>
    );
}

export default UserResponseBox;
