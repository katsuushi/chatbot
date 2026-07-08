function SearchResult({ sKey, sName, passSession }) {
    function handleSwitchToSession() {
        passSession({ skey: sKey, sname: sName });
    }

    return (
        <div
            onClick={handleSwitchToSession}
            className="w-[98%] flex gap-x-4 items-center m-2 hover:bg-[#303030] hover:cursor-pointer active:bg-[#404040] p-2 px-4 rounded-xl"
        >
            <img src="./cloud.png" className="w-[24px]" />

            <h1 className="text-lg sm:text-2xl truncate text-nowrap">
                {sName}
            </h1>
        </div>
    );
}

export default SearchResult;
