import { WebSocket } from "ws";
import * as LudoJs from '@nanowiz/ludo.js'

// const a = new LudoJs;
export class Ludo {
    public players: WebSocket[];
    // public player2: WebSocket;
    private board: any;
    private moves: string[];
    private startTime: Date;

    constructor(players: WebSocket[]) {
        this.players = players;
        // this.player2 = player2;
        this.board = LudoJs.init();
        this.moves = []
        this.startTime = new Date();
    }

    makeMove(socket: WebSocket, move: string) {
        // validate -> 1. user, 2. move
    }
}