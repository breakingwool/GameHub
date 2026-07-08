import { useState, useCallback, useEffect, useRef } from 'react';
import './Chess.css';

// ─── Piece Constants ───────────────────────────────────────────────
const EMPTY = 0;
const W_PAWN = 1, W_KNIGHT = 2, W_BISHOP = 3, W_ROOK = 4, W_QUEEN = 5, W_KING = 6;
const B_PAWN = 7, B_KNIGHT = 8, B_BISHOP = 9, B_ROOK = 10, B_QUEEN = 11, B_KING = 12;

const PIECE_UNICODE = {
  [W_KING]: '♔', [W_QUEEN]: '♕', [W_ROOK]: '♖', [W_BISHOP]: '♗', [W_KNIGHT]: '♘', [W_PAWN]: '♙',
  [B_KING]: '♚', [B_QUEEN]: '♛', [B_ROOK]: '♜', [B_BISHOP]: '♝', [B_KNIGHT]: '♞', [B_PAWN]: '♟',
};

const PIECE_NAMES = {
  [W_KING]: 'White King', [W_QUEEN]: 'White Queen', [W_ROOK]: 'White Rook',
  [W_BISHOP]: 'White Bishop', [W_KNIGHT]: 'White Knight', [W_PAWN]: 'White Pawn',
  [B_KING]: 'Black King', [B_QUEEN]: 'Black Queen', [B_ROOK]: 'Black Rook',
  [B_BISHOP]: 'Black Bishop', [B_KNIGHT]: 'Black Knight', [B_PAWN]: 'Black Pawn',
};


const isWhite = (p) => p >= 1 && p <= 6;
const isBlack = (p) => p >= 7 && p <= 12;
const colorOf = (p) => (isWhite(p) ? 'w' : isBlack(p) ? 'b' : null);
const opponent = (c) => (c === 'w' ? 'b' : 'w');

// ─── Piece-Square Tables (for AI evaluation) ───────────────────────
const PST = {
  pawn: [
    0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5,  5, 10, 25, 25, 10,  5,  5,
    0,  0,  0, 20, 20,  0,  0,  0,
    5, -5,-10,  0,  0,-10, -5,  5,
    5, 10, 10,-20,-20, 10, 10,  5,
    0,  0,  0,  0,  0,  0,  0,  0,
  ],
  knight: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  bishop: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  rook: [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0,
  ],
  queen: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
    -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20,
  ],
  king: [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
    20, 20,  0,  0,  0,  0, 20, 20,
    20, 30, 10,  0,  0, 10, 30, 20,
  ],
};

const PIECE_VALUES = {
  [W_PAWN]: 100, [W_KNIGHT]: 320, [W_BISHOP]: 330, [W_ROOK]: 500, [W_QUEEN]: 900, [W_KING]: 20000,
  [B_PAWN]: 100, [B_KNIGHT]: 320, [B_BISHOP]: 330, [B_ROOK]: 500, [B_QUEEN]: 900, [B_KING]: 20000,
};

// ─── Initial Board Setup ───────────────────────────────────────────
function initialBoard() {
  return [
    [B_ROOK, B_KNIGHT, B_BISHOP, B_QUEEN, B_KING, B_BISHOP, B_KNIGHT, B_ROOK],
    [B_PAWN, B_PAWN, B_PAWN, B_PAWN, B_PAWN, B_PAWN, B_PAWN, B_PAWN],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [W_PAWN, W_PAWN, W_PAWN, W_PAWN, W_PAWN, W_PAWN, W_PAWN, W_PAWN],
    [W_ROOK, W_KNIGHT, W_BISHOP, W_QUEEN, W_KING, W_BISHOP, W_KNIGHT, W_ROOK],
  ];
}

// ─── Chess Engine ──────────────────────────────────────────────────
function cloneBoard(b) { return b.map(r => [...r]); }

function inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

function findKing(board, color) {
  const king = color === 'w' ? W_KING : B_KING;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c] === king) return [r, c];
  return null;
}

function isSquareAttacked(board, r, c, byColor) {
  // Check by pawns
  const pawn = byColor === 'w' ? W_PAWN : B_PAWN;
  const pawnDir = byColor === 'w' ? 1 : -1;
  for (const dc of [-1, 1]) {
    const pr = r + pawnDir, pc = c + dc;
    if (inBounds(pr, pc) && board[pr][pc] === pawn) return true;
  }
  // Check by knights
  const knight = byColor === 'w' ? W_KNIGHT : B_KNIGHT;
  for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
    const nr = r + dr, nc = c + dc;
    if (inBounds(nr, nc) && board[nr][nc] === knight) return true;
  }
  // Check by king
  const king = byColor === 'w' ? W_KING : B_KING;
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc) && board[nr][nc] === king) return true;
    }
  // Check by rook/queen (straight lines)
  const rook = byColor === 'w' ? W_ROOK : B_ROOK;
  const queen = byColor === 'w' ? W_QUEEN : B_QUEEN;
  for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
    let nr = r + dr, nc = c + dc;
    while (inBounds(nr, nc)) {
      if (board[nr][nc] !== EMPTY) {
        if (board[nr][nc] === rook || board[nr][nc] === queen) return true;
        break;
      }
      nr += dr; nc += dc;
    }
  }
  // Check by bishop/queen (diagonals)
  for (const [dr, dc] of [[1,1],[1,-1],[-1,1],[-1,-1]]) {
    let nr = r + dr, nc = c + dc;
    while (inBounds(nr, nc)) {
      if (board[nr][nc] !== EMPTY) {
        if (board[nr][nc] === (byColor === 'w' ? W_BISHOP : B_BISHOP) || board[nr][nc] === queen) return true;
        break;
      }
      nr += dr; nc += dc;
    }
  }
  return false;
}

function isInCheck(board, color) {
  const kp = findKing(board, color);
  if (!kp) return false;
  return isSquareAttacked(board, kp[0], kp[1], opponent(color));
}

function generatePseudoMoves(board, color, castlingRights, enPassant) {
  const moves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece === EMPTY || colorOf(piece) !== color) continue;

      const type = (piece <= 6 ? piece - 1 : piece - 7) + 1; // 1=pawn, 2=knight, ...

      // Pawn moves
      if (type === 1) {
        const dir = color === 'w' ? -1 : 1;
        const startRow = color === 'w' ? 6 : 1;
        const promoRow = color === 'w' ? 0 : 7;
        // Forward 1
        if (inBounds(r + dir, c) && board[r + dir][c] === EMPTY) {
          if (r + dir === promoRow) {
            for (const promo of [2, 3, 4, 5]) { // knight, bishop, rook, queen
              moves.push({ from: [r, c], to: [r + dir, c], promotion: promo });
            }
          } else {
            moves.push({ from: [r, c], to: [r + dir, c] });
          }
          // Forward 2
          if (r === startRow && board[r + 2 * dir][c] === EMPTY) {
            moves.push({ from: [r, c], to: [r + 2 * dir, c] });
          }
        }
        // Captures
        for (const dc of [-1, 1]) {
          const nr = r + dir, nc = c + dc;
          if (!inBounds(nr, nc)) continue;
          if (board[nr][nc] !== EMPTY && colorOf(board[nr][nc]) !== color) {
            if (nr === promoRow) {
              for (const promo of [2, 3, 4, 5]) {
                moves.push({ from: [r, c], to: [nr, nc], promotion: promo });
              }
            } else {
              moves.push({ from: [r, c], to: [nr, nc] });
            }
          }
          // En passant
          if (enPassant && enPassant[0] === nr && enPassant[1] === nc) {
            moves.push({ from: [r, c], to: [nr, nc], enPassant: true });
          }
        }
      }

      // Knight
      if (type === 2) {
        for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
          const nr = r + dr, nc = c + dc;
          if (inBounds(nr, nc) && colorOf(board[nr][nc]) !== color) {
            moves.push({ from: [r, c], to: [nr, nc] });
          }
        }
      }

      // Bishop
      if (type === 3) {
        for (const [dr, dc] of [[1,1],[1,-1],[-1,1],[-1,-1]]) {
          let nr = r + dr, nc = c + dc;
          while (inBounds(nr, nc)) {
            if (board[nr][nc] === EMPTY) {
              moves.push({ from: [r, c], to: [nr, nc] });
            } else {
              if (colorOf(board[nr][nc]) !== color) moves.push({ from: [r, c], to: [nr, nc] });
              break;
            }
            nr += dr; nc += dc;
          }
        }
      }

      // Rook
      if (type === 4) {
        for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
          let nr = r + dr, nc = c + dc;
          while (inBounds(nr, nc)) {
            if (board[nr][nc] === EMPTY) {
              moves.push({ from: [r, c], to: [nr, nc] });
            } else {
              if (colorOf(board[nr][nc]) !== color) moves.push({ from: [r, c], to: [nr, nc] });
              break;
            }
            nr += dr; nc += dc;
          }
        }
      }

      // Queen
      if (type === 5) {
        for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]) {
          let nr = r + dr, nc = c + dc;
          while (inBounds(nr, nc)) {
            if (board[nr][nc] === EMPTY) {
              moves.push({ from: [r, c], to: [nr, nc] });
            } else {
              if (colorOf(board[nr][nc]) !== color) moves.push({ from: [r, c], to: [nr, nc] });
              break;
            }
            nr += dr; nc += dc;
          }
        }
      }

      // King
      if (type === 6) {
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr, nc = c + dc;
            if (inBounds(nr, nc) && colorOf(board[nr][nc]) !== color) {
              moves.push({ from: [r, c], to: [nr, nc] });
            }
          }
        // Castling
        if (castlingRights) {
          const row = color === 'w' ? 7 : 0;
          if (r === row && c === 4) {
            // Kingside
            const ksKey = color === 'w' ? 'WK' : 'BK';
            if (castlingRights[ksKey] && board[row][5] === EMPTY && board[row][6] === EMPTY && board[row][7] === (color === 'w' ? W_ROOK : B_ROOK)) {
              if (!isSquareAttacked(board, row, 4, opponent(color)) && !isSquareAttacked(board, row, 5, opponent(color)) && !isSquareAttacked(board, row, 6, opponent(color))) {
                moves.push({ from: [r, c], to: [row, 6], castle: 'K' });
              }
            }
            // Queenside
            const qsKey = color === 'w' ? 'WQ' : 'BQ';
            if (castlingRights[qsKey] && board[row][3] === EMPTY && board[row][2] === EMPTY && board[row][1] === EMPTY && board[row][0] === (color === 'w' ? W_ROOK : B_ROOK)) {
              if (!isSquareAttacked(board, row, 4, opponent(color)) && !isSquareAttacked(board, row, 3, opponent(color)) && !isSquareAttacked(board, row, 2, opponent(color))) {
                moves.push({ from: [r, c], to: [row, 2], castle: 'Q' });
              }
            }
          }
        }
      }
    }
  }
  return moves;
}

function makeMove(board, move) {
  const newBoard = cloneBoard(board);
  const piece = newBoard[move.from[0]][move.from[1]];
  newBoard[move.to[0]][move.to[1]] = piece;
  newBoard[move.from[0]][move.from[1]] = EMPTY;

  // En passant capture
  if (move.enPassant) {
    const capturedRow = move.from[0];
    newBoard[capturedRow][move.to[1]] = EMPTY;
  }

  // Castling rook move
  if (move.castle) {
    const row = move.from[0];
    if (move.castle === 'K') {
      newBoard[row][5] = newBoard[row][7];
      newBoard[row][7] = EMPTY;
    } else {
      newBoard[row][3] = newBoard[row][0];
      newBoard[row][0] = EMPTY;
    }
  }

  // Promotion
  if (move.promotion) {
    const color = colorOf(piece);
    const promoMap = {
      'w': { 2: W_KNIGHT, 3: W_BISHOP, 4: W_ROOK, 5: W_QUEEN },
      'b': { 2: B_KNIGHT, 3: B_BISHOP, 4: B_ROOK, 5: B_QUEEN },
    };
    newBoard[move.to[0]][move.to[1]] = promoMap[color][move.promotion];
  }

  return newBoard;
}

function getLegalMoves(board, color, castlingRights, enPassant) {
  const pseudoMoves = generatePseudoMoves(board, color, castlingRights, enPassant);
  return pseudoMoves.filter(move => {
    const newBoard = makeMove(board, move);
    return !isInCheck(newBoard, color);
  });
}

function updateCastlingRights(castling, move, board) {
  const newCastling = { ...castling };
  const piece = board[move.from[0]][move.from[1]];
  // King moved
  if (piece === W_KING) { delete newCastling.WK; delete newCastling.WQ; }
  if (piece === B_KING) { delete newCastling.BK; delete newCastling.BQ; }
  // Rook moved or captured
  if (move.from[0] === 7 && move.from[1] === 0) delete newCastling.WQ;
  if (move.from[0] === 7 && move.from[1] === 7) delete newCastling.WK;
  if (move.from[0] === 0 && move.from[1] === 0) delete newCastling.BQ;
  if (move.from[0] === 0 && move.from[1] === 7) delete newCastling.BK;
  if (move.to[0] === 7 && move.to[1] === 0) delete newCastling.WQ;
  if (move.to[0] === 7 && move.to[1] === 7) delete newCastling.WK;
  if (move.to[0] === 0 && move.to[1] === 0) delete newCastling.BQ;
  if (move.to[0] === 0 && move.to[1] === 7) delete newCastling.BK;
  return newCastling;
}

function getEnPassant(move, board) {
  const piece = board[move.from[0]][move.from[1]];
  if ((piece === W_PAWN || piece === B_PAWN) && Math.abs(move.to[0] - move.from[0]) === 2) {
    return [(move.from[0] + move.to[0]) / 2, move.from[1]];
  }
  return null;
}

// ─── AI Evaluation & Search ────────────────────────────────────────
function evaluateBoard(board) {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece === EMPTY) continue;
      const val = PIECE_VALUES[piece];
      const type = piece <= 6 ? piece - 1 : piece - 7;
      const pieceType = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'][type];
      const pstIdx = isWhite(piece) ? r * 8 + c : (7 - r) * 8 + c;
      const pstVal = PST[pieceType]?.[pstIdx] || 0;
      score += isWhite(piece) ? val + pstVal : -(val + pstVal);
    }
  }
  return score;
}

function minimax(board, depth, alpha, beta, maximizing, castling, enPassant) {
  const color = maximizing ? 'w' : 'b';
  const legalMoves = getLegalMoves(board, color, castling, enPassant);

  if (depth === 0 || legalMoves.length === 0) {
    if (legalMoves.length === 0) {
      if (isInCheck(board, color)) return maximizing ? -99999 + (3 - depth) * 100 : 99999 - (3 - depth) * 100;
      return 0; // stalemate
    }
    return evaluateBoard(board);
  }

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of legalMoves) {
      const newBoard = makeMove(board, move);
      const newCastling = updateCastlingRights(castling, move, board);
      const newEnPassant = getEnPassant(move, board);
      const eval_ = minimax(newBoard, depth - 1, alpha, beta, false, newCastling, newEnPassant);
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of legalMoves) {
      const newBoard = makeMove(board, move);
      const newCastling = updateCastlingRights(castling, move, board);
      const newEnPassant = getEnPassant(move, board);
      const eval_ = minimax(newBoard, depth - 1, alpha, beta, true, newCastling, newEnPassant);
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getBestMove(board, color, castling, enPassant, depth = 3) {
  const legalMoves = getLegalMoves(board, color, castling, enPassant);
  if (legalMoves.length === 0) return null;

  const maximizing = color === 'w';
  let bestMove = legalMoves[0];
  let bestVal = maximizing ? -Infinity : Infinity;

  for (const move of legalMoves) {
    const newBoard = makeMove(board, move);
    const newCastling = updateCastlingRights(castling, move, board);
    const newEnPassant = getEnPassant(move, board);
    const val = minimax(newBoard, depth - 1, -Infinity, Infinity, !maximizing, newCastling, newEnPassant);
    if (maximizing ? val > bestVal : val < bestVal) {
      bestVal = val;
      bestMove = move;
    }
  }
  return bestMove;
}

// ─── Move Notation Helper ──────────────────────────────────────────
function toAlgebraic(move, board) {
  const piece = board[move.from[0]][move.from[1]];
  const files = 'abcdefgh';
  const ranks = '87654321';
  const type = piece <= 6 ? piece - 1 : piece - 7;
  const pieceLetters = ['', 'N', 'B', 'R', 'Q', 'K'];
  const letter = pieceLetters[type] || '';
  const capture = board[move.to[0]][move.to[1]] !== EMPTY || move.enPassant ? 'x' : '';
  return `${letter}${files[move.from[1]]}${ranks[move.from[0]]}${capture}${files[move.to[1]]}${ranks[move.to[0]]}${move.promotion ? '=' + pieceLetters[move.promotion] : ''}`;
}

// ─── React Component ───────────────────────────────────────────────
function Chess() {
  const [board, setBoard] = useState(initialBoard());
  const [turn, setTurn] = useState('w');
  const [castlingRights, setCastlingRights] = useState({ WK: true, WQ: true, BK: true, BQ: true });
  const [enPassant, setEnPassant] = useState(null);
  const [selected, setSelected] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing'); // playing, checkmate, stalemate, draw
  const [moveHistory, setMoveHistory] = useState([]);
  const [capturedWhite, setCapturedWhite] = useState([]);
  const [capturedBlack, setCapturedBlack] = useState([]);
  const [botThinking, setBotThinking] = useState(false);
  const [difficulty, setDifficulty] = useState(3);
  const [lastMove, setLastMove] = useState(null);
  const [promotionPending, setPromotionPending] = useState(null);

  const isPlayerTurn = turn === 'w';

  const applyMove = useCallback((move) => {
    setBoard(prev => {
      const piece = prev[move.from[0]][move.from[1]];
      const captured = prev[move.to[0]][move.to[1]];
      const newBoard = makeMove(prev, move);

      // Track captured pieces
      if (captured !== EMPTY) {
        if (isWhite(captured)) setCapturedWhite(prev => [...prev, captured]);
        else setCapturedBlack(prev => [...prev, captured]);
      }
      if (move.enPassant) {
        const epPiece = prev[move.from[0]][move.to[1]];
        if (isWhite(epPiece)) setCapturedWhite(prev => [...prev, epPiece]);
        else setCapturedBlack(prev => [...prev, epPiece]);
      }

      const newCastling = updateCastlingRights(castlingRights, move, prev);
      setCastlingRights(newCastling);
      setEnPassant(getEnPassant(move, prev));
      setLastMove(move);

      const nextColor = turn === 'w' ? 'b' : 'w';
      setTurn(nextColor);

      // Record move
      const notation = toAlgebraic(move, prev);
      setMoveHistory(prev => [...prev, notation]);

      // Check game end
      const nextMoves = getLegalMoves(newBoard, nextColor, newCastling, getEnPassant(move, prev));
      if (nextMoves.length === 0) {
        if (isInCheck(newBoard, nextColor)) {
          setGameStatus('checkmate');
        } else {
          setGameStatus('stalemate');
        }
      } else if (isInCheck(newBoard, nextColor)) {
        // Still in check but has moves
      }

      return newBoard;
    });
  }, [turn, castlingRights]);

  // Bot move
  useEffect(() => {
    if (turn === 'b' && gameStatus === 'playing' && !botThinking) {
      setBotThinking(true);
      setTimeout(() => {
        const best = getBestMove(board, 'b', castlingRights, enPassant, difficulty);
        if (best) {
          applyMove(best);
        }
        setBotThinking(false);
      }, 300);
    }
  }, [turn, gameStatus, board, castlingRights, enPassant, difficulty, applyMove, botThinking]);

  const handleCellClick = (r, c) => {
    if (gameStatus !== 'playing' || !isPlayerTurn || botThinking) return;

    if (selected) {
      // Try to make a move
      const move = legalMoves.find(m => m.to[0] === r && m.to[1] === c);
      if (move) {
        // Check if it's a pawn promotion (player chooses)
        const piece = board[selected[0]][selected[1]];
        const isPawnPromo = (piece === W_PAWN || piece === B_PAWN) && (r === 0 || r === 7);
        if (isPawnPromo && !move.promotion) {
          // Show promotion dialog
          const promoMoves = legalMoves.filter(m => m.to[0] === r && m.to[1] === c);
          setPromotionPending({ moves: promoMoves, targetR: r, targetC: c });
          return;
        }
        applyMove(move);
        setSelected(null);
        setLegalMoves([]);
        return;
      }
      // Select another piece
      if (board[r][c] !== EMPTY && colorOf(board[r][c]) === 'w') {
        const newSelected = [r, c];
        setSelected(newSelected);
        setLegalMoves(getLegalMoves(board, 'w', castlingRights, enPassant).filter(m => m.from[0] === r && m.from[1] === c));
        return;
      }
      setSelected(null);
      setLegalMoves([]);
      return;
    }

    // Select a piece
    if (board[r][c] !== EMPTY && colorOf(board[r][c]) === 'w') {
      setSelected([r, c]);
      setLegalMoves(getLegalMoves(board, 'w', castlingRights, enPassant).filter(m => m.from[0] === r && m.from[1] === c));
    }
  };

  const handlePromotion = (promoType) => {
    if (!promotionPending) return;
    const move = promotionPending.moves.find(m => m.promotion === promoType);
    if (move) {
      applyMove(move);
      setSelected(null);
      setLegalMoves([]);
    }
    setPromotionPending(null);
  };

  const resetGame = () => {
    setBoard(initialBoard());
    setTurn('w');
    setCastlingRights({ WK: true, WQ: true, BK: true, BQ: true });
    setEnPassant(null);
    setSelected(null);
    setLegalMoves([]);
    setGameStatus('playing');
    setMoveHistory([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setBotThinking(false);
    setLastMove(null);
    setPromotionPending(null);
  };

  const isLegalTarget = (r, c) => legalMoves.some(m => m.to[0] === r && m.to[1] === c);
  const isCheck = isInCheck(board, turn);

  const renderCaptured = (pieces, label) => (
    <div className="chess-captured">
      <span className="captured-label">{label}</span>
      {pieces.sort((a, b) => PIECE_VALUES[b] - PIECE_VALUES[a]).map((p, i) => (
        <span key={i} className="captured-piece">{PIECE_UNICODE[p]}</span>
      ))}
    </div>
  );

  return (
    <div className="chess-game">
      <div className="chess-header">
        <h2>♟ Chess</h2>
        <div className="chess-controls">
          <label className="chess-diff-label">
            AI Depth:
            <select value={difficulty} onChange={e => setDifficulty(Number(e.target.value))} disabled={botThinking || gameStatus !== 'playing'}>
              <option value={1}>Easy</option>
              <option value={2}>Medium</option>
              <option value={3}>Hard</option>
              <option value={4}>Expert</option>
            </select>
          </label>
          <button className="chess-reset-btn" onClick={resetGame}>New Game</button>
        </div>
      </div>

      <div className="chess-status">
        {gameStatus === 'checkmate' && <span className="status-checkmate">🏆 Checkmate! {turn === 'w' ? 'Black' : 'White'} wins!</span>}
        {gameStatus === 'stalemate' && <span className="status-stalemate">🤝 Stalemate - Draw!</span>}
        {gameStatus === 'playing' && (
          <span className={`status-turn ${isPlayerTurn ? 'player-turn' : 'bot-turn'}`}>
            {isPlayerTurn ? 'Your turn (White)' : botThinking ? '🤔 Bot is thinking...' : "Bot's turn (Black)"}
          </span>
        )}
        {isCheck && gameStatus === 'playing' && <span className="status-check">⚠️ Check!</span>}
      </div>

      <div className="chess-layout">
        <div className="chess-board-area">
          {renderCaptured(capturedBlack, 'Captured by you:')}
          <div className="chess-board">
            {board.map((row, r) =>
              row.map((piece, c) => {
                const isLight = (r + c) % 2 === 0;
                const isSelected = selected && selected[0] === r && selected[1] === c;
                const isLegal = isLegalTarget(r, c);
                const isLastMove = lastMove && ((lastMove.from[0] === r && lastMove.from[1] === c) || (lastMove.to[0] === r && lastMove.to[1] === c));
                const isKingInCheck = isCheck && piece === (turn === 'w' ? W_KING : B_KING);

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`chess-cell ${isLight ? 'light' : 'dark'} ${isSelected ? 'selected' : ''} ${isLegal ? 'legal-target' : ''} ${isLastMove ? 'last-move' : ''} ${isKingInCheck ? 'in-check' : ''}`}
                    onClick={() => handleCellClick(r, c)}
                  >
                    {isLegal && !piece && <div className="legal-dot" />}
                    {piece !== EMPTY && (
                      <span className={`chess-piece ${isWhite(piece) ? 'white-piece' : 'black-piece'}`}>
                        {PIECE_UNICODE[piece]}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
          {renderCaptured(capturedWhite, 'Captured by bot:')}
        </div>

        <div className="chess-sidebar">
          <div className="chess-history">
            <h3>Move History</h3>
            <div className="move-list">
              {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => (
                <div key={i} className="move-row">
                  <span className="move-num">{i + 1}.</span>
                  <span className="move-white">{moveHistory[i * 2]}</span>
                  <span className="move-black">{moveHistory[i * 2 + 1] || ''}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Promotion Dialog */}
      {promotionPending && (
        <div className="chess-promo-overlay">
          <div className="chess-promo-dialog">
            <h3>Promote Pawn</h3>
            <div className="promo-options">
              {[
                { type: 5, piece: '♕', name: 'Queen' },
                { type: 4, piece: '♖', name: 'Rook' },
                { type: 3, piece: '♗', name: 'Bishop' },
                { type: 2, piece: '♘', name: 'Knight' },
              ].map(opt => (
                <button key={opt.type} className="promo-btn" onClick={() => handlePromotion(opt.type)}>
                  <span className="promo-piece">{opt.piece}</span>
                  <span>{opt.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chess;