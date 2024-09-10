import { Chess } from "chess.js";
import { WebSocket } from "ws";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";
import { randomUUID } from 'crypto';
import db from "./db";
export class Game {
    public gameId: string;
    public player1: WebSocket | null;
    public player2: WebSocket | null;
    public board: Chess;
    private moves = 0;
    private startTime: Date;

    constructor(player1: WebSocket, player2: WebSocket | null, gameId?: string, fen?: string) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = fen? new Chess(fen): new Chess();
        this.startTime = new Date();
        this.gameId = gameId? gameId : randomUUID();
    }

    async createGameHandler(){
        try{
            await this.createGameInDb();
            if(this.player1)
                this.player1.send(JSON.stringify({
                    type: INIT_GAME,
                    payload: {
                        color: "white"
                    }
                }));
            
            if(this.player2)
                this.player2.send(JSON.stringify({
                    type: INIT_GAME,
                    payload: {
                        color: "black"
                    }
                }));
        }catch(err){
            console.error(err);
            return;
        }
    }

    async createGameInDb(whitePlayerId?: string, blackPlayerId?: string){
        const game = await db.game.create({
            data: {
                id: this.gameId,
                status: "IN_PROGRESS",
                currentFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                whitePlayer: whitePlayerId ? { connect: { id: whitePlayerId }} :
                {
                    create: {
                        username: `temp_white_${randomUUID()}`,
                        email: `temp_white_${randomUUID()}@example.com`,
                        password: "tempPass"
                    },
                },
                blackPlayer: blackPlayerId ? { connect: { id: blackPlayerId }} :
                {
                    create: {
                        username: `temp_black_${randomUUID()}`,
                        email: `temp_black_${randomUUID()}@example.com`,
                        password: "tempPass"
                    },
                },
            },
            include: {
                whitePlayer: true,
                blackPlayer: true,
            }
        })
    }

    async makeMove(socket: WebSocket, move: {
        from: string;
        to: string
    }) {
        // validate type of move using zod
        // validate -> 1. user, 2. move
        if(this.moves % 2 === 0 && socket !== this.player1)
            return;
        if(this.moves % 2 !== 0 && socket !== this.player2)
            return;
        try{
            this.board.move(move);
        } catch(err) {
            console.error(err);
            return;
        }
        await this.addMoveToDb(move);

        if(this.board.isGameOver()) {
            if(this.player1)
                this.player1.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        winner: this.board.turn() === "w" ? "black" : "white"
                    }
                }));
            if(this.player2)
                this.player2.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        winner: this.board.turn() === "w" ? "black" : "white"
                    }
                }));
            return;
        } 

        if (this.moves % 2 === 0) {
            if(this.player2)
                this.player2.send(JSON.stringify({
                    type: MOVE,
                    payload: move
                }))
        } else {
            if(this.player1)
                this.player1.send(JSON.stringify({
                    type: MOVE,
                    payload: move
                }))
        }

        this.moves ++;
    }

    async addMoveToDb(move: { from: string; to: string;}) {
        await db.$transaction([
            db.move.create({
                data: {
                    gameId: this.gameId,
                    moveNumber: this.moves + 1,
                    startFen: move.from,
                    endFen: move.to,
                    createdAt: new Date(Date.now()),

                }
            }),
            db.game.update({
                data: {
                    currentFen: this.board.fen()
                },
                where: {
                    id: this.gameId
                }
            })
        ])
    }
}
