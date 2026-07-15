import { Link, useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
function Login() {
    const [data, setData] = useState({ em: "", ps: "" });
    const [failed, setFailed] = useState(false);
    const [fieldEmpty, setFieldEmpty] = useState(false);
    const [verifyFailed, setVerifyFailed] = useState(false)
    const [verifyMessage, setVerifyMessage] = useState(false)
    const [searchParams] = useSearchParams()
    const navigate = useNavigate();

    const token = searchParams.get("token")

    useEffect(() => {
        async function verifyAccount() {
            const call = await fetch("http://localhost:8000/auth/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "token": token
                })
            })
            if (call.status !== 200) {
                setVerifyFailed(true)
            } else {
                setVerifyMessage(true)
            }
        }
        if (token) {
            verifyAccount()
        }
    }, [])

    async function handleLogin() {
        setVerifyFailed(false)
        setVerifyMessage(false)
        setFailed(false);
        setFieldEmpty(false)
        if (data.em === "" || data.ps === "" || data.cfps === "") {
            setFieldEmpty(true);
            return "Fields cannot be empty";
        }
        const call = await fetch("http://localhost:8000/auth/cookie/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ username: data.em, password: data.ps }),
            credentials: "include",
        });
        if (!call.ok) {
            setFailed(true);
            throw new Error("Login failed");
        } else {
            return navigate("/", { replace: true });
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
                    <h1 className="font-bold text-5xl!">Chatbot</h1>
                    <p className="text-xl! text-[#aaaaaa]! m-2">
                        Converse freely, as you wish.
                    </p>
                </div>
                {failed ? (
                    <p className="text-xl! text-[#FF0000]! mb-0! mr-auto">
                        Email address or password is incorrect.{" "}
                    </p>
                ) : (
                    <></>
                )}
                {verifyFailed ? (
                    <p className="text-xl! text-[#FF0000]! mb-0! mr-auto">
                        Couldn't verify your account. Please try again.{" "}
                    </p>
                ) : (
                    <></>
                )}
                {verifyMessage ? (
                    <p className="text-xl! text-[#00FF00]! mb-0! mr-auto">
                        User successfully verified. Please log in.
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
                <div className="text-white text-2xl mb-8 flex">
                    <div className="flex flex-col items-center">
                        <label className="my-6">E-mail:</label>
                        <label className="my-6">Password:</label>
                    </div>
                    <div className="flex flex-col justify-center items-center ">
                        <input
                            type="text"
                            className="rounded-lg bg-[#404040] border-0 outline-none ml-4 p-2 px-4 w-128 my-4"
                            onKeyDown={handleKey}
                            onChange={(val) =>
                                setData({ ...data, em: val.target.value })
                            }
                        />

                        <input
                            type="password"
                            className="rounded-lg bg-[#404040] border-0 outline-none ml-4 p-2 px-4 w-128 my-4"
                            onKeyDown={handleKey}
                            onChange={(val) =>
                                setData({ ...data, ps: val.target.value })
                            }
                        />
                    </div>
                </div>

                <div className="my-8  text-white">
                    <button
                        onClick={handleLogin}
                        className="bg-[#fff] text-[#000]! hover:bg-[#ccc]! hover:cursor-pointer active:bg-[#aaa]! rounded-3xl outline-none border-0 text-[20px] px-4 py-2 font-bold"
                    >
                        Log in
                    </button>
                    <p className="text-[#aaa]! text-xl my-8">
                        Don't have a account?
                        <Link
                            className="text-cyan-300! ml-3 hover:cursor-pointer hover:text-cyan-500! active:text-cyan-600!"
                            to="/register"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
