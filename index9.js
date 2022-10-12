// const
let colors = [{ normal: "#ffd987", stable: "grey" }];
const strokeColor = (255, 235, 30);
const ratio = 1.618;
// variable
let unitLength = 20;
let boxColor = "#ffd987";
let reproductionRate = 3;
let gameStarted = false;
let radius = 20;
let preStarted = false;
let columns = 0; /* To be determined by window width */
let rows = 0; /* To be determined by window height */
let currentBoards = [];
let nextBoards = [];
let stableBoards = [];
let selectColorIndex = 0;
let survivalRate = 0;
let randomStart = 1;
let speed = 10;
let liveCounter = 0;
let mario = false;
let survivalMin = 2;
let survivalMax = 3;
let stability = 50;

//  document
let newRadiusSlider = document.getElementById("radius-bar");
let newSpeedSlider = document.getElementById("speed-bar");
let randomStartRange = document.getElementById("random-start");
let newGridSize = document.getElementById("grid-size");
let newReproductionSelectInput = document.getElementById("reproduction-option");
let dragColor = document.getElementById("color-select");
let resetGameButton = document.querySelector("#reset-game");
let startButton = document.querySelector("#start-pause-game");
let newSurvivalSelectInput = document.getElementById("survival-option");
let textLabel = document.getElementById("text-label");
let marioButton = document.querySelector("#mario");
let asideMario = document.querySelector("aside");
let rightColumnMario = document.querySelector(".right-column");
let information = document.querySelector(".information");
let modal = document.querySelector(".modal");
let rule = document.querySelector(".game-rule");
let minSur = document.querySelector("#minsur");
let maxSur = document.querySelector("#maxsur");
let stabilityBar = document.querySelector("#stability");

// functions

function changeGridSize(chooseSize) {
  let gridSize = 0;
  let map = {
    small: 10,
    medium: 20,
    large: 50,
  };
  gridSize = map[chooseSize];
  return gridSize;
}

function changeColor() {
  colors[selectColorIndex].normal = dragColor.value;
  boxColor = dragColor.value;
}

function setup() {
  /* Set the canvas to be under the element #canvas*/
  const canvas = createCanvas(
    windowWidth * 0.8 - 200,
    (windowWidth * 0.8 - 200) / ratio
  );
  canvas.parent(document.querySelector("#canvas"));

  /*Calculate the number of columns and rows */
  columns = floor(width / unitLength);
  rows = floor(height / unitLength);

  /*Making both currentBoard and nextBoard 2-dimensional matrix that has (columns * rows) boxes. */

  for (let c = 0; c < colors.length; c++) {
    let currentBoard = [];
    let nextBoard = [];
    let stableBoard = [];
    for (let i = 0; i < columns; i++) {
      currentBoard[i] = [];
      nextBoard[i] = [];
      stableBoard[i] = [];
    }
    currentBoards[c] = currentBoard;
    nextBoards[c] = nextBoard;
    stableBoards[c] = stableBoard;
  }
  // Now both currentBoard and nextBoard are array of array of undefined values.
  frameRate(speed);
  init(); // Set the initial values of the currentBoard and nextBoard
}

function draw() {
  if (gameStarted) {
    generate();
  }
  textLabel.innerHTML = liveCounter;
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      drawColor = 0;
      for (let c = 0; c < colors.length; c++) {
        if (currentBoards[c][i][j] == 1 && stableBoards[c][i][j] > stability) {
          drawColor = colors[c].stable;
        } else if (currentBoards[c][i][j] == 1) {
          drawColor = colors[c].normal;
        }
      }
      // console.log(i, j, drawColor)
      fill(drawColor);
      stroke(255, 235, 30);
      rect(i * unitLength, j * unitLength, unitLength, unitLength, radius);
    }
  }
}

function init() {
  liveCounter = 0;

  for (let c = 0; c < colors.length; c++) {
    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        currentBoards[c][i][j] = random() > randomStart ? 1 : 0;
        nextBoards[c][i][j] = 0;
        stableBoards[c][i][j] = 0;
      }
    }
  }
}

function initMarioBoard() {
  liveCounter = 0;
  // set all color to zero
  for (let c = 0; c < colors.length; c++) {
    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        currentBoards[c][i][j] = 0;
        nextBoards[c][i][j] = 0;
        stableBoards[c][i][j] = 0;
      }
    }
  }
  let color1 = `00000000000011100000000000
00000000001100111000000000
00000000111011011100000000
00000000111000011100000000
00000001111000111110000000
00000001111111111110000000
00000001111100111111000000
00000001110100101111000000
00000001000100100010000000
00000001000100100010000000
00000001000000000010000000
00000000010000001100000000
00000000011000011100000000
00000000001111110000000000
00000000000011000000000000
00000000010000001000000000
00000000111111111100000000
00000001111111111110000000
00000011101111110111000000
00000111001111110111100000`;
  // 26 x 20 => 40x 25
  let color1Rows = color1.split("\n");
  let rowCount = 26;
  let columnCount = 20;
  let c = 0;

  for (let i = 0; i < rowCount && i < columns; i++) {
    for (let j = 0; j < columnCount && j < rows; j++) {
      currentBoards[c][j + 7][i + 4] = parseInt(
        color1Rows[i].substring(j, j + 1),
        10
      );
      nextBoards[c][i][j] = 0;
      stableBoards[c][i][j] = 0;
      preStarted = true;
    }
  }
}

function clearMarioBoard() {
  liveCounter = 0;
  // set all color to zero
  for (let c = 0; c < colors.length; c++) {
    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        currentBoards[c][i][j] = 0;
        nextBoards[c][i][j] = 0;
        stableBoards[c][i][j] = 0;
      }
    }
  }
}

function generate() {
  if (!gameStarted) {
    return;
  }
  let haveLive = false;
  //Loop over every single box on the board
  for (let c = 0; c < colors.length; c++) {
    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        // Count all living members in the Moore neighborhood(8 boxes surrounding)
        let neighbors = 0;
        for (let i of [-1, 0, 1]) {
          for (let j of [-1, 0, 1]) {
            if (i == 0 && j == 0) {
              // the cell itself is not its own neighbor
              continue;
            }
            // The modulo operator is crucial for wrapping on the edge
            neighbors +=
              currentBoards[c][(x + i + columns) % columns][
                (y + j + rows) % rows
              ];
          }
        }

        // Rules of Life
        if (currentBoards[c][x][y] == 1 && neighbors < survivalMin) {
          // Die of Loneliness
          nextBoards[c][x][y] = 0;
        } else if (currentBoards[c][x][y] == 1 && neighbors > survivalMax) {
          // Die of Overpopulation
          nextBoards[c][x][y] = 0;
        } else if (
          currentBoards[c][x][y] == 0 &&
          neighbors == reproductionRate
        ) {
          // New life due to Reproduction
          nextBoards[c][x][y] = 1;
        } else {
          // Stasis
          nextBoards[c][x][y] = currentBoards[c][x][y];
        }

        // add stable counter
        if (nextBoards[c][x][y] == 1) {
          haveLive = true;
          stableBoards[c][x][y] = stableBoards[c][x][y] + 1;
        } else {
          stableBoards[c][x][y] = 0;
        }
      }
    }
  }
  if (haveLive) {
    liveCounter = liveCounter + 1;
    beep();
  }
  // Swap the nextBoard to be the current Board
  [currentBoards, nextBoards] = [nextBoards, currentBoards];
}

function mouseDragged() {
  /**
   * If the mouse coordinate is outside the board
   */

  const x = Math.floor(mouseX / unitLength);
  const y = Math.floor(mouseY / unitLength);
  if (x < 0 || y < 0 || x >= columns || y >= rows) {
    return;
  }
  currentBoards[selectColorIndex][x][y] = 1;
  fill(boxColor);
  stroke(255, 235, 30);
  rect(x * unitLength, y * unitLength, unitLength, unitLength, radius);
  preStarted = true;
}

/**
 * When mouse is pressed
 */
function mousePressed() {
  noLoop();
  mouseDragged();
}

/**
 * When mouse is released
 */
function mouseReleased() {
  loop();
}

function beep() {
  let snd = new Audio("./mario_coin_sound.mp3");
  if (mario) {
    snd.play();
  }
}

function windowResized() {
  resizeCanvas(windowWidth * 0.8 - 200, (windowWidth * 0.8 - 200) / ratio);
  setup();
}

//change of rule of survival

minSur.addEventListener("change", function () {
  if (minSur.value < maxSur.value) {
    survivalMin = parseInt(minSur.value);
  } else if (minSur.value === maxSur.value) {
    alert("Max and Min cannot be the same number");
    minSur.value = 2;
    maxSur.value = 3;
  } else {
    alert("Input a number smaller than Max");
    minSur.value = 2;
    maxSur.value = 3;
  }
});
maxSur.addEventListener("change", function () {
  if (maxSur.value > minSur.value) {
    survivalMax = parseInt(maxSur.value);
  } else if (minSur.value === maxSur.value) {
    alert("Max and Min cannot be the same number");
    minSur.value = 2;
    maxSur.value = 3;
  } else {
    alert("Input a number larger than Min");
    minSur.value = 2;
    maxSur.value = 3;
  }
});

// event listener

function addEventFunc() {
  stabilityBar.addEventListener("change", function () {
    let changeOfStability = parseInt(stabilityBar.value);
    stability = changeOfStability;
  });

  newSpeedSlider.addEventListener("change", function () {
    let changeOfSpeed = parseInt(newSpeedSlider.value);
    speed = changeOfSpeed;
    frameRate(speed);
  });

  newReproductionSelectInput.addEventListener("change", function () {
    let changeOfReproduction = parseInt(newReproductionSelectInput.value);
    reproductionRate = changeOfReproduction;
  });

  newGridSize.addEventListener("change", function () {
    let changeOfGridSize = newGridSize.value;
    let chosenGridSize = changeGridSize(changeOfGridSize);
    unitLength = chosenGridSize;
    setup();
    draw();
  });

  newRadiusSlider.addEventListener("change", function () {
    let changeOfRadius = parseInt(newRadiusSlider.value);
    radius = changeOfRadius;
    // setup();
    draw();
  });

  randomStartRange.addEventListener("change", function () {
    randomStart = parseFloat(randomStartRange.value / 100);
    setup();
    draw();
    preStarted = true;
  });

  resetGameButton.addEventListener("click", function () {
    if (mario) {
      initMarioBoard();
      resetGameButton.innerText = "Reset Game";
      gameStarted = false;
      preStarted = false;
      randomStart = 1;
      document.querySelector("#start-pause-game").innerText = "Start";
    } else init();

    resetGameButton.innerText = "Reset Game";
    gameStarted = false;
    preStarted = false;
    randomStart = 1;
    survivalMin = 2;
    survivalMax = 3;
    minSur.value = 2;
    maxSur.value = 3;

    document.querySelector("#start-pause-game").innerText = "Start";
  });

  startButton.addEventListener("click", function () {
    if (startButton.innerText === "Start" && preStarted == true) {
      gameStarted = true;
      startButton.innerText = "Pause";
    } else if (startButton.innerText === "Pause") {
      gameStarted = false;
      startButton.innerText = "Start";
    }
  });

  marioButton.addEventListener("click", function () {
    if (marioButton.innerText == "Mario Theme") {
      mario = true;
      marioButton.innerText = "Star War Theme";
      asideMario.classList.add("marioleft");
      rightColumnMario.classList.add("marioright");
      stroke(106, 4, -0);
      boxColor = "#6A0400";
      initMarioBoard();
      draw();
    } else if (marioButton.innerText == "Star War Theme") {
      mario = false;
      asideMario.classList.remove("marioleft");
      rightColumnMario.classList.remove("marioright");
      marioButton.innerText = "Mario Theme";
      clearMarioBoard();
    }
  });

  information.addEventListener("click", function () {
    document.querySelector(".modal").classList.add("show");
  });

  modal.addEventListener("click", function () {
    document.querySelector(".modal").classList.remove("show");
  });

  rule.addEventListener("click", function (event) {
    event.stopPropagation();
  });
}
addEventFunc();
