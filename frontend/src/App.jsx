import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Chat from "./pages/Chat";
import Login from "./pages/Login";

function App() {
    return (

        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Chat></Chat>}></Route>
                <Route path="/login" element={<Login></Login>}></Route>

            </Routes>

        </BrowserRouter>

    )
}

export default App;
