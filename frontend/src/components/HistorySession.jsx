import { useState } from "react";

function HistorySession({ sname, skey, switchSession }) {
    if (sname == null) {
        console.log("undefined name!!!");
        sname = "undefined";
    }
    console.log("Key: " + skey)

    function handleSwitch() {
        console.log(skey)
        switchSession(skey)
    }

    return (
        <div className="max-w-full min-w-full">
            <button
                onClick={handleSwitch}
                className="truncate h-12 text-left rounded-xl px-2 hover:bg-[#303030] w-full"
            >
                {sname}
            </button>
        </div>
    );
}

export default HistorySession;
