// Scene keys for Phaser scene management
export const SCENE_KEYS = {
  PRELOAD: 'PreloadScene',
  MENU: 'MenuScene',
  GAME: 'GameScene'
} as const;

// Asset keys for loading and referencing game assets
export const ASSET_KEYS = {
  CARDS: 'cards',
  TITLE: 'title',
  CLICK_TO_START: 'clickToStart'
} as const;

// Card dimensions and scaling - INCREASED FROM 0.4 TO 0.6 FOR 50% LARGER CARDS
export const CARD_WIDTH = 140;
export const CARD_HEIGHT = 190;
export const CARD_SCALE = 0.6;

// Game dimensions
export const GAME_WIDTH = 1200;
export const GAME_HEIGHT = 800;

// Card suit enumeration
export enum Suit {
  CLUBS = 'CLUBS',
  DIAMONDS = 'DIAMONDS',
  HEARTS = 'HEARTS',
  SPADES = 'SPADES'
}

// Card rank enumeration
export enum Rank {
  ACE = 'ACE',
  TWO = 'TWO',
  THREE = 'THREE',
  FOUR = 'FOUR',
  FIVE = 'FIVE',
  SIX = 'SIX',
  SEVEN = 'SEVEN',
  EIGHT = 'EIGHT',
  NINE = 'NINE',
  TEN = 'TEN',
  JACK = 'JACK',
  QUEEN = 'QUEEN',
  KING = 'KING'
}

// Game state enumeration
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  CHALLENGE = 'CHALLENGE',
  GAME_OVER = 'GAME_OVER'
}

// Player type
export type Player = 1 | 2;

// Face card challenge counts
export const FACE_CARD_CHALLENGES: Record<Rank, number> = {
  [Rank.ACE]: 4,
  [Rank.TWO]: 0,
  [Rank.THREE]: 0,
  [Rank.FOUR]: 0,
  [Rank.FIVE]: 0,
  [Rank.SIX]: 0,
  [Rank.SEVEN]: 0,
  [Rank.EIGHT]: 0,
  [Rank.NINE]: 0,
  [Rank.TEN]: 0,
  [Rank.JACK]: 1,
  [Rank.QUEEN]: 2,
  [Rank.KING]: 3
};

// Spritesheet frame mappings
export const SUIT_OFFSETS: Record<Suit, number> = {
  [Suit.CLUBS]: 0,
  [Suit.DIAMONDS]: 1,
  [Suit.HEARTS]: 2,
  [Suit.SPADES]: 3
};

export const RANK_OFFSETS: Record<Rank, number> = {
  [Rank.ACE]: 0,
  [Rank.TWO]: 1,
  [Rank.THREE]: 2,
  [Rank.FOUR]: 3,
  [Rank.FIVE]: 4,
  [Rank.SIX]: 5,
  [Rank.SEVEN]: 6,
  [Rank.EIGHT]: 7,
  [Rank.NINE]: 8,
  [Rank.TEN]: 9,
  [Rank.JACK]: 10,
  [Rank.QUEEN]: 11,
  [Rank.KING]: 12
};

// Card display values
export const RANK_DISPLAY: Record<Rank, string> = {
  [Rank.ACE]: 'A',
  [Rank.TWO]: '2',
  [Rank.THREE]: '3',
  [Rank.FOUR]: '4',
  [Rank.FIVE]: '5',
  [Rank.SIX]: '6',
  [Rank.SEVEN]: '7',
  [Rank.EIGHT]: '8',
  [Rank.NINE]: '9',
  [Rank.TEN]: '10',
  [Rank.JACK]: 'J',
  [Rank.QUEEN]: 'Q',
  [Rank.KING]: 'K'
};

export const SUIT_DISPLAY: Record<Suit, string> = {
  [Suit.CLUBS]: '♣',
  [Suit.DIAMONDS]: '♦',
  [Suit.HEARTS]: '♥',
  [Suit.SPADES]: '♠'
};

// Color helpers
export const RED_SUITS = [Suit.DIAMONDS, Suit.HEARTS];
export const BLACK_SUITS = [Suit.CLUBS, Suit.SPADES];

// Game colors
export const COLORS = {
  BACKGROUND: '#0a5f38',
  GOLD: '#ffd700',
  WHITE: '#ffffff',
  BLACK: '#000000',
  RED: '#ff0000',
  GREEN: '#00ff00',
  ORANGE: '#ff8c00',
  LIGHT_GRAY: '#d3d3d3',
  BLUE: '#4169E1',
  YELLOW: '#FFFF00'
} as const;

// Slap condition types
export type SlapCondition = 'doubles' | 'sandwich' | 'none';

// Game event types
export interface GameEvent {
  type: 'card_played' | 'slap_attempt' | 'pile_won' | 'game_over' | 'challenge_started' | 'challenge_failed';
  player?: Player;
  condition?: SlapCondition;
  message?: string;
}