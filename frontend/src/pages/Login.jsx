import { Link } from "react-router-dom";
function Login() {
    return (
        <div className="bg-[#202020] w-full h-[100vh] flex flex-col justify-center items-center">
            <div>
                <div className="flex flex-col items-center justify-center text-white text-3xl my-8">
                    <h1 className="font-bold text-5xl!">Chatbot</h1>
                    <p className="text-xl! text-[#aaaaaa]! m-2">
                        Converse freely, as you wish.
                    </p>
                </div>
                <div className="text-white text-2xl my-8 flex">
                    <div className="flex flex-col items-center">
                        <label className="my-6">E-mail:</label>
                        <label className="my-6">Password:</label>
                    </div>
                    <div className="flex flex-col justify-center items-center ">
                        <input
                            type="text"
                            className="rounded-lg bg-[#404040] border-0 outline-none ml-4 p-2 px-4 w-128 my-4"
                        />

                        <input
                            type="text"
                            className="rounded-lg bg-[#404040] border-0 outline-none ml-4 p-2 px-4 w-128 my-4"
                        />
                    </div>
                </div>

                <div className="my-8  text-white">
                    <button className="bg-[#fff] text-[#000]! hover:bg-[#ccc]! hover:cursor-pointer active:bg-[#aaa]! rounded-3xl outline-none border-0 text-[20px] px-4 py-2 font-bold">
                        Log in
                    </button>
                    <p className="text-[#aaa]! text-xl my-8">
                        Don't have a account?
                        <Link
                            className="text-cyan-300! hover:cursor-pointer hover:text-cyan-500! active:text-cyan-600!"
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
