import SearchResult from "./SearchResult.jsx";
import useOutsideClick from "../hooks/useOutsideClick.jsx";
import { useState, useEffect } from "react";

function SearchSessions({ disablePopup, userSessions, onClose, sessionInfo }) {
    let [field, setField] = useState("");
    let timer;
    const [searchRes, setSearchRes] = useState([]);
    const ref = useOutsideClick(() => disablePopup(false));

    function handleCancel() {
        disablePopup(false);
    }

    function handleSessionChange(data) {
        sessionInfo(data);
        console.log("fired");
    }

    function handleTextChange(e) {
        clearTimeout(timer);
        console.log(e.target.value);
        timer = setTimeout(async () => {
            const call = await fetch(
                `http://localhost:8000/api/searchSessions?query=${e.target.value}`,
                {
                    credentials: "include",
                },
            );
            setField(e.target.value);
            console.log("fired log");
            const res = await call.json();
            console.log(res);
            setSearchRes(res.reverse());
        }, 250);
        console.log(searchRes);
    }

    return (
        <div className="z-31 backdrop-blur-xs w-[100vw] h-[100vh] fixed text-white flex justify-center items-center">
            <div
                ref={ref}
                className="z-9999 xl:w-[45%] lg:w-[60%] w-[100%] h-[100%] sm:w-[70%] sm:h-[50%] bg-[#101010] sm:rounded-4xl p-4 border-white"
            >
                <div className="flex h-[20%] justfiy-evenly items-center py-4">
                    <input
                        type="text"
                        placeholder="Search your chats..."
                        className="w-[95%] text-xl lg:text-2xl px-4  outline-none"
                        onChange={handleTextChange}
                    />
                    <button
                        onClick={handleCancel}
                        className="hover:cursor-pointer"
                    >
                        <img src="./cross.png" className="w-[24px]" />
                    </button>
                </div>
                <hr className="text-[#505050] w-[100%] my-4" />

                <div className="max-h-[70%] overflow-y-scroll overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:#000_#000] scrollbar-thumb-rounded-[32px] hover:[scrollbar-color:#292929_#000]">
                    {field.trim() === ""
                        ? userSessions.map((session) => (
                            <SearchResult
                                key={session.sKey}
                                sKey={session.sKey}
                                sName={session.sName}
                                passSession={(data) => {
                                    (handleSessionChange(data),
                                        setTimeout(() => handleCancel(), 50));
                                }}
                            ></SearchResult>
                        ))
                        : searchRes.map((session) => (
                            <SearchResult
                                key={session.sKey}
                                sKey={session.sKey}
                                sName={session.sName}
                                passSession={(data) => {
                                    (handleSessionChange(data),
                                        setTimeout(() => handleCancel(), 50));
                                }}
                            ></SearchResult>
                        ))}
                </div>
            </div>
        </div>
    );
}

export default SearchSessions;
