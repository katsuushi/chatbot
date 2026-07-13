import { useState, useEffect } from "react";

function UserResponseBox({ responseid, text, repromptCall }) {
    const [editing, setEditing] = useState(false)
    const [newPrompt, setNewPrompt] = useState("")


    function handleEditing() {
        setEditing(!editing)
    }

    function handleTextChange(e) {
        setNewPrompt(e.target.value)
    }

    function handleReprompt() {
        setEditing(false)
        repromptCall({ newPrompt: newPrompt, Iteration: responseid })
        setNewPrompt("")
    }

    return (
        <div className="ml-auto max-w-full md:max-w-[66%]   my-2 ">
            <div className={`${editing ? "w-full p-2" : "w-fit p-4"} ml-auto px-6 bg-black rounded-4xl`}>
                {editing ? (
                    <div className="flex justify-between items-center">
                        <input onChange={handleTextChange} type="text" placeholder="..." className="outline-none w-[94%] p-1 rounded-xl"></input>
                        <button onClick={handleReprompt} className="text-center hover:bg-[#202020] hover:cursor-pointer active:bg-[#303030] p-2 rounded-full"><svg width="24" height="24">
                            <image
                                width="24"
                                height="24"
                                href="../../public/check.svg"
                            />
                        </svg></button>

                    </div>
                ) : <h1 className="text-wrap [overflow-wrap:anywhere] w-full">{text}</h1>
                }
            </div>
            <div className="flex ml-auto max-w-128 justify-end px-4 py-2 ">

                <button onClick={handleEditing} className="p-2 rounded-3xl hover:cursor-pointer hover:bg-[#101010]  active:bg-[#050505]"><img src='./pen.png' className="w-[24px]" /></button>

            </div>
        </div >
    );
}

export default UserResponseBox;
