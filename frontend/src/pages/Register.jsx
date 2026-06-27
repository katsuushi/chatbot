import { Link } from "react-router-dom";
import { useState } from "react";
function Register() {
    const [data, setData] = useState({ em: "", ps: "", cfps: "" });

    async function handleRegister() {
        console.log(data);
        if (data.ps != data.cfps) {
            console.log("Passwords do not match.");
            return "Passwords do not match.";
        }

        const call = await fetch("http://localhost:8000/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: data.em,
                password: data.ps,
                is_active: true,
                is_superuser: false,
                is_verified: false,
            }),
        });

        const res = await call.json();
        console.log(res);
    }

    function handleKey(event) {
        if (event.key == "Enter" && prompt != "") {
            event.preventDefault();
            handleRegister();
        } else if (event.key != "Enter") {
        } else if (event.key == "Enter" && prompt == "") {
            event.preventDefault();
        }
    }

    return (
        <div className="bg-[#202020] w-full h-[100vh] flex flex-col justify-center items-center">
            <div>
                <div className="flex flex-col items-center justify-center text-white text-3xl my-8">
                    <h1 className="font-bold text-5xl!">Sign Up</h1>
                    <p className="text-xl! text-[#aaaaaa]! m-2">
                        Experience the power of AI.
                    </p>
                </div>
                <div className="text-white text-2xl my-8 flex">
                    <div className="flex flex-col items-center">
                        <label className="my-6">E-mail:</label>
                        <label className="my-6">Password:</label>
                        <label className="my-6 text-wrap">
                            Confirm password:
                        </label>
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
                        <input
                            type="password"
                            className="rounded-lg bg-[#404040] border-0 outline-none ml-4 p-2 px-4 w-128 my-4"
                            onKeyDown={handleKey}
                            onChange={(val) =>
                                setData({ ...data, cfps: val.target.value })
                            }
                        />
                    </div>
                </div>

                <div className="my-8 text-white pl-16">
                    <button
                        onClick={handleRegister}
                        className="bg-[#fff] text-[#000]! hover:bg-[#ccc]! hover:cursor-pointer active:bg-[#aaa]! rounded-3xl outline-none border-0 text-[20px] px-4 py-2 font-bold"
                    >
                        Sign up
                    </button>
                    <p className="text-[#aaa]! text-xl my-8">
                        Have a account?
                        <Link
                            className="text-cyan-300! ml-3 hover:cursor-pointer hover:text-cyan-500! active:text-cyan-600!"
                            to="/login"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
