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
		winningCombinations.forEach(winningCombination => {
			if (winningCombination.every(value => player.selectedGrids.includes(value))) {
				won = true;
				return;
			}
		});
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

const makeSelection = (e, player) => {
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
					duration: 500,
				}
			);
		// store player selection
		player.selection = e.currentTarget.dataset.index;
		// console.log("player from selection: ", player);
		game.storePlayerSelection(player);
		// change player
		game.setCurrentPlayer(player);
		game.playGame();
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
	let round = 1;
	let won;
	let numOfGamesWonByPlayer1 = 0;
	let numOfGamesWonByPlayer2 = 0;
	let ties = 0;

	// elements to update
	const player1Wins = document.querySelector(".first-player-wins > .wins");
	const player2Wins = document.querySelector(".second-player-wins > .wins");
	const numberOfTies = document.querySelector(".num-of-ties");
	const playerTurn = document.querySelector(".player-turn");
	const gameEnded = document.querySelector(".game-ended");

	const reset = () => {
		round = 1;
		player1.selectedGrids = [];
		player2.selectedGrids = [];
		player1.selection = "";
		player2.selection = "";
		document.querySelectorAll(".gameboard > .grid").forEach(el => {
			el.dataset.selected = false;
			el.innerHTML = "";
		});
		playerTurn.textContent = `${currentPlayer.name} (${currentPlayer.tag}) turn`;
	};

	// Event listener
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
		// console.log("player1: ", player1);
		// console.log("player2: ", player2);
		currentPlayer = [player1, player2][Math.floor(Math.random() * 2)];
		// console.log("current player: ", currentPlayer);
	};

	const playGame = () => {
		// console.log("player X selections: ", player1.selectedGrids);
		// console.log("player O selections: ", player2.selectedGrids);
		if (round < 9) {
			if (round > 4) {
				console.log("round: ", round);
				if (currentPlayer.tag === "x") {
					won = gameBoard.checkWinner(player2);
					// console.log("player2: ", player2.selectedGrids);
					// console.log("won: ", won);
					if (won) {
						console.log(`player ${player2.tag} won`);
						numOfGamesWonByPlayer2++;
						player2Wins.textContent = numOfGamesWonByPlayer2;
						document.querySelector(".player-turn").textContent = "Game Over";
						gameEnded.innerHTML = `<div class="players-tag">
							<span class="material-icons ended-circle">radio_button_unchecked</span>
						</div>
						<div class="info">Winner!</div>`;
						gameEnded.style.display = "flex";
						return;
					}
				} else {
					won = gameBoard.checkWinner(player1);
					// console.log("player1: ", player1.selectedGrids);
					// console.log("won: ", won);
					if (won) {
						console.log(`player ${player1.tag} won`);
						numOfGamesWonByPlayer1++;
						player1Wins.textContent = numOfGamesWonByPlayer1;
						document.querySelector(".player-turn").textContent = "Game Over";
						gameEnded.innerHTML = `<div class="players-tag">
							<span class="material-icons ended-x">close</span>
						</div>
						<div class="info">Winner!</div>`;
						gameEnded.style.display = "flex";
						return;
					}
				}
			}
			// get current player
			document.querySelector(".player-turn").textContent = `${currentPlayer.name} (${currentPlayer.tag}) turn`;

			round++;
			// console.log("game playing round: ", round);
		} else {
			// console.log("game ended in a tie: ", round);
			ties++;
			numberOfTies.textContent = ties;
			document.querySelector(".player-turn").textContent = "Game Over";
			gameEnded.innerHTML = `<div class="players-tag">
							<span class="material-icons ended-circle">radio_button_unchecked</span>
							<span class="material-icons ended-x">close</span>
						</div>
						<div class="info">Draw!</div>`;
			gameEnded.style.display = "flex";
			// reset();
		}
	};
	const getCurrentPlayer = () => {
		return currentPlayer;
	};
	const setCurrentPlayer = player => {
		if (player.tag === "x") {
			currentPlayer = player2;
		} else {
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
	return { startGame, getCurrentPlayer, playGame, setCurrentPlayer, storePlayerSelection };
})();

window.addEventListener("load", () => {
	game.startGame("1");
});
