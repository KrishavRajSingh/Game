// import React from "react";
import { useEffect, useState } from "react";
import { ChessBoard } from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess, Color, PieceSymbol, Square } from "chess.js";

export const INIT_GAME = "init_game";

export const MOVE = "move";

export const GAME_OVER = "game_over";

export const Game = () => {
    const socket = useSocket();
    const [chess, setChess] = useState<Chess | null>(null);
    const [board, setBoard] = useState<({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][]>([]);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if(!socket) return;

        socket.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            console.log(msg);

            switch (msg.type) {
                case INIT_GAME:
                    { const newChess = new Chess();
                    setChess(newChess);
                    // console.log(chess?.board());
                    setBoard(newChess.board());
                    setIsPlaying(true);
                    console.log('game initialised', board);
                    break; }
                case MOVE:
                    if (chess) {
                        const move= msg.payload;
                        chess.move(move);
                        setBoard(chess.board());
                        console.log('Move made');
                    }
                    break;
                case GAME_OVER:
                    console.log('GAme Over');
                    break;
            }
            
        }
    },[socket, chess]);

    const handleMove = (from: Square, to: Square) => {
        if (chess) {
            // const newChess = new Chess(chess.fen());
            const move = chess.move({ from, to });
            if (move) {
                // setChess(new Chess(chess.fen()));
                setBoard(chess.board());
                socket?.send(JSON.stringify({
                    type: MOVE,
                    payload: { from, to }
                }));
            }
        }
    };
    
    if(!socket) return <div>connecting...</div>
    return <div className="flex justify-center">
        <div className="grid grid-cols-6 gap-4 flex items-center max-w-screen-lg w-full">
            <div className="bg-red-400 col-span-4">
                <ChessBoard onMove={handleMove} socket={socket} board={board}/>
            </div>
            <div className="bg-yellow-200 flex items-center justify-center col-span-2 h-16">
                {!isPlaying && <button onClick={() => {
                    socket?.send(JSON.stringify({
                        type: INIT_GAME
                    }))
                }}>Play</button>}
            </div>
        </div>
    </div>
    // return <div className="flex justify-center">
    //     <div className="pt-8 max-w-screen-lg w-full">
    //         <div className="grid gap-4 grid-cols-6 w-full bg-red-400">
    //             <div className="bg-red-200 col-span-4 w-full">
    //                 <ChessBoard />
    //             </div>
    //             <div className="bg-yellow-200 col-span-2 w-full">
    //                 <button>Play</button>
    //             </div>
    //         </div>
    //     </div>
    // </div>
}