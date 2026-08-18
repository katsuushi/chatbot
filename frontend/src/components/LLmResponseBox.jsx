import { useState, useEffect } from "react"; import ReactMarkdown from "react-markdown";
function LLmResponseBox({ text, branches, branchChange, retryTrigger, nodeInfo }) {

    let ready = (text == "01000011" ? false : true)

    // temporarily there's no animation for waiting for the response

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

    function handleRetry() {
        retryTrigger(nodeInfo)
    }

    return (
        <div className="w-full mt-8">
            {text === "01000011" ? <></> : <ReactMarkdown>{text}</ReactMarkdown>}
            <div className="flex mr-auto mt-2 max-w-128 justify-start gap-x-2">
                {ready &&
                    <button onClick={handleRetry} className="rounded-3xl hover:cursor-pointer hover:bg-[#101010] active:bg-[#050505] p-2"><img src="retry.png" className="w-[24px]" /></button>
                }
                {branches.length > 1 &&
                    <div className="flex justify-center items-center gap-x-1">
                        <button onClick={handleBranchDecrement}><img src="left.png" className="p-2 rounded-3xl w-[32px] hover:cursor-pointer hover:bg-[#101010] active:bg-[#050505]" /></button>
                        <p className="mx-1">{activeBranch + 1}/{branches.length}</p>
                        <button onClick={handleBranchIncrement}><img src="right.png" className="p-2 w-[32px] rounded-3xl hover:cursor-pointer hover:bg-[#101010] active:bg-[#050505]" /></button>
                    </div>
                }
            </div>

        </div>
    );
}

export default LLmResponseBox;
