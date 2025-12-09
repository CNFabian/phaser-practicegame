export const SCENE_KEYS = {
    PRELOAD: 'PreloadScene',
    MENU: 'MenuScene',
    RULES: 'RulesScene',
    GAME: 'GameScene'
};
export const ASSET_KEYS = {
    CARDS: 'cards',
    TITLE: 'title',
    CLICK_TO_START: 'clickToStart'
};
export const CARD_WIDTH = 140;
export const CARD_HEIGHT = 190;
export const CARD_SCALE = 0.4;
export const GAME_WIDTH = 1200;
export const GAME_HEIGHT = 800;
export var Suit;
(function (Suit) {
    Suit["CLUBS"] = "CLUBS";
    Suit["DIAMONDS"] = "DIAMONDS";
    Suit["HEARTS"] = "HEARTS";
    Suit["SPADES"] = "SPADES";
})(Suit || (Suit = {}));
export var Rank;
(function (Rank) {
    Rank["ACE"] = "ACE";
    Rank["TWO"] = "TWO";
    Rank["THREE"] = "THREE";
    Rank["FOUR"] = "FOUR";
    Rank["FIVE"] = "FIVE";
    Rank["SIX"] = "SIX";
    Rank["SEVEN"] = "SEVEN";
    Rank["EIGHT"] = "EIGHT";
    Rank["NINE"] = "NINE";
    Rank["TEN"] = "TEN";
    Rank["JACK"] = "JACK";
    Rank["QUEEN"] = "QUEEN";
    Rank["KING"] = "KING";
})(Rank || (Rank = {}));
export var GameState;
(function (GameState) {
    GameState["MENU"] = "MENU";
    GameState["RULES"] = "RULES";
    GameState["PLAYING"] = "PLAYING";
    GameState["CHALLENGE"] = "CHALLENGE";
    GameState["GAME_OVER"] = "GAME_OVER";
})(GameState || (GameState = {}));
export const FACE_CARD_CHALLENGES = {
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
export const SUIT_OFFSETS = {
    [Suit.CLUBS]: 0,
    [Suit.DIAMONDS]: 1,
    [Suit.HEARTS]: 2,
    [Suit.SPADES]: 3
};
export const RANK_OFFSETS = {
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
export const RANK_DISPLAY = {
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
export const SUIT_DISPLAY = {
    [Suit.CLUBS]: '♣',
    [Suit.DIAMONDS]: '♦',
    [Suit.HEARTS]: '♥',
    [Suit.SPADES]: '♠'
};
export const RANK_VALUES = {
    [Rank.ACE]: 1,
    [Rank.TWO]: 2,
    [Rank.THREE]: 3,
    [Rank.FOUR]: 4,
    [Rank.FIVE]: 5,
    [Rank.SIX]: 6,
    [Rank.SEVEN]: 7,
    [Rank.EIGHT]: 8,
    [Rank.NINE]: 9,
    [Rank.TEN]: 10,
    [Rank.JACK]: 11,
    [Rank.QUEEN]: 12,
    [Rank.KING]: 13
};
export const RED_SUITS = [Suit.DIAMONDS, Suit.HEARTS];
export const BLACK_SUITS = [Suit.CLUBS, Suit.SPADES];
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
};
export const RULE_DESCRIPTIONS = {
    doubles: 'Two cards of same rank in a row (5-5)',
    sandwich: 'Same rank with one card between (5-7-5)',
    tens: 'Two cards that add up to 10 (3-7, 4-6)',
    marriage: 'King and Queen together (K-Q or Q-K)',
    topBottom: 'Top and bottom cards of pile match',
    fourInRow: 'Four consecutive ranks (3-4-5-6)',
    sequence: 'Any 3+ card sequence (5-6-7)',
    jokers: 'Include jokers in deck (always slappable)'
};
export const RULE_NAMES = {
    doubles: 'Doubles',
    sandwich: 'Sandwich',
    tens: 'Adds to 10',
    marriage: 'Marriage',
    topBottom: 'Top-Bottom',
    fourInRow: '4-in-a-Row',
    sequence: 'Sequence',
    jokers: 'Jokers'
};
export const DEFAULT_RULES = {
    doubles: true,
    sandwich: true,
    tens: false,
    marriage: false,
    topBottom: false,
    fourInRow: false,
    sequence: false,
    jokers: false
};
