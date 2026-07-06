import { useState, useEffect } from "react";

function UserResponseBox(text) {
    const [response, setResponse] = useState("");

    return (
        <div className="ml-auto max-w-full md:max-w-[66%]  w-fit my-2  p-4 px-6 bg-black rounded-4xl">
            <h1 className="text-wrap [overflow-wrap:anywhere] w-full">{text.text}</h1>
        </div>
    );
}

export default UserResponseBox;
