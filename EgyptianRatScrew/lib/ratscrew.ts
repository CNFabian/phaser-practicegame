import { Card } from './card';
import { GameState, Player, SlapCondition, GameEvent } from '../common';

export class RatScrew {
  private _player1Deck: Card[] = [];
  private _player2Deck: Card[] = [];
  private _centerPile: Card[] = [];
  private _gameState: GameState = GameState.PLAYING;
  private _currentPlayer: Player = 1;
  private _challengePlayer: Player | null = null;
  private _challengeRemaining: number = 0;
  private _events: GameEvent[] = [];
  private _pileAwaitingCollection: boolean = false; // NEW: Track if pile needs to be slapped to collect
  private _pileWinner: Player | null = null; // NEW: Track who won the pile

  constructor() {
    this.initializeGame();
  }

  // Getters
  get player1Deck(): readonly Card[] {
    return this._player1Deck;
  }

  get player2Deck(): readonly Card[] {
    return this._player2Deck;
  }

  get centerPile(): readonly Card[] {
    return this._centerPile;
  }

  get topCard(): Card | null {
    return this._centerPile.length > 0 ? this._centerPile[this._centerPile.length - 1] : null;
  }

  get gameState(): GameState {
    return this._gameState;
  }

  get currentPlayer(): Player {
    return this._currentPlayer;
  }

  get challengePlayer(): Player | null {
    return this._challengePlayer;
  }

  get challengeRemaining(): number {
    return this._challengeRemaining;
  }

  get player1Count(): number {
    return this._player1Deck.length;
  }

  get player2Count(): number {
    return this._player2Deck.length;
  }

  get centerCount(): number {
    return this._centerPile.length;
  }

  get winner(): Player | null {
    if (this._player1Deck.length === 0 && this._player2Deck.length === 0) {
      return null;
    }
    if (this._player1Deck.length === 52) return 1;
    if (this._player2Deck.length === 52) return 2;
    if (this._player1Deck.length === 0) return 2;
    if (this._player2Deck.length === 0) return 1;
    return null;
  }

  get events(): readonly GameEvent[] {
    return this._events;
  }

  get pileAwaitingCollection(): boolean {
    return this._pileAwaitingCollection;
  }

  get pileWinner(): Player | null {
    return this._pileWinner;
  }

  // Game initialization
  private initializeGame(): void {
    const deck = Card.shuffleDeck(Card.createDeck());
    
    this._player1Deck = deck.slice(0, 26);
    this._player2Deck = deck.slice(26, 52);
    this._centerPile = [];
    this._gameState = GameState.PLAYING;
    this._currentPlayer = 1;
    this._challengePlayer = null;
    this._challengeRemaining = 0;
    this._pileAwaitingCollection = false;
    this._pileWinner = null;
    
    this.addEvent({
      type: 'card_played',
      player: 1,
      message: 'Game started! Player 1 goes first.'
    });
  }

  // Main game actions
  playCard(player: Player): boolean {
    if (this._gameState === GameState.GAME_OVER) {
      return false;
    }

    // Can't play if a pile is awaiting collection
    if (this._pileAwaitingCollection) {
      return false;
    }

    // Check if it's the player's turn (unless in challenge mode)
    if (this._gameState === GameState.PLAYING && player !== this._currentPlayer) {
      return false;
    }

    if (this._gameState === GameState.CHALLENGE && player !== this._challengePlayer) {
      return false;
    }

    // Get the player's deck
    const playerDeck = player === 1 ? this._player1Deck : this._player2Deck;
    
    if (playerDeck.length === 0) {
      // Player has no cards - check for game over
      this.checkGameOver();
      return false;
    }

    // Play the top card
    const card = playerDeck.shift()!;
    this._centerPile.push(card);

    this.addEvent({
      type: 'card_played',
      player,
      message: `Player ${player} played ${card.display}`
    });

    // Handle face card logic
    if (card.isFaceCard) {
      this.startChallenge(player === 1 ? 2 : 1, card.challengeCount);
    } else if (this._gameState === GameState.CHALLENGE) {
      // Non-face card during challenge
      this._challengeRemaining--;
      if (this._challengeRemaining <= 0) {
        // Challenge failed - original player wins (but must slap to collect)
        this.endChallenge(false);
      } else {
        // Continue challenge
        this.addEvent({
          type: 'challenge_started',
          player: this._challengePlayer!,
          message: `Challenge continues. ${this._challengeRemaining} chances left.`
        });
      }
    } else {
      // Normal play - switch turns
      this._currentPlayer = player === 1 ? 2 : 1;
    }

    // Check for game over
    this.checkGameOver();

    return true;
  }

  attemptSlap(player: Player): boolean {
    // Don't allow slapping if game is over
    if (this._gameState === GameState.GAME_OVER) {
      return false;
    }

    // NEW: Check if this is a slap to collect a won pile
    if (this._pileAwaitingCollection) {
      if (player === this._pileWinner) {
        // Correct player slapping to collect their won pile
        this.collectPile(player);
        return true;
      } else {
        // Wrong player tried to collect - no penalty, just ignore
        return false;
      }
    }

    // Need at least 2 cards to slap for doubles (or 3 for sandwiches)
    if (this._centerPile.length < 2) {
      // Silently ignore slaps when there aren't enough cards
      // This prevents penalties for spam clicking before cards are played
      return false;
    }

    const condition = this.getSlappableCondition();
    
    if (condition !== 'none') {
      // Valid slap - player wins the pile (but must slap again to collect)
      this.setPileWinner(player);
      this.addEvent({
        type: 'slap_attempt',
        player,
        condition,
        message: `Player ${player} slapped successfully! (${condition}) - Slap again to collect!`
      });
      return true;
    } else {
      // Invalid slap - penalty
      this.penalizePlayer(player);
      this.addEvent({
        type: 'slap_attempt',
        player,
        message: `Player ${player} slapped incorrectly! Lost one card.`
      });
      return false;
    }
  }

  // Helper methods
  private startChallenge(challengePlayer: Player, challengeCount: number): void {
    this._gameState = GameState.CHALLENGE;
    this._challengePlayer = challengePlayer;
    this._challengeRemaining = challengeCount;
    
    this.addEvent({
      type: 'challenge_started',
      player: challengePlayer,
      message: `Face card challenge! Player ${challengePlayer} has ${challengeCount} chances.`
    });
  }

  private endChallenge(challengerWon: boolean): void {
    if (challengerWon) {
      // Challenger played a face card, they win the pile
      if (this._challengePlayer) {
        this.setPileWinner(this._challengePlayer);
        this.addEvent({
          type: 'pile_won',
          player: this._challengePlayer,
          message: `Player ${this._challengePlayer} won the challenge! Slap to collect!`
        });
      }
    } else {
      // Challenger failed, original player wins
      const originalPlayer = this._challengePlayer === 1 ? 2 : 1;
      this.setPileWinner(originalPlayer);
      this.addEvent({
        type: 'challenge_failed',
        player: originalPlayer,
        message: `Challenge failed! Player ${originalPlayer} wins the pile - Slap to collect!`
      });
    }

    // Reset challenge state but keep pile on table
    this._gameState = GameState.PLAYING;
    this._challengePlayer = null;
    this._challengeRemaining = 0;
  }

  private setPileWinner(player: Player): void {
    this._pileAwaitingCollection = true;
    this._pileWinner = player;
    this._currentPlayer = player; // Winner's turn next
  }

  private collectPile(player: Player): void {
    const playerDeck = player === 1 ? this._player1Deck : this._player2Deck;
    
    // Add all center cards to bottom of player's deck
    playerDeck.push(...this._centerPile);
    this._centerPile = [];
    
    // Reset pile collection state
    this._pileAwaitingCollection = false;
    this._pileWinner = null;
    
    // Player who collected pile goes next
    this._currentPlayer = player;
    this._gameState = GameState.PLAYING;
    
    this.addEvent({
      type: 'pile_won',
      player,
      message: `Player ${player} collected the pile! (${playerDeck.length} cards total)`
    });

    // Check for game over
    this.checkGameOver();
  }

  private penalizePlayer(player: Player): void {
    const playerDeck = player === 1 ? this._player1Deck : this._player2Deck;
    
    if (playerDeck.length > 0) {
      const card = playerDeck.shift()!;
      // Add penalty card to TOP of center pile so it becomes visible
      this._centerPile.push(card);
      
      this.addEvent({
        type: 'slap_attempt',
        player,
        message: `Player ${player} penalized: ${card.display} added to center pile.`
      });
    } else {
      // Player has no cards to penalize
      this.addEvent({
        type: 'slap_attempt',
        player,
        message: `Player ${player} has no cards to penalize!`
      });
    }
    
    // Check if this causes game over
    this.checkGameOver();
  }

  private getSlappableCondition(): SlapCondition {
    // Need at least 2 cards for doubles
    if (this._centerPile.length < 2) {
      return 'none';
    }

    const pile = this._centerPile;
    const topCard = pile[pile.length - 1];
    const secondCard = pile[pile.length - 2];

    // Defensive check for undefined cards
    if (!topCard || !secondCard) {
      console.error('Undefined cards in center pile during slap check');
      return 'none';
    }

    // Check for doubles (two consecutive cards of same rank)
    if (topCard.hasSameRank(secondCard)) {
      console.log(`DOUBLE DETECTED: ${topCard.display} and ${secondCard.display}`);
      return 'doubles';
    }

    // Check for sandwich (same rank separated by one card)
    if (pile.length >= 3) {
      const thirdCard = pile[pile.length - 3];
      
      if (!thirdCard) {
        console.error('Undefined third card in center pile during sandwich check');
        return 'none';
      }
      
      if (topCard.hasSameRank(thirdCard)) {
        console.log(`SANDWICH DETECTED: ${topCard.display}, ${secondCard.display}, ${thirdCard.display}`);
        return 'sandwich';
      }
    }

    return 'none';
  }

  private checkGameOver(): void {
    const winner = this.winner;
    if (winner) {
      this._gameState = GameState.GAME_OVER;
      this.addEvent({
        type: 'game_over',
        player: winner,
        message: `Game Over! Player ${winner} wins!`
      });
    }
  }

  private addEvent(event: GameEvent): void {
    this._events.push(event);
    console.log(`[RatScrew] ${event.message}`);
  }

  // Utility methods
  canPlayerPlay(player: Player): boolean {
    if (this._gameState === GameState.GAME_OVER) {
      return false;
    }

    // Can't play if pile is awaiting collection
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

  getPlayerDeck(player: Player): readonly Card[] {
    return player === 1 ? this._player1Deck : this._player2Deck;
  }

  getGameStatusMessage(): string {
    if (this._pileAwaitingCollection && this._pileWinner) {
      return `Player ${this._pileWinner}: Slap to collect the pile!`;
    }
    const latestEvent = this._events[this._events.length - 1];
    return latestEvent?.message || 'Game ready';
  }

  isValidSlap(): boolean {
    return this.getSlappableCondition() !== 'none';
  }
}