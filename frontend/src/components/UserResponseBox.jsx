import { useState, useEffect } from "react";

function UserResponseBox({ iteration, responseid, text, repromptCall, branches, branchChange, name }) {
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
        console.log("fuck my life from ", responseid)
        repromptCall({ newPrompt: newPrompt, nodeNumber: responseid, iteration: iteration })
        setNewPrompt("")
    }

    if (!branches) {
        branches = ["dummy"]
    }

    const [activeBranch, setActiveBranch] = useState(branches.length - 1)

    function handleBranchIncrement() {
        if (activeBranch >= branches.length - 1) {
            //
        } else {
            branchChange(branches[activeBranch + 1])
            setActiveBranch(activeBranch + 1)

        }
    }


    function handleBranchDecrement() {
        if (activeBranch <= 0) {
            //
        } else {
            branchChange(branches[activeBranch - 1])
            setActiveBranch(activeBranch - 1)

        }
    }



    useEffect(() => {
        if (!name) {
            console.log("Name isn't initalized")
        }
        const index = branches.indexOf(name)
        setActiveBranch(index)
    }, [branches.length])


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
            <div className="flex ml-auto max-w-128 justify-end px-4 py-2 gap-x-4">
                <button onClick={handleEditing} className="p-2 rounded-3xl hover:cursor-pointer hover:bg-[#101010]  active:bg-[#050505]"><img src='./pen.png' className="w-[24px]" /></button>

                {branches.length > 1 &&
                    <div className="flex justify-center items-center gap-x-1">
                        <button onClick={handleBranchDecrement}><img src="left.png" className="p-2 rounded-3xl w-[32px] hover:cursor-pointer hover:bg-[#101010] active:bg-[#050505]" /></button>
                        <p className="mx-1">{activeBranch + 1}/{branches.length}</p>
                        <button onClick={handleBranchIncrement}><img src="right.png" className="p-2 w-[32px] rounded-3xl hover:cursor-pointer hover:bg-[#101010] active:bg-[#050505]" /></button>
                    </div>
                }
            </div>
        </div >
    );
}

export default UserResponseBox;
