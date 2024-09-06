// import React from "react"

import { useNavigate } from "react-router-dom"

export const Landing = () => {
    const navigate = useNavigate();
    return <div className="pt-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-32 sm:gap-16">
            <div className="flex justify-center">
                <img className="min-w-96" src="/chess.jpg" alt="chess" />
            </div>
            <div className="pt-12">
                <h1 className="text-5xl font-bold">Play Chess online on the #3 site</h1>
                <div className="m-4">
                    <button onClick={()=>navigate('/game')} className="font-bold">Play</button>
                </div>
            </div>
        </div>
    </div>
}