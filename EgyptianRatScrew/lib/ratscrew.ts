import { Card } from './card';
import { GameState, Player, SlapCondition, GameEvent } from '../common';

export class RatScrew {
  private _player1Deck: Card[] = [];
  private _player2Deck: Card[] = [];
  private _centerPile: Card[] = [];
  private _bonusPile: Card[] = []; // Separate bonus pile for missed slaps
  private _currentPlayer: Player = 1;
  private _gameState: GameState = GameState.PLAYING;
  private _challengePlayer: Player | null = null;
  private _challengeRemaining: number = 0;
  private _events: GameEvent[] = [];
  
  // Pile collection state
  private _pileAwaitingCollection: boolean = false;
  private _pileWinner: Player | null = null;

  constructor() {
    this.initializeGame();
  }

  // Public getters
  get player1Count(): number { return this._player1Deck.length; }
  get player2Count(): number { return this._player2Deck.length; }
  get centerCount(): number { return this._centerPile.length; }
  get bonusCount(): number { return this._bonusPile.length; }
  get currentPlayer(): Player { return this._currentPlayer; }
  get gameState(): GameState { return this._gameState; }
  get challengePlayer(): Player | null { return this._challengePlayer; }
  get challengeRemaining(): number { return this._challengeRemaining; }
  get topCard(): Card | null {
    return this._centerPile.length > 0 ? this._centerPile[this._centerPile.length - 1] : null;
  }
  get events(): readonly GameEvent[] { return this._events; }
  get winner(): Player | null {
    if (this._player1Deck.length === 52) return 1;
    if (this._player2Deck.length === 52) return 2;
    return null;
  }
  get pileAwaitingCollection(): boolean { return this._pileAwaitingCollection; }
  get pileWinner(): Player | null { return this._pileWinner; }

  // Initialize game
  initializeGame(): void {
    // Create and shuffle deck
    const fullDeck = Card.createDeck();
    const shuffledDeck = Card.shuffleDeck(fullDeck);

    // Deal cards
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

  // Main game actions
  playCard(player: Player): boolean {
    if (!this.canPlayerPlay(player)) {
      return false;
    }

    const playerDeck = player === 1 ? this._player1Deck : this._player2Deck;
    if (playerDeck.length === 0) {
      return false;
    }

    const card = playerDeck.shift()!;
    this._centerPile.push(card);

    this.addEvent({
      type: 'card_played',
      player,
      message: `Player ${player} played ${card.display}`
    });

    // CRITICAL: Check for slappable condition BEFORE processing challenge logic
    // This allows doubles/sandwiches to override challenge outcomes
    const slappableCondition = this.getSlappableCondition();
    if (slappableCondition !== 'none') {
      // There's a slappable condition! Alert players
      this.addEvent({
        type: 'slap_attempt',
        player,
        message: `${slappableCondition.toUpperCase()} - SLAP NOW!`
      });
      
      // If we're in a challenge, pause it - the slap takes priority
      if (this._gameState === GameState.CHALLENGE) {
        this.addEvent({
          type: 'challenge_started',
          player: this._challengePlayer!,
          message: `Challenge paused! ${slappableCondition} detected - race to slap!`
        });
      }
      
      // Don't process challenge logic or change state
      // Wait for someone to slap (or miss the opportunity)
      return true;
    }

    // No slappable condition - process normal game flow
    if (card.isFaceCard) {
      // Start a challenge
      this.startChallenge(player === 1 ? 2 : 1, card.challengeCount);
    } else if (this._gameState === GameState.CHALLENGE) {
      // Non-face card during challenge
      this._challengeRemaining--;
      if (this._challengeRemaining <= 0) {
        // Challenge failed - opponent wins
        this.endChallenge(false);
      } else {
        this.addEvent({
          type: 'challenge_started',
          player: this._challengePlayer!,
          message: `Challenge continues. Player ${this._challengePlayer} has ${this._challengeRemaining} chances left.`
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

    // Check if this is a slap to collect a won pile
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
      return false;
    }

    const condition = this.getSlappableCondition();
    
    if (condition !== 'none') {
      // Valid slap - ANY player can win the pile
      // This includes slapping during challenges!
      this.setPileWinner(player);
      
      // If we were in a challenge, end it now
      if (this._gameState === GameState.CHALLENGE) {
        this.addEvent({
          type: 'slap_attempt',
          player,
          condition,
          message: `Player ${player} slapped ${condition} during challenge! Challenge cancelled - Slap again to collect!`
        });
        // Reset challenge state
        this._gameState = GameState.PLAYING;
        this._challengePlayer = null;
        this._challengeRemaining = 0;
      } else {
        this.addEvent({
          type: 'slap_attempt',
          player,
          condition,
          message: `Player ${player} slapped successfully! (${condition}) - Slap again to collect!`
        });
      }
      
      return true;
    } else {
      // Invalid slap - add penalty to BONUS pile
      this.penalizePlayer(player);
      this.addEvent({
        type: 'slap_attempt',
        player,
        message: `Player ${player} slapped incorrectly! Lost one card to bonus pile.`
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
    
    // Also add all bonus pile cards to winner's deck
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
    
    // Reset pile collection state
    this._pileAwaitingCollection = false;
    this._pileWinner = null;
    
    // Player who collected pile goes next
    this._currentPlayer = player;
    this._gameState = GameState.PLAYING;
    
    const totalCards = playerDeck.length;
    this.addEvent({
      type: 'pile_won',
      player,
      message: `Player ${player} collected the pile! (${totalCards} cards total)`
    });

    // Check for game over
    this.checkGameOver();
  }

  private penalizePlayer(player: Player): void {
    const playerDeck = player === 1 ? this._player1Deck : this._player2Deck;
    
    if (playerDeck.length > 0) {
      const card = playerDeck.shift()!;
      // Add penalty card to BONUS pile instead of center pile
      this._bonusPile.push(card);
      
      this.addEvent({
        type: 'slap_attempt',
        player,
        message: `Player ${player} penalized: ${card.display} added to bonus pile (${this._bonusPile.length} cards).`
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
        message: `Game Over! Player ${winner} wins with all 52 cards!`
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