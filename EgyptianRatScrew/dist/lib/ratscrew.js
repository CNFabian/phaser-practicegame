import { Card } from './card';
import { GameState } from '../common';
export class RatScrew {
    constructor() {
        this._player1Deck = [];
        this._player2Deck = [];
        this._centerPile = [];
        this._currentPlayer = 1;
        this._gameState = GameState.MENU;
        this._challengePlayer = null;
        this._challengeRemaining = 0;
        this._events = [];
        this.newGame();
    }
    get player1Deck() {
        return this._player1Deck;
    }
    get player2Deck() {
        return this._player2Deck;
    }
    get centerPile() {
        return this._centerPile;
    }
    get topCard() {
        return this._centerPile.length > 0 ? this._centerPile[this._centerPile.length - 1] : null;
    }
    get currentPlayer() {
        return this._currentPlayer;
    }
    get gameState() {
        return this._gameState;
    }
    get challengePlayer() {
        return this._challengePlayer;
    }
    get challengeRemaining() {
        return this._challengeRemaining;
    }
    get player1Count() {
        return this._player1Deck.length;
    }
    get player2Count() {
        return this._player2Deck.length;
    }
    get centerCount() {
        return this._centerPile.length;
    }
    get events() {
        return this._events;
    }
    get winner() {
        if (this._player1Deck.length === 52)
            return 1;
        if (this._player2Deck.length === 52)
            return 2;
        return null;
    }
    get isGameOver() {
        return this.winner !== null;
    }
    newGame() {
        const deck = Card.shuffleDeck(Card.createDeck());
        this._player1Deck = deck.slice(0, 26);
        this._player2Deck = deck.slice(26, 52);
        this._centerPile = [];
        this._currentPlayer = 1;
        this._gameState = GameState.PLAYING;
        this._challengePlayer = null;
        this._challengeRemaining = 0;
        this._events = [];
        this.addEvent({
            type: 'card_played',
            message: 'New game started! Player 1 goes first.'
        });
    }
    playCard(player) {
        if (this._gameState === GameState.GAME_OVER) {
            return false;
        }
        if (this._gameState === GameState.PLAYING && player !== this._currentPlayer) {
            return false;
        }
        if (this._gameState === GameState.CHALLENGE && player !== this._challengePlayer) {
            return false;
        }
        const playerDeck = player === 1 ? this._player1Deck : this._player2Deck;
        if (playerDeck.length === 0) {
            return false;
        }
        const card = playerDeck.shift();
        this._centerPile.push(card);
        this.addEvent({
            type: 'card_played',
            player,
            message: `Player ${player} played ${card.display}`
        });
        if (card.isFaceCard) {
            this.startChallenge(player === 1 ? 2 : 1, card.challengeCount);
        }
        else if (this._gameState === GameState.CHALLENGE) {
            this._challengeRemaining--;
            if (this._challengeRemaining <= 0) {
                this.endChallenge(false);
            }
            else {
                this.addEvent({
                    type: 'challenge_started',
                    player: this._challengePlayer,
                    message: `Challenge continues. ${this._challengeRemaining} chances left.`
                });
            }
        }
        else {
            this._currentPlayer = player === 1 ? 2 : 1;
        }
        this.checkGameOver();
        return true;
    }
    attemptSlap(player) {
        if (this._gameState === GameState.GAME_OVER || this._centerPile.length < 2) {
            return false;
        }
        const condition = this.getSlappableCondition();
        if (condition !== 'none') {
            this.playerWinsPile(player);
            this.addEvent({
                type: 'slap_attempt',
                player,
                condition,
                message: `Player ${player} slapped successfully! (${condition})`
            });
            return true;
        }
        else {
            this.penalizePlayer(player);
            this.addEvent({
                type: 'slap_attempt',
                player,
                message: `Player ${player} slapped incorrectly! Lost one card.`
            });
            return false;
        }
    }
    startChallenge(challengePlayer, challengeCount) {
        this._gameState = GameState.CHALLENGE;
        this._challengePlayer = challengePlayer;
        this._challengeRemaining = challengeCount;
        this.addEvent({
            type: 'challenge_started',
            player: challengePlayer,
            message: `Face card challenge! Player ${challengePlayer} has ${challengeCount} chances.`
        });
    }
    endChallenge(challengerWon) {
        if (challengerWon) {
            this.addEvent({
                type: 'pile_won',
                player: this._challengePlayer,
                message: `Player ${this._challengePlayer} won the challenge!`
            });
        }
        else {
            const originalPlayer = this._challengePlayer === 1 ? 2 : 1;
            this.playerWinsPile(originalPlayer);
            this.addEvent({
                type: 'challenge_failed',
                player: originalPlayer,
                message: `Challenge failed! Player ${originalPlayer} wins the pile.`
            });
        }
        this._gameState = GameState.PLAYING;
        this._challengePlayer = null;
        this._challengeRemaining = 0;
    }
    playerWinsPile(player) {
        const playerDeck = player === 1 ? this._player1Deck : this._player2Deck;
        playerDeck.push(...this._centerPile);
        this._centerPile = [];
        this._currentPlayer = player;
        this._gameState = GameState.PLAYING;
        this.addEvent({
            type: 'pile_won',
            player,
            message: `Player ${player} won the pile!`
        });
    }
    penalizePlayer(player) {
        const playerDeck = player === 1 ? this._player1Deck : this._player2Deck;
        if (playerDeck.length > 0) {
            const card = playerDeck.shift();
            this._centerPile.unshift(card);
        }
    }
    getSlappableCondition() {
        if (this._centerPile.length < 2) {
            return 'none';
        }
        const pile = this._centerPile;
        const topCard = pile[pile.length - 1];
        const secondCard = pile[pile.length - 2];
        if (topCard.hasSameRank(secondCard)) {
            return 'doubles';
        }
        if (pile.length >= 3) {
            const thirdCard = pile[pile.length - 3];
            if (topCard.hasSameRank(thirdCard)) {
                return 'sandwich';
            }
        }
        return 'none';
    }
    checkGameOver() {
        const winner = this.winner;
        if (winner) {
            this._gameState = GameState.GAME_OVER;
            this.addEvent({
                type: 'game_over',
                player: winner,
                message: `Game Over! Player ${winner} wins with all 52 cards!`
            });
        }
    }
    addEvent(event) {
        this._events.push(event);
        console.log(`[RatScrew] ${event.message}`);
    }
    canPlayerPlay(player) {
        if (this._gameState === GameState.GAME_OVER) {
            return false;
        }
        if (this._gameState === GameState.PLAYING) {
            return player === this._currentPlayer;
        }
        if (this._gameState === GameState.CHALLENGE) {
            return player === this._challengePlayer;
        }
        return false;
    }
    getPlayerDeck(player) {
        return player === 1 ? this._player1Deck : this._player2Deck;
    }
    getGameStatusMessage() {
        const latestEvent = this._events[this._events.length - 1];
        return latestEvent?.message || 'Game ready';
    }
    isValidSlap() {
        return this.getSlappableCondition() !== 'none';
    }
}
