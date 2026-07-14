import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
function Forgotpassword() {
    const [data, setData] = useState("");
    const [success, setSuccess] = useState(false);
    const [fieldEmpty, setFieldEmpty] = useState(false);

    async function handleCall() {
        setSuccess(false)
        setFieldEmpty(false)
        if (data === "") {
            setFieldEmpty(true)
            throw new Error("Fields cannot be empty")
        }
        const call = await fetch("http://localhost:8000/auth/forgot-password", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                "email": data
            })
        })
        if (call.ok) {
            setSuccess(true)
        }
    }

    function handleKey(event) {
        if (event.key == "Enter" && prompt != "") {
            event.preventDefault();
            handleLogin();
        } else if (event.key != "Enter") {
        } else if (event.key == "Enter" && prompt == "") {
            event.preventDefault();
        }
    }

    return (
        <div className="bg-[#202020] w-full h-[100vh] flex flex-col justify-center items-center">
            <div>
                <div className="flex flex-col items-center justify-center text-white text-3xl mt-8">
                    <h1 className="font-bold text-5xl!">Recover password</h1>
                    <p className="text-xl! text-[#aaaaaa]! m-2 my-4">
                        Please input the email your account was associated to.
                    </p>
                </div>
                {success ? (
                    <p className="text-xl! text-[#00FF00]! mb-0! mr-auto">
                        An email will be sent to {data}. Be sure to check your inbox.
                    </p>
                ) : (
                    <></>
                )}
                {fieldEmpty ? (
                    <p className="text-xl! text-[#FF0000]! mb-0! mr-auto">
                        Fields cannot be empty.{" "}
                    </p>
                ) : (
                    <></>
                )}
                <div className="text-white text-2xl my-8 flex">
                    <div className="flex flex-col items-center">
                        <label className="my-6">E-mail:</label>
                    </div>
                    <div className="flex flex-col justify-center items-center ">
                        <input
                            type="text"
                            className="rounded-lg bg-[#404040] border-0 outline-none ml-4 p-2 px-4 w-128 my-4"
                            onKeyDown={handleKey}
                            onChange={(val) =>
                                setData(val.target.value)
                            }
                        />

                    </div>
                </div>

                <div className="my-8  text-white">
                    <button
                        onClick={handleCall}
                        className="bg-[#fff] text-[#000]! hover:bg-[#ccc]! hover:cursor-pointer active:bg-[#aaa]! rounded-3xl outline-none border-0 text-[20px] px-4 py-2 font-bold"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Forgotpassword;
