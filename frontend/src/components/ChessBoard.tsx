import { Color, PieceSymbol, Square, SQUARES } from "chess.js";
import { useState } from "react";
// import { MOVE } from "../screens/Game";

export const ChessBoard = ({ board, onMove }: {
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][],
    socket: WebSocket,
    onMove: (from: Square, to: Square) => void
}) => {
    const [from, setFrom] = useState<Square | null>(null);
    // const [to, setTo] = useState<Square | null>(null);

    return <>
        {board.map((row, i) => {
            return <div key={i} className="flex justify-center">
                {row.map((square, j) => {
                    const squareName = SQUARES[i * 8 + j] as Square;
                    return <div 
                        key={j} 
                        className={`w-16 h-16 flex justify-center text-5xl font-bold items-center ${(i+j)%2 == 0 ? 'bg-green-800' : 'bg-yellow-200'}`}
                        onClick={() => {
                            console.log(squareName);
                            
                            if(!from){
                                setFrom(squareName);
                            } else {
                                // setTo(squareName);
                                // socket.send(JSON.stringify({
                                //     type: MOVE,
                                //     payload: {
                                //         from,
                                //         to: squareName
                                //     }
                                // }));
                                try{
                                    onMove(from, squareName);
                                    setFrom(null);
                                } catch(err){
                                    console.log(err);
                                    
                                    setFrom(null);
                                }
                            }
                        }}
                        >
                            {square && (
                                <span className={square.color === 'w' ? "text-white style-piece" : "text-black  "}>
                                    {getPieceSymbol(square.type) }
                                </span>
                            )}
                    </div>
                })}
            </div>
        })}
    </>
    // return (
    //     <div className="grid grid-cols-8 w-64 h-64">
    //         {board.flat().map((square, index) => {
    //             const isLight = (Math.floor(index / 8) + index) % 2 === 0;
    //             return (
    //                 <div 
    //                     key={index} 
    //                     className={`w-8 h-8 flex items-center justify-center ${isLight ? 'bg-yellow-200' : 'bg-green-800'}`}
    //                 >
    //                     {square && (
    //                         <span className={square.color === 'w' ? 'text-white' : 'text-black'}>
    //                             {getPieceSymbol(square.type)}
    //                         </span>
    //                     )}
    //                 </div>
    //             );
    //         })}
    //     </div>
    // );
}

const getPieceSymbol = (piece: PieceSymbol) => {
    switch (piece) {
        case 'p': return '♙';
        case 'r': return '♖';
        case 'n': return '♘';
        case 'b': return '♗';
        case 'q': return '♕';
        case 'k': return '♔';
        default: return '';
    }
}