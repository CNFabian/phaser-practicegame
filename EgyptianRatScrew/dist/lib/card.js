import { Suit, Rank, SUIT_OFFSETS, RANK_OFFSETS, RANK_DISPLAY, SUIT_DISPLAY, RED_SUITS, FACE_CARD_CHALLENGES } from '../common';
export class Card {
    constructor(suit, rank) {
        this._suit = suit;
        this._rank = rank;
    }
    get suit() {
        return this._suit;
    }
    get rank() {
        return this._rank;
    }
    get color() {
        return RED_SUITS.includes(this._suit) ? 'red' : 'black';
    }
    get displayValue() {
        return RANK_DISPLAY[this._rank];
    }
    get displaySuit() {
        return SUIT_DISPLAY[this._suit];
    }
    get spriteFrame() {
        return RANK_OFFSETS[this._rank] * 4 + SUIT_OFFSETS[this._suit];
    }
    get isFaceCard() {
        return FACE_CARD_CHALLENGES[this._rank] > 0;
    }
    get display() {
        return `${this.displayValue}${this.displaySuit}`;
    }
    get challengeCount() {
        return FACE_CARD_CHALLENGES[this._rank];
    }
    equals(other) {
        return this._suit === other._suit && this._rank === other._rank;
    }
    hasSameRank(other) {
        return this._rank === other._rank;
    }
    hasSameSuit(other) {
        return this._suit === other._suit;
    }
    toString() {
        return this.display;
    }
    static createDeck() {
        const deck = [];
        for (const suit of Object.values(Suit)) {
            for (const rank of Object.values(Rank)) {
                deck.push(new Card(suit, rank));
            }
        }
        return deck;
    }
    static shuffleDeck(deck) {
        const shuffled = [...deck];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}
