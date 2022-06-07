const gameBoard = (() => {
	const board = [
		[0, 0, 0],
		[0, 0, 0],
		[0, 0, 0],
	];
	const winningCombinations = [
		["0", "1", "2"],
		["3", "4", "5"],
		["6", "7", "8"],
		["0", "3", "6"],
		["1", "4", "7"],
		["2", "5", "8"],
		["0", "4", "8"],
		["2", "4", "6"],
	];

	const checkWinner = player => {
		let won = false;
		for (const winningCombination of winningCombinations) {
			if (winningCombination.every(value => player.selectedGrids.includes(value))) {
				won = true;
				break;
			}
		}
		return won;
	};
	return {
		checkWinner,
	};
})();

const Player = (name, tag) => {
	return {
		name,
		tag,
		selection: "",
		selectedGrids: [],
	};
};

// prevent multiple clicks
let clickCount = 0;

const makeSelection = (e, player) => {
	e.stopPropagation();
	clickCount++;
	console.log("click: ", clickCount);
	setTimeout(() => {
		clickCount = 0;
	}, 200);
	if (clickCount < 2) {
		// if grid not selected
		if (e.currentTarget.dataset.selected === "false") {
			if (player.tag === "o") {
				e.currentTarget.innerHTML = `<span class="material-icons circle">radio_button_unchecked</span>`;
			}
			if (player.tag === "x") {
				e.currentTarget.innerHTML = `<span class="material-icons cross">close</span>`;
			}
			e.currentTarget.dataset.selected = "true";
			e.currentTarget
				.querySelector(".material-icons")
				.animate(
					[{ opacity: 0, transform: "scale(0.4)" }, { transform: "scale(1.4)" }, { opacity: 1, transform: "scale(1)" }],
					{
						fill: "forwards",
						duration: 200,
					}
				);
			// store player selection
			player.selection = e.currentTarget.dataset.index;
			game.storePlayerSelection(player);
			// change player
			game.setCurrentPlayer(player);

			setTimeout(() => {
				game.playGame();
			}, 400);
		}
	}
};

// let currentPlayer = player2;

const boardGrid = document.querySelectorAll(".gameboard > .grid");
boardGrid.forEach(grid => {
	grid.addEventListener("click", e => makeSelection(e, game.getCurrentPlayer()));
});

const game = (() => {
	// gameType = 1 is human vs ai and gameType = 2 is human vs human
	let player1;
	let player2;
	let currentPlayer;
	let round;
	let won;
	let numOfGamesWonByPlayer1;
	let numOfGamesWonByPlayer2;
	let ties;

	const setVariables = () => {
		player1 = null;
		player2 = null;
		currentPlayer = null;
		round = 1;
		won = false;
		numOfGamesWonByPlayer1 = 0;
		numOfGamesWonByPlayer2 = 0;
		ties = 0;
	};
	// elements to update
	const player1Wins = document.querySelector(".first-player-wins > .wins");
	const player2Wins = document.querySelector(".second-player-wins > .wins");
	const numberOfTies = document.querySelector(".num-of-ties");
	const playerTurn = document.querySelector(".player-turn");
	const gameEnded = document.querySelector(".game-ended");
	const restartEl = document.querySelector(".restart");
	const toggleGameMode = document.querySelector(".toggle-game-mode");
	const firstPlayerLabel = document.querySelector(".first-player");
	const secondPlayerLabel = document.querySelector(".second-player");

	const displayCurrentPlayer = () => {
		// get current player using optional chaining

		if (currentPlayer?.tag === "x") {
			firstPlayerLabel.classList.add("current-player-indicator");
			secondPlayerLabel.classList.remove("current-player-indicator");
			playerTurn.textContent = `${currentPlayer.name} (${currentPlayer?.tag}) turn`;
		} else if (currentPlayer?.tag === "o") {
			firstPlayerLabel.classList.remove("current-player-indicator");
			secondPlayerLabel.classList.add("current-player-indicator");
			playerTurn.textContent = `${currentPlayer.name} (${currentPlayer?.tag}) turn`;
		} else {
			firstPlayerLabel.classList.remove("current-player-indicator");
			secondPlayerLabel.classList.remove("current-player-indicator");
			playerTurn.textContent = "Game Over";
		}
	};

	const deactivateBoard = () => {
		document.querySelectorAll(".gameboard > .grid").forEach(grid => {
			grid.style.pointerEvents = "none";
		});
	};
	const activateBoard = () => {
		document.querySelectorAll(".gameboard > .grid").forEach(grid => {
			grid.style.pointerEvents = "auto";
		});
	};

	const restart = () => {
		setVariables();
		clearBoard();
		startGame(document.querySelector(".toggle-game-mode").dataset.mode);
	};
	const chooseGameMode = e => {
		let mode = e.target.dataset.mode === "1" ? "2" : "1";
		e.target.dataset.mode = mode;
		e.target.textContent = mode === "1" ? "start two player" : "play with computer";
		restart();
	};
	const clearBoard = () => {
		document.querySelectorAll(".gameboard > .grid").forEach(el => {
			el.dataset.selected = false;
			el.innerHTML = "";
		});
	};

	const reset = () => {
		round = 1;
		player1.selectedGrids = [];
		player2.selectedGrids = [];
		player1.selection = "";
		player2.selection = "";
		clearBoard();
		currentPlayer = [player1, player2][Math.floor(Math.random() * 2)];
		displayCurrentPlayer();
		if (currentPlayer.name === "computer") {
			aiPlay();
		}
		activateBoard();
	};

	// Event listener
	toggleGameMode.addEventListener("click", chooseGameMode);
	restartEl.addEventListener("click", restart);

	gameEnded.addEventListener("click", e => {
		reset();
		e.currentTarget.style.display = "none";
	});

	const startGame = gameType => {
		switch (gameType) {
			case "1":
				player1 = Player("human", "x");
				player2 = Player("computer", "o");
				break;
			case "2":
				player1 = Player("human", "x");
				player2 = Player("human", "o");
				break;

			default:
				player1 = Player("human", "x");
				player2 = Player("computer", "o");
				break;
		}
		currentPlayer = [player1, player2][Math.floor(Math.random() * 2)];

		displayCurrentPlayer();

		if (currentPlayer.name === "computer") {
			aiPlay();
		}
	};
	const aiPlay = () => {
		const nonSelectedBoards = document.querySelectorAll('.gameboard > .grid[data-selected="false"]');
		//randomly select a board
		let index = Math.floor(Math.random() * nonSelectedBoards.length);
		setTimeout(() => {
			nonSelectedBoards[index].click();
		}, 200);
	};

	const playGame = () => {
		if (round <= 9) {
			if (round > 4) {
				if (currentPlayer.tag === "x") {
					won = gameBoard.checkWinner(player2);
					if (won) {
						numOfGamesWonByPlayer2++;
						player2Wins.textContent = numOfGamesWonByPlayer2;
						// playerTurn.textContent = "Game Over";
						gameEnded.innerHTML = `<div class="players-tag">
							<span class="material-icons ended-circle">radio_button_unchecked</span>
						</div>
						<div class="info">Winner!</div>`;
						gameEnded.style.display = "flex";
						deactivateBoard();
						currentPlayer = null;
						displayCurrentPlayer();
						return;
					}
				}
				if (currentPlayer.tag === "o") {
					won = gameBoard.checkWinner(player1);
					if (won) {
						numOfGamesWonByPlayer1++;
						player1Wins.textContent = numOfGamesWonByPlayer1;
						// document.querySelector(".player-turn").textContent = "Game Over";
						gameEnded.innerHTML = `<div class="players-tag">
							<span class="material-icons ended-x">close</span>
						</div>
						<div class="info">Winner!</div>`;
						gameEnded.style.display = "flex";
						deactivateBoard();
						currentPlayer = null;
						displayCurrentPlayer();
						return;
					}
				}
			}
			displayCurrentPlayer();

			round++;
			if (round > 9) {
				ties++;
				numberOfTies.textContent = ties;
				// playerTurn.textContent = "Game Over";
				gameEnded.innerHTML = `<div class="players-tag">
							<span class="material-icons ended-circle">radio_button_unchecked</span>
							<span class="material-icons ended-x">close</span>
						</div>
						<div class="info">Draw!</div>`;
				gameEnded.style.display = "flex";
				deactivateBoard();
				currentPlayer = null;
				displayCurrentPlayer();
				return;
			}
		} else {
			ties++;
			numberOfTies.textContent = ties;
			// playerTurn.textContent = "Game Over";
			gameEnded.innerHTML = `<div class="players-tag">
							<span class="material-icons ended-circle">radio_button_unchecked</span>
							<span class="material-icons ended-x">close</span>
						</div>
						<div class="info">Draw!</div>`;
			gameEnded.style.display = "flex";
			deactivateBoard();
			currentPlayer = null;
			displayCurrentPlayer();
			return;
		}
		if (game.getCurrentPlayer().name === "computer") {
			game.aiPlay();
		}
	};
	const getCurrentPlayer = () => {
		return currentPlayer;
	};
	const setCurrentPlayer = player => {
		if (player.tag === "x") {
			currentPlayer = player2;
		}
		if (player.tag === "o") {
			currentPlayer = player1;
		}
	};
	const storePlayerSelection = player => {
		if (player.tag === "x") {
			player1.selectedGrids.push(player.selection);
		} else {
			player2.selectedGrids.push(player.selection);
		}
	};
	const getRound = () => round;
	return {
		startGame,
		getCurrentPlayer,
		playGame,
		setCurrentPlayer,
		storePlayerSelection,
		aiPlay,
		setVariables,
		getRound,
	};
})();

window.addEventListener("load", () => {
	game.setVariables();
	game.startGame("1");
});
