import { WebSocket } from "ws";
import { INIT_GAME, JOIN_GAME, MOVE } from "./messages";
import { Game } from "./Game";
import db from "./db";

export class GameManager {
    private games: Game[];
    private users: WebSocket[];
    private pendingUser: WebSocket | null;

    constructor() {
        this.games = [];
        this.users = [];
        this.pendingUser = null;
    }

    addUser(socket: WebSocket) {
        this.users.push(socket);
        this.addHandler(socket);
    }

    removeUser(socket: WebSocket) {
        this.users = this.users.filter( user => user !== socket);
        const gameIndex = this.games.findIndex(game => game.player1 === socket || game.player2 === socket);
        if(gameIndex !== -1){
            const game = this.games[gameIndex];
            if(game.player1 === socket){
                game.player1 = null;
                if(game.player2)
                    game.player2.send(JSON.stringify({
                        type: "OPPONENT_DISCONNECTED"
                    }))
                else
                    this.games.splice(gameIndex, 1);
            }else if(game.player2 === socket){
                game.player2 = null;
                if(game.player1)
                    game.player1.send(JSON.stringify({
                        type: "OPPONENT_DISCONNECTED"
                    }))
                else
                    this.games.splice(gameIndex, 1);
            }
        }
    }

    private addHandler(socket: WebSocket) {
        socket.on("message", async ( data ) => {
            const msg = JSON.parse(data.toString());
            console.log('pohcha');
            
            if ( msg.type === INIT_GAME){
                if(this.pendingUser) {
                    // start game
                    const game = new Game(this.pendingUser, socket);
                    await game.createGameHandler();
                    this.games.push(game);
                    this.pendingUser = null;
                } else {
                    this.pendingUser = socket;
                }
            }

            if (msg.type === MOVE) {
                console.log('mo');
                
                const game = this.games.find((game) => game.player1 === socket || game.player2 === socket);
                if (game){
                    game.makeMove(socket, msg.payload);
                }
            }

            if(msg.type === JOIN_GAME){
                if(msg.payload?.gameId){
                    const { payload: { gameId }} = msg;
                    console.log('g', this.games);
                    
                    const availableGame = this.games.find(game => game.gameId === gameId);
                    console.log(availableGame);
                    
                    if(availableGame){
                        const {player1, player2, gameId, board} = availableGame;
                        console.log(player1," ji", player2);
                        
                        if(player1 && player2){
                            socket.send(JSON.stringify({
                                type: "GAME_FULL"
                            }))
                            return;
                        }
                        if(!player1){
                            availableGame.player1 = socket;
                            player2?.send(JSON.stringify({ type: "OPPPONENT_JOINED" }));
                        }else if(!player2){
                            availableGame.player2 = socket;
                            player1?.send(JSON.stringify({ type: "OPPPONENT_JOINED" }));
                        }

                        socket.send(JSON.stringify({
                            type: "GAME_JOINED",
                            payload: {
                                gameId,
                                board
                            }
                        }))
                        return;
                    }else{
                        const gameFromDb = await db.game.findUnique({
                            where:  {
                                id: gameId
                            }, include: {
                                moves: {
                                    orderBy: {
                                        moveNumber: "asc"
                                    }
                                }
                            }
                        });
                        if(gameFromDb?.currentFen){
                            const game = new Game(socket, null, gameId, gameFromDb?.currentFen);
                            // gameFromDb?.moves.forEach(move => game.board.move(move));
                            // game.fen = gameFromDb?.currentFen;
                            this.games.push(game);
                            console.log(this.games);
                            
                            socket.send(JSON.stringify({
                                type: "GAME_JOINED",
                                payload: {
                                    gameId,
                                    board: game.board
                                }
                            }));
                        }
                    }
                }
            }
        })

    }
}