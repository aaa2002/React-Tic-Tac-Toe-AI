import './App.css';
import { useState, useEffect } from "react";

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a]; // Return the winner symbol
        }
    }

    return null;
}


function Square({ value, click, disabled }) {
    return (
        <button className="square" onClick={disabled ? null : click}>
            {value}
        </button>
    );
}

function Board({ xIsNext, squares, onPlay, isComputerTurn, gameStatus }) {

    const winner = calculateWinner(squares);
    let status;
    if (gameStatus === "ended") {
        winner ? (status = "Winner: " + winner) : (status = "It's a draw!");
    } else {
        status = "Next player: " + (xIsNext ? "X" : "O");
    }

    function isDraw(squares) {
        let draw = false;
        let count = 0;
        for (let i = 0; i < squares.length; i++) {
            if (squares[i] === null) {
                count++;
            }
        }

        if (count === 0) {
            draw = true;
        }
        return draw;
    }


    function handleClick(i) {
        if (squares[i] || calculateWinner(squares) || gameStatus !== 'ongoing' || isComputerTurn || isDraw(squares)) {
            return;
        }

        const nextSquares = squares.slice();
        xIsNext ? nextSquares[i] = 'X' : nextSquares[i] = 'O';
        onPlay(nextSquares);
    }

    return (
        <>
            <div>
                <div className="status">
                    {status}
                </div>
                <div className="board-row">
                    <Square value={squares[0]} click={() => handleClick(0)} disabled={isComputerTurn || gameStatus !== 'ongoing'} />
                    <Square value={squares[1]} click={() => handleClick(1)} disabled={isComputerTurn || gameStatus !== 'ongoing'} />
                    <Square value={squares[2]} click={() => handleClick(2)} disabled={isComputerTurn || gameStatus !== 'ongoing'} />
                </div>
                <div className="board-row">
                    <Square value={squares[3]} click={() => handleClick(3)} disabled={isComputerTurn || gameStatus !== 'ongoing'} />
                    <Square value={squares[4]} click={() => handleClick(4)} disabled={isComputerTurn || gameStatus !== 'ongoing'} />
                    <Square value={squares[5]} click={() => handleClick(5)} disabled={isComputerTurn || gameStatus !== 'ongoing'} />
                </div>
                <div className="board-row">
                    <Square value={squares[6]} click={() => handleClick(6)} disabled={isComputerTurn || gameStatus !== 'ongoing'} />
                    <Square value={squares[7]} click={() => handleClick(7)} disabled={isComputerTurn || gameStatus !== 'ongoing'} />
                    <Square value={squares[8]} click={() => handleClick(8)} disabled={isComputerTurn || gameStatus !== 'ongoing'} />
                </div>
            </div>
        </>
    );
}

function Game() {

    const [history, setHistory] = useState([Array(9).fill(null)]);
    const [currentMove, setCurrentMove] = useState(0);
    const xIsNext = currentMove % 2 === 0;
    const currentSquares = history[currentMove];
    const [isComputerTurn, setIsComputerTurn] = useState(true);
    const [gameStatus, setGameStatus] = useState("ongoing");

    function isDraw(squares) {
        return squares.every((square) => square !== null);
    }

    function handlePlay(nextSquares) {
        let winner = calculateWinner(nextSquares);

        // Check for a draw before setting the game status
        if (!winner && isDraw(nextSquares)) {
            winner = 'draw';
        }

        if (winner === 'O' || winner === 'draw') {
            setGameStatus("ended");
        }

        let nextHistory;
        if (currentMove === history.length - 1) {
            nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
            setHistory(nextHistory);
            setCurrentMove(nextHistory.length - 1);
        }

        // Update isComputerTurn after the move is made and game status is checked
        setIsComputerTurn(!isComputerTurn);
    }



    function jumpTo(nextMove) {
        setCurrentMove(nextMove);
    }

    function findWinningMove(squares, symbol) {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (const line of lines) {
            const [a, b, c] = line;
            if (squares[a] === symbol && squares[b] === symbol && squares[c] === null) {
                return c;
            }
            if (squares[a] === symbol && squares[c] === symbol && squares[b] === null) {
                return b;
            }
            if (squares[b] === symbol && squares[c] === symbol && squares[a] === null) {
                return a;
            }
        }

        return null;
    }

    function calculateBestMove(squares, depth, isMaximizing) {
        const player = isMaximizing ? 'O' : 'X';

        // Check if the game is over or it's a draw
        const winner = calculateWinner(squares);
        if (winner === 'X') {
            return -1; // The computer loses (-1 score)
        }
        if (winner === 'O') {
            return 1; // The computer wins (1 score)
        }
        if (isDraw(squares)) {
            return 0; // It's a draw (0 score)
        }

        let bestScore = isMaximizing ? -Infinity : Infinity;

        for (let i = 0; i < squares.length; i++) {
            if (!squares[i]) {
                squares[i] = player;

                if (isMaximizing) {
                    const score = calculateBestMove(squares, depth - 1, false);
                    bestScore = Math.max(score, bestScore);
                } else {
                    const score = calculateBestMove(squares, depth - 1, true);
                    bestScore = Math.min(score, bestScore);
                }

                squares[i] = null; // Undo the move

                if (isMaximizing && bestScore === 1) {
                    break; // ALPHA BETA PRUNING -ish
                }
            }
        }

        return bestScore;
    }

    function findBestMove(squares, depth) {
        let bestMove = -1;
        let bestScore = -Infinity;

        for (let i = 0; i < squares.length; i++) {
            if (!squares[i]) {
                squares[i] = 'O';
                const score = calculateBestMove(squares, depth, false);
                squares[i] = null; // Undo the move

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }

        return bestMove;
    }

    useEffect(() => {
        if (isComputerTurn && gameStatus === "ongoing") {
            const timeoutId = setTimeout(() => {
                const emptySquares = currentSquares
                    .map((square, index) => (square === null ? index : null))
                    .filter((index) => index !== null);

                if (emptySquares.length > 0) {
                    let nextMove;

                    // Check if computer can win
                    nextMove = findWinningMove(currentSquares, 'O');
                    if (nextMove !== null) {
                        const nextSquares = currentSquares.slice();
                        nextSquares[nextMove] = 'X';
                        handlePlay(nextSquares);
                        return;
                    }

                    // Check if player can win, and block the player
                    nextMove = findWinningMove(currentSquares, 'X');
                    if (nextMove !== null) {
                        const nextSquares = currentSquares.slice();
                        nextSquares[nextMove] = 'X';
                        handlePlay(nextSquares);
                        return;
                    }

                    // Find the best move using minimax
                    nextMove = findBestMove(currentSquares, 9); // 9 for maximum depth
                    if (nextMove !== -1) {
                        const nextSquares = currentSquares.slice();
                        nextSquares[nextMove] = 'X';
                        handlePlay(nextSquares);
                        return;
                    }
                }

                setIsComputerTurn(false);

                // Delay declaring the result
                setTimeout(() => {
                    // Check for a draw or winner here and update gameStatus accordingly
                }, 1000);
            }, 1000);

            return () => clearTimeout(timeoutId);
        }
    }, [isComputerTurn, currentSquares, xIsNext]);



    const moves = history.map((squares, move) => {
        let description;
        if (move > 0) {
            description = 'Go to move #' + move;
        }
        else description = 'Go to game start';

        return (
            <li className="listItem" key={move}>
                <button className="moveButton" onClick={() => jumpTo(move)}>{description}</button>
            </li>
        );
    })

    return (
        <div className="game">
            <h1 className='title'>I Can't Lose!</h1>
            <h2 className='subtitle'>(Try me!)</h2>
            <div className="content">
                <div className="game-board">
                    <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} isComputerTurn={isComputerTurn} gameStatus={gameStatus} />
                </div>
                <div className="game-info">
                    <ol>{moves}</ol>
                </div>
            </div>
        </div>
    );
}

export default Game;
