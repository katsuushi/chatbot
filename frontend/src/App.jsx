import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Forgotpassword from "./pages/Forgotpassword";
import Resetpassword from "./pages/Resetpassword";


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Chat></Chat>}></Route>
                <Route path="/login" element={<Login></Login>}></Route>
                <Route path="/register" element={<Register></Register>}></Route>
                <Route path="/forgotpassword" element={<Forgotpassword></Forgotpassword>}></Route>
                <Route path="/resetpassword" element={<Resetpassword></Resetpassword>}></Route>
            </Routes>
        </BrowserRouter >
    );
}

export default App;
