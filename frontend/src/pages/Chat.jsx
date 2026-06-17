import Chatbox from "../components/Chatbox"
import Leftbar from "../components/Leftbar"

function Chat(){
    return (
        <div className="flex">
            <div className="min-h-screen sm:min-w-80 lg:min-w-lg"></div>
            <Leftbar />
            <Chatbox />
        </div>
    )
}

export default Chat