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
                className="truncate h-12 overflow-hidden nowrap max-w-[80%] xl:max-w-[85%] mx-2 text-left rounded-xl px-2 active:bg-[#202020] hover:bg-[#303030] w-full"
            >
                {sname}
            </button>
            <button
                onClick={handleDelete}
                className="ml-auto w-[20%] lg:w-[8%] xl:w-[10%] flex justify-center items-center rounded-xl mx-2 hover:bg-[#303030] active:bg-[#202020]"
            >
                <img
                    src="../../public/bin.png"
                    className="w-[32px] xl:w-[64px] 2xl:min-w-[32px] pb-1"
                />
            </button>
        </div>
    );
}

export default HistorySession;
