// import { useState } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Landing} from "./screens/Landing";
import { Game } from "./screens/Game";
function App() {

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing/>}/>
        <Route path="/game" element={<Game/>}/> {/* 👈 Renders at /app/ */}
      {/* <button className='text-red-300'>
        Join Room
      </button> */}
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
