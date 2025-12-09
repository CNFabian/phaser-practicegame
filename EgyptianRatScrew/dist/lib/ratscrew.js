import { Card } from './card';
import { GameState, DEFAULT_RULES, RANK_VALUES, Rank } from '../common';
export class RatScrew {
    constructor(rules = DEFAULT_RULES) {
        this._player1Deck = [];
        this._player2Deck = [];
        this._centerPile = [];
        this._bonusPile = [];
        this._currentPlayer = 1;
        this._gameState = GameState.PLAYING;
        this._challengePlayer = null;
        this._challengeRemaining = 0;
        this._events = [];
        this._pileAwaitingCollection = false;
        this._pileWinner = null;
        this._rules = { ...rules };
        this.initializeGame();
    }
    get player1Count() { return this._player1Deck.length; }
    get player2Count() { return this._player2Deck.length; }
    get centerCount() { return this._centerPile.length; }
    get bonusCount() { return this._bonusPile.length; }
    get currentPlayer() { return this._currentPlayer; }
    get gameState() { return this._gameState; }
    get challengePlayer() { return this._challengePlayer; }
    get challengeRemaining() { return this._challengeRemaining; }
    get topCard() {
        return this._centerPile.length > 0 ? this._centerPile[this._centerPile.length - 1] : null;
    }
    get events() { return this._events; }
    get winner() {
        if (this._player1Deck.length === 52)
            return 1;
        if (this._player2Deck.length === 52)
            return 2;
        return null;
    }
    get pileAwaitingCollection() { return this._pileAwaitingCollection; }
    get pileWinner() { return this._pileWinner; }
    get rules() { return { ...this._rules }; }
    initializeGame() {
        const fullDeck = Card.createDeck();
        const shuffledDeck = Card.shuffleDeck(fullDeck);
        this._player1Deck = shuffledDeck.slice(0, 26);
        this._player2Deck = shuffledDeck.slice(26, 52);
        this._centerPile = [];
        this._bonusPile = [];
        this._currentPlayer = 1;
        this._gameState = GameState.PLAYING;
        this._challengePlayer = null;
        this._challengeRemaining = 0;
        this._pileAwaitingCollection = false;
        this._pileWinner = null;
        this._events = [];
        this.addEvent({
            type: 'card_played',
            player: 1,
            message: 'Game started! Player 1 goes first.'
        });
    }
    playCard(player) {
        if (!this.canPlayerPlay(player)) {
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
        const slappableCondition = this.getSlappableCondition();
        if (slappableCondition !== 'none') {
            this.addEvent({
                type: 'slap_attempt',
                player,
                message: `${slappableCondition.toUpperCase().replace('_', '-')} - SLAP NOW!`
            });
            if (this._gameState === GameState.CHALLENGE) {
                this.addEvent({
                    type: 'challenge_started',
                    player: this._challengePlayer,
                    message: `Challenge paused! ${slappableCondition} detected - race to slap!`
                });
            }
            return true;
        }
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
                    message: `Challenge continues. Player ${this._challengePlayer} has ${this._challengeRemaining} chances left.`
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
        if (this._gameState === GameState.GAME_OVER) {
            return false;
        }
        if (this._pileAwaitingCollection) {
            if (player === this._pileWinner) {
                this.collectPile(player);
                return true;
            }
            return false;
        }
        if (this._centerPile.length < 2) {
            return false;
        }
        const condition = this.getSlappableCondition();
        if (condition !== 'none') {
            this.setPileWinner(player);
            if (this._gameState === GameState.CHALLENGE) {
                this.addEvent({
                    type: 'slap_attempt',
                    player,
                    condition,
                    message: `Player ${player} slapped ${condition} during challenge! Challenge cancelled - Slap again to collect!`
                });
                this._gameState = GameState.PLAYING;
                this._challengePlayer = null;
                this._challengeRemaining = 0;
            }
            else {
                this.addEvent({
                    type: 'slap_attempt',
                    player,
                    condition,
                    message: `Player ${player} slapped successfully! (${condition}) - Slap again to collect!`
                });
            }
            return true;
        }
        else {
            this.penalizePlayer(player);
            this.addEvent({
                type: 'slap_attempt',
                player,
                message: `Player ${player} slapped incorrectly! Lost one card to bonus pile.`
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
            if (this._challengePlayer) {
                this.setPileWinner(this._challengePlayer);
                this.addEvent({
                    type: 'pile_won',
                    player: this._challengePlayer,
                    message: `Player ${this._challengePlayer} won the challenge! Slap to collect!`
                });
            }
        }
        else {
            const originalPlayer = this._challengePlayer === 1 ? 2 : 1;
            this.setPileWinner(originalPlayer);
            this.addEvent({
                type: 'challenge_failed',
                player: originalPlayer,
                message: `Challenge failed! Player ${originalPlayer} wins the pile - Slap to collect!`
            });
        }
        this._gameState = GameState.PLAYING;
        this._challengePlayer = null;
        this._challengeRemaining = 0;
    }
    setPileWinner(player) {
        this._pileAwaitingCollection = true;
        this._pileWinner = player;
        this._currentPlayer = player;
    }
    collectPile(player) {
        const playerDeck = player === 1 ? this._player1Deck : this._player2Deck;
        playerDeck.push(...this._centerPile);
        const bonusCount = this._bonusPile.length;
        if (bonusCount > 0) {
            playerDeck.push(...this._bonusPile);
            this.addEvent({
                type: 'pile_won',
                player,
                message: `Player ${player} also gets ${bonusCount} bonus card${bonusCount > 1 ? 's' : ''}!`
            });
        }
        this._centerPile = [];
        this._bonusPile = [];
        this._pileAwaitingCollection = false;
        this._pileWinner = null;
        this._currentPlayer = player;
        this._gameState = GameState.PLAYING;
        const totalCards = playerDeck.length;
        this.addEvent({
            type: 'pile_won',
            player,
            message: `Player ${player} collected the pile! (${totalCards} cards total)`
        });
        this.checkGameOver();
    }
    penalizePlayer(player) {
        const playerDeck = player === 1 ? this._player1Deck : this._player2Deck;
        if (playerDeck.length > 0) {
            const card = playerDeck.shift();
            this._bonusPile.push(card);
            this.addEvent({
                type: 'slap_attempt',
                player,
                message: `Player ${player} penalized: ${card.display} added to bonus pile (${this._bonusPile.length} cards).`
            });
        }
        else {
            this.addEvent({
                type: 'slap_attempt',
                player,
                message: `Player ${player} has no cards to penalize!`
            });
        }
        this.checkGameOver();
    }
    getSlappableCondition() {
        const pile = this._centerPile;
        if (pile.length < 2) {
            return 'none';
        }
        const topCard = pile[pile.length - 1];
        const secondCard = pile[pile.length - 2];
        if (!topCard || !secondCard) {
            return 'none';
        }
        if (this._rules.doubles && topCard.hasSameRank(secondCard)) {
            console.log(`DOUBLE DETECTED: ${topCard.display} and ${secondCard.display}`);
            return 'doubles';
        }
        if (this._rules.sandwich && pile.length >= 3) {
            const thirdCard = pile[pile.length - 3];
            if (thirdCard && topCard.hasSameRank(thirdCard)) {
                console.log(`SANDWICH DETECTED: ${topCard.display}, ${secondCard.display}, ${thirdCard.display}`);
                return 'sandwich';
            }
        }
        if (this._rules.tens) {
            const topValue = RANK_VALUES[topCard.rank];
            const secondValue = RANK_VALUES[secondCard.rank];
            if (topValue + secondValue === 10) {
                return 'tens';
            }
        }
        if (this._rules.marriage) {
            const isMarriage = (topCard.rank === Rank.KING && secondCard.rank === Rank.QUEEN) ||
                (topCard.rank === Rank.QUEEN && secondCard.rank === Rank.KING);
            if (isMarriage) {
                return 'marriage';
            }
        }
        if (this._rules.topBottom && pile.length >= 3) {
            const bottomCard = pile[0];
            if (bottomCard && topCard.hasSameRank(bottomCard)) {
                return 'top_bottom';
            }
        }
        if (this._rules.fourInRow && pile.length >= 4) {
            const cards = [
                pile[pile.length - 4],
                pile[pile.length - 3],
                pile[pile.length - 2],
                pile[pile.length - 1]
            ];
            if (this.isSequence(cards)) {
                return 'four_in_row';
            }
        }
        if (this._rules.sequence && pile.length >= 3) {
            const last3 = [
                pile[pile.length - 3],
                pile[pile.length - 2],
                pile[pile.length - 1]
            ];
            if (this.isSequence(last3)) {
                return 'sequence';
            }
        }
        return 'none';
    }
    isSequence(cards) {
        const values = cards.map(c => RANK_VALUES[c.rank]).sort((a, b) => a - b);
        for (let i = 1; i < values.length; i++) {
            if (values[i] !== values[i - 1] + 1) {
                if (!(values[i - 1] === 13 && values[i] === 1)) {
                    return false;
                }
            }
        }
        return true;
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
        if (this._pileAwaitingCollection) {
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
        if (this._pileAwaitingCollection && this._pileWinner) {
            return `Player ${this._pileWinner}: Slap to collect the pile!`;
        }
        const latestEvent = this._events[this._events.length - 1];
        return latestEvent?.message || 'Game ready';
    }
    isValidSlap() {
        return this.getSlappableCondition() !== 'none';
    }
    getActiveRuleNames() {
        const activeRules = [];
        if (this._rules.doubles)
            activeRules.push('Doubles');
        if (this._rules.sandwich)
            activeRules.push('Sandwich');
        if (this._rules.tens)
            activeRules.push('Tens');
        if (this._rules.marriage)
            activeRules.push('Marriage');
        if (this._rules.topBottom)
            activeRules.push('Top-Bottom');
        if (this._rules.fourInRow)
            activeRules.push('4-in-Row');
        if (this._rules.sequence)
            activeRules.push('Sequence');
        if (this._rules.jokers)
            activeRules.push('Jokers');
        return activeRules;
    }
}
