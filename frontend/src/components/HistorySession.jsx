import { useState } from "react";

function HistorySession({ sname, skey, switchSession, deleteSession }) {
    if (sname == null) {
        console.log("undefined name!!!");
        sname = "undefined";
    }

    async function handleDelete() {
        const call = await fetch(
            `http://localhost:8000/api/deleteSession?session=${skey}`,
            { method: "DELETE", credentials: "include" },
        );
        deleteSession(skey);
    }

    function handleSwitch() {
        switchSession({ sname: sname, skey: skey });
    }

    return (
        <div className="max-w-full min-w-full flex">
            <button
                onClick={handleSwitch}
                className="truncate h-12 overflow-hidden nowrap max-w-[85%] mx-2 text-left rounded-xl px-2 active:bg-[#202020] hover:bg-[#303030] w-full"
            >
                {sname}
            </button>
            <button
                onClick={handleDelete}
                className="ml-auto w-[10%] rounded-xl mx-2 px-2 hover:bg-[#303030] active:bg-[#202020]"
            >
                D
            </button>
        </div>
    );
}

export default HistorySession;
