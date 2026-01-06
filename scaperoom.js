import { rooms } from './rooms.js';
import { files } from './files.js';
import { victoryASCII, getRoomAscii, getFileAscii } from './ascii-art.js';

// ==================== ESCAPP ====================
const CONFIG = {
  SERVER_URL: "wss://escapp.es",
  ESCAPE_ROOM_ID: "392",
  TURN_ID: "702"
};

// ==================== DOM ELEMENTS ====================
let terminalOutput, commandInput, connectionStatus, puzzleCounter, remainingTime, loadingScreen, roomDisplay, asciiDisplay, asciiContainer;

// ==================== SOCKET & GAME STATE ====================
const io = window.io;
let socket = null;
let USER_TOKEN = null;
let USER_ACCOUNT = null;

let commandHistory = [];
let historyIndex = -1;
let remainingTimer = null;

const gameState = {
  authenticated: false,
  started: false,
  solvedPuzzles: [],
  remainingTime: 0,
  currentPuzzle: 1,
  currentPuzzleHintsUsed: 0,
  currentRoom: null,
  currentProgram: null,
  executingProgram: false,
  inventory: {},
  log_solution_num: null,
  log_solution: null,
};

// ==================== INITIALIZATION ====================

document.addEventListener("DOMContentLoaded", () => {
  initializeDOMElements();
  initGame();
});

function initializeDOMElements() {
  terminalOutput = document.getElementById("terminal-output");
  commandInput = document.getElementById("command-input");
  connectionStatus = document.getElementById("connection-status");
  puzzleCounter = document.getElementById("puzzle-counter");
  remainingTime = document.getElementById("remaining-time");
  loadingScreen = document.getElementById("loading-screen");
  roomDisplay = document.getElementById("room-display");
  asciiDisplay = document.getElementById("ascii-art");
  asciiContainer = document.getElementById("ascii-art-container");
}

function initGame() {
  setupEventListeners();
  gameState.log_solution_num = Math.floor(Math.random() * 50);
  // gameState.log_solution = `ACCESS=${generateRandomString(8,false)}`;
  gameState.log_solution = "Uv4jUiwB";
}

function setupEventListeners() {
  commandInput.addEventListener("keydown", handleCommandInput);
  loadingScreen.addEventListener("animationend", handleLoadingScreenEnd);

  document.addEventListener("run_panel", handlePanelRun);
  document.addEventListener("run_keypad", handleKeypadRun);
  document.addEventListener("run_consola", handleConsoleRun);
  document.addEventListener("run_boton_almacen", handleBotonRun);
  document.addEventListener("run_servidor1", handleServidor1Run);
  document.addEventListener("run_servidor2", handleServidor2Run);
  document.addEventListener("run_servidor3", handleServidor3Run);
  document.addEventListener("run_servidor4", handleServidor4Run);
  document.addEventListener("run_escaner", handleEscanerRun);

  document.addEventListener("poster_moved", handlePosterMoved);
}

function handleCommandInput(event) {
  switch (event.key) {
    case "Enter":
      processCommandInput();
      break;
    case "ArrowUp":
      navigateCommandHistory(-1);
      break;
    case "ArrowDown":
      navigateCommandHistory(1);
      break;
    default:
      if (event.ctrlKey && event.key === "c") {
        terminateRunningProgram();
      }
      break;
  }
}

function processCommandInput() {
  const command = commandInput.value.trim();
  if (command) {
    processCommand(command);
    commandHistory.push(command);
    commandInput.value = "";
    historyIndex = -1;
  }
}

function navigateCommandHistory(direction) {
  event.preventDefault();
  
  if (direction === -1 && commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
    historyIndex++;
    commandInput.value = commandHistory[commandHistory.length - 1 - historyIndex];
  } else if (direction === 1 && historyIndex > 0) {
    historyIndex--;
    commandInput.value = commandHistory[commandHistory.length - 1 - historyIndex];
  } else if (direction === 1) {
    historyIndex = -1;
    commandInput.value = "";
  }
}

function terminateRunningProgram() {
  if (gameState.executingProgram) {
    gameState.currentProgram = null;
    gameState.executingProgram = false;
    outputLine("Terminando la ejecución del programa...", "command-special");
    updateRoomDisplay(gameState.currentRoom.dirName);
    roomDisplay.classList.remove("command-special");
    updateASCIIArt(gameState.currentRoom.asciiArt);
  }
}

function handleLoadingScreenEnd(event) {
  if (event.animationName === "fadeOut") {
    loadingScreen.remove();
  }
}

// ==================== FILE RUN HANDLERS ====================
function handlePanelRun() {
  updateASCIIArt(files["panel.exe"].asciiArt);
  updateRoomDisplay("panel.exe");
  roomDisplay.classList.add("command-special");
  
  if (gameState.currentRoom.displayName == "Servidores") {
    gameState.currentProgram = 5;
    outputLine("Panel de Control del Servidor", "command-special");
    if (!gameState.solvedPuzzles.includes(5)) {
      outputLine("Edición del archivo sudoers", "command-output");
      outputLine("Introduzca la clave de administración", "command-output");
    }
  } else {
    gameState.currentProgram = 1;
    outputLine("Panel de Control de la puerta", "command-special");
    if (!gameState.solvedPuzzles.includes(1)) {
      outputLine("ERROR: Fallo de apertura automática", "command-output");
      outputLine("Introduzca el código de anulación.", "command-output");
    }
  }
  outputLine(" - - - Esperando mensaje del usuario - - -", "command-output");
}

function handleKeypadRun() {
  updateRoomDisplay("keypad.exe");
  updateASCIIArt(files["panel.exe"].asciiArt);
  roomDisplay.classList.add("command-special");
  
  if (gameState.currentRoom.displayName == "Servidores") {
    gameState.currentProgram = 5;
    outputLine("Panel de Control del Servidor", "command-special");
    if (!gameState.solvedPuzzles.includes(5)) {
      outputLine("Edición del archivo sudoers", "command-output");
      outputLine("Introduzca la clave de administración", "command-output");
    }
  } else {
    gameState.currentProgram = 2;
    outputLine("Teclado Numérico", "command-special");
    if (!gameState.solvedPuzzles.includes(2)) {
      outputLine("Introduzca el código de 6 dígitos para desbloquear la puerta.", "command-output");
    }
  }
  outputLine(" - - - Esperando mensaje del usuario - - -", "command-output");
}

function handleConsoleRun() {
  updateRoomDisplay("consola.exe");
  updateASCIIArt(files["panel.exe"].asciiArt);
  roomDisplay.classList.add("command-special");
  
  if (gameState.currentRoom.displayName == "Servidores") {
    gameState.currentProgram = 5;
    outputLine("Panel de Control del Servidor", "command-special");
    if (!gameState.solvedPuzzles.includes(5)) {
      outputLine("Edición del archivo sudoers", "command-output");
      outputLine("Introduzca la clave de administración", "command-output");
    }
  } else {
    gameState.currentProgram = 3;
    outputLine("Teclado Numérico", "command-special");
    if (!gameState.solvedPuzzles.includes(3)) {
      outputLine("Introduzca el código de alfanumérico de 8 caracteres para desbloquear la puerta.", "command-output");
    }
  }
  outputLine(" - - - Esperando mensaje del usuario - - -", "command-output");
}

function handleBotonRun() {
  if (!rooms.Almacen.perms.execute) {
    rooms.Almacen.perms.execute = true;
    outputLine("Se escucha un click proveniente del pasillo", "command-special");
  } else {
    outputLine("No parece que haga nada más", "command-special");
  }
  gameState.executingProgram = false;
}

function handleServidor1Run() {
  outputLine("*Hace ruidos de servidor*", "command-special");
  gameState.executingProgram = false;
}

function handleServidor2Run() {
  outputLine("Al servidor le falta una parte, parece un hueco para un teclado, o un panel numérico.", "command-special");
  gameState.executingProgram = false;
}

function handleServidor3Run() {
  outputLine("Al tocar el servidor entra en llamas instantáneamente. No se puede usar", "command-special");
  gameState.executingProgram = false;
}

function handleServidor4Run() {
  outputLine("Parece que el servidor está procesando señales procedentes del espacio", "command-special");
  gameState.executingProgram = false;
}

function handleEscanerRun() {
  outputLine("Escaneando", "command-special");
  outputLine(".", "command-special");
  outputLine("..", "command-special");
  outputLine("...", "command-special");
  
  if (!Object.keys(gameState.inventory).includes("$SUDOER")) {
    outputLine("Acceso Root Denegado - El usuario no se encuentra en el archivo sudoers", "command-error");
    gameState.executingProgram = false;
    return;
  }

  outputLine("ESCANER DE RETINA COMPLETADO", "command-special");
  outputLine("Bienvenido, Administrador", "command-special");
  solvePuzzle(6, "Exit");
  gameState.executingProgram = false;
}

function handlePosterMoved() {
  files["poster_2.psd"].content = "KEEP CALM AND FOLLOW THE RULES.";
  rooms.Pasillo.files.push("texto_en_pared.txt");
  
  outputLine("Al mover el póster descubres un texto oculto en la pared.", "command-special");
}


// ==================== COMMAND PROCESSING ====================
function processCommand(input) {
  const parts = input.split(" ");
  const commandName = parts[0].toLowerCase();
  const args = parts.slice(1);

  outputLine(`> ${input}`, "command-prompt");

  if (commandName.startsWith("./")) {
    executeProgram(commandName.slice(2), args);
    return;
  }

  if (commands[commandName]) {
    commands[commandName].execute(args);
  } else {
    outputLine(`Comando desconocido: ${commandName}. Usa 'help' para ver los comandos disponibles`, "command-error");
  }
}

function executeProgram(programName, args) {
  if (!gameState.authenticated || !gameState.started) {
    outputLine("Debes iniciar sesión y comenzar la EscapeRoom para ejecutar el comando.", "command-error");
    return;
  }
  
  if (gameState.executingProgram) {
    outputLine("Ya hay un programa en ejecución. Termina la ejecución antes de ejecutar otro.", "command-error");
    return;
  }
  
  if (args.length > 0) {
    outputLine("No se permite ejecutar programas con argumentos", "command-error");
    return;
  }
  
  if (!gameState.currentRoom?.files.includes(programName)) {
    outputLine(`El programa ${programName} no existe en la habitación actual.`, "command-error");
    return;
  }
  
  if (!files[programName]?.perms.execute) {
    outputLine(files[programName].lockmsg || "Permiso denegado.", "command-error");
    return;
  }
  
  gameState.executingProgram = true;
  files[programName].run();
}

// ==================== SOCKET COMMUNICATION ====================
function setupSocketEvents() {
  if (!socket) return;

  socket.on("connect", () => console.log("Connected to server"));
  
  socket.on("disconnect", (msg) => handleDisconnect(msg));
  socket.on("error", (err) => outputLine(`Error de escapp: ${err}`, "command-error"));
  socket.on("ERROR", (err) => outputLine(`Error de escapp: ${err}`, "command-error"));
  socket.on("connect_error", (err) => outputLine(`Error de conexión con escapp: ${err}`, "command-error"));
  
  socket.on("TEAM_STARTED", handleTeamStarted);
  socket.on('HINT_RESPONSE', handleHintResponse);
  socket.on('PUZZLE_RESPONSE', handlePuzzleResponse);
  socket.on("INITIAL_INFO", handleInitialInfo);
}

function handleDisconnect(msg) {
  console.log("Disconnected from server:", msg);
  socket.close();
  socket = null;
  // outputLine(`Desconectado del servidor de escapp: ${msg} .`, "command-error");
  connectionStatus.classList.add("command-error");
  connectionStatus.textContent = "OFFLINE";
}

function handleTeamStarted({ code, authentication, participation, msg, erState }) {
  gameState.started = true;
  outputLine(`La EscapeRoom ha comenzado.`, "command-output");
  outputLines([
    "", "", "", "",
    "Te despiertas en una especie de habitación",
    "No sabes cómo has llegado ahí, pero debes encontrar una forma de salir"
  ], "command-output");
  loadGameState(erState);
  startTimer();
}

function handleHintResponse({ hintOrder, puzzleOrder, msg }) {
  console.log("HINT_RESPONSE", { hintOrder, puzzleOrder, msg });
  outputLine(`Pista nº${hintOrder} del puzzle ${puzzleOrder}: ${msg}`, "hint");
  gameState.currentPuzzleHintsUsed = hintOrder;
}

function handlePuzzleResponse({ correctAnswer, solution, puzzleOrder, msg, erState }) {
  console.log("PUZZLE_RESPONSE", { correctAnswer, solution, puzzleOrder, msg, erState });
  
  if (correctAnswer) {
    if (erState.progress == 100) {
      endSequence();
    } else {
      handlePuzzleSuccess(puzzleOrder, erState);
    }
  } else {
    handlePuzzleFailure(puzzleOrder, solution);
  }
}

function handlePuzzleSuccess(puzzleOrder, erState) {
  switch(puzzleOrder) {
    case 1:
      outputLine("Código correcto. Abriendo la puerta...", "command-special");
      rooms.Pasillo.perms.execute = true;
      break;
    case 2:
      outputLine("Código correcto. Abriendo la puerta...", "command-special");
      rooms.Laboratorio.perms.execute = true;
      break;
    case 3:
      outputLine("Código correcto. Abriendo la puerta...", "command-special");
      rooms.Control.perms.execute = true;
      break;
    case 5:
      gameState.inventory["$SUDOER"] = "Logueado con permisos de administrador";
      outputLine("Usuario añadido al archivo sudoers", "command-special");
      break;
  }
  
  gameState.currentPuzzleHintsUsed = 0;
  updateSolvedPuzzles(erState.puzzlesSolved, erState.nPuzzles);
  gameState.currentPuzzle++;
}

function handlePuzzleFailure(puzzleOrder, solution) {
  switch(puzzleOrder) {
    case 1:
      outputLine("Error: Código de anulación incorrecto.", "command-error");
      break;
    case 2:
      if (solution.length != 6) {
        outputLine("Error: El panel espera 6 dígitos.", "command-error");
        break;
      }
      outputLine("Error: Código incorrecto.", "command-error");
      break;
    case 3:
    case 5:
      outputLine("Error: Código incorrecto.", "command-error");
      break;
  }
}

function handleInitialInfo({ authentication, token, participation, msg, erState }) {
  if (gameState.authenticated && erState && erState.progress == 100) {
    handleGameCompletion(erState);
    return;
  }
  
  const connected = parseLoginResponse({ authentication, participation, erState });
  if (connected) {
    USER_TOKEN = token;
  }
  
  console.log("INITIAL_INFO:", { authentication, token, participation, msg, erState });
}

function handleGameCompletion(erState) {
  updateSolvedPuzzles(erState.puzzlesSolved, erState.nPuzzles);
  gameState.authenticated = false;
  gameState.started = false;
  
  const rankingIndex = erState.ranking.findIndex(rank => rank.name === erState.teamMembers[0]);
  const rankingObject = erState.ranking[rankingIndex];
  
  const minutes = Math.floor(rankingObject.finishTime / 60);
  const seconds = Math.trunc(rankingObject.finishTime % 60);
  
  outputLines([
    "--- Resultado ---",
    `Posición: ${rankingIndex + 1}`,
    `Tiempo de finalización: ${minutes.toString().padStart(2, '0')}m:${seconds.toString().padStart(2, '0')}s`
  ], "command-output");
}

function parseLoginResponse({ authentication, participation, erState }) {
  if (!authentication) {
    outputLine(`Error de conexión. Usuario o contraseña incorrectos.`, "command-error");
    gameState.authenticated = false;
    return false;
  }

  switch (participation) {
    case "NOT_A_PARTICIPANT":
      outputLine("No participas en la EscapeRoom, ve al siguiente enlace para registrarte:", "command-error");
      outputLine(`https://escapp.es/escapeRooms/${CONFIG.ESCAPE_ROOM_ID}/join`, "link");
      return false;

    case "NOT_STARTED":
      outputLines([
        `Conectado correctamente a la EscapeRoom.`,
        `Estás registrado como participante, pero no has comenzado a jugar. Usa el comando 'start' para empezar.`
      ], "command-output");
      break;

    case "PARTICIPANT":
      outputLine(`Conectado correctamente a la EscapeRoom.`, "command-success");
      
      if (erState.progress == 100 || erState.remainingTime == 0) {
        outputLine(`Ya has completado la EscapeRoom. Si quieres volver a jugar habla con tu profesor.`, "command-output");
        return false;
      }
      
      outputLine("Ya habías empezado a jugar anteriormente, retomando el estado anterior", "command-output");
      gameState.started = true;
      loadGameState(erState);
      startTimer();
      break;
  }
  
  gameState.authenticated = true;
  connectionStatus.classList.remove("command-error");
  connectionStatus.textContent = "ONLINE";
  return true;
}

// ==================== GAME STATE MANAGEMENT ====================
function loadGameState(erState) {
  updateSolvedPuzzles(erState.puzzlesSolved, erState.nPuzzles);
  gameState.remainingTime = erState.remainingTime;
  updateRemainingTime();
  gameState.currentPuzzle = erState.puzzlesSolved.length + 1;
  gameState.solvedPuzzles = erState.puzzlesSolved;

  const progressState = {
    0: () => { gameState.currentRoom = rooms.Celda; },
    1: () => { 
      rooms.Pasillo.perms.execute = true;
      gameState.currentRoom = rooms.Pasillo;
    },
    2: () => {
      rooms.Pasillo.perms.execute = true;
      rooms.Laboratorio.perms.execute = true;
      gameState.currentRoom = rooms.Laboratorio;
    },
    3: () => {
      rooms.Pasillo.perms.execute = true;
      rooms.Laboratorio.perms.execute = true;
      rooms.Control.perms.execute = true;
      gameState.currentRoom = rooms.Laboratorio;
    },
    4: () => {
      rooms.Pasillo.perms.execute = true;
      rooms.Laboratorio.perms.execute = true;
      rooms.Servidores.perms.execute = true;
      rooms.Almacen.perms.execute = true;
      rooms.Control.perms.execute = true;
      gameState.inventory[`$KEYCARD`] = "Tarjeta de seguridad de nivel 2. Permite sobreescribrir permisos.";
      gameState.currentRoom = rooms.Servidores;
    },
    5: () => {
      rooms.Pasillo.perms.execute = true;
      rooms.Laboratorio.perms.execute = true;
      rooms.Servidores.perms.execute = true;
      rooms.Almacen.perms.execute = true;
      rooms.Control.perms.execute = true;
      gameState.inventory[`$KEYCARD`] = "Tarjeta de seguridad de nivel 2. Permite sobreescribrir permisos.";
      gameState.inventory["$SUDOER"] = "Logueado con permisos de administrador";
      gameState.currentRoom = rooms.Control;
    }
  };

  if (progressState[erState.puzzlesSolved.length]) {
    progressState[erState.puzzlesSolved.length]();
  }

  asciiDisplay.style.fontSize = "1cqw";
  updateASCIIArt(gameState.currentRoom.asciiArt);
  updateRoomDisplay(gameState.currentRoom.dirName);
}

function startTimer() {
  remainingTimer = setInterval(() => {
    if (gameState.remainingTime > 0) {
      gameState.remainingTime--;
      updateRemainingTime();
    } else if (gameState.started) {
      clearInterval(remainingTimer);
    }
  }, 1000);
}

// ==================== UTILITY FUNCTIONS ====================
function outputLine(text, className = "") {
  const line = document.createElement("div");
  line.className = "terminal-line";

  if (className) {
    if (className === "link") {
      line.innerHTML = `<a href="${text}" class="terminal-line link">Enlace a registro en la escape room</a>`;
    } else {
      line.innerHTML = `<span class="${className}">${text}</span>`;
    }
  } else {
    line.textContent = text;
  }

  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;

  // Limit terminal lines
  const lines = terminalOutput.getElementsByClassName("terminal-line");
  if (lines.length > 100) {
    terminalOutput.removeChild(lines[0]);
  }
}

function outputLines(texts, className = "") {
  texts.forEach(text => outputLine(text, className));
}

function generateRandomString(strLength, specialChars = false) {
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  if (specialChars) {
    chars += '_-=.^$/()?!+*,';
  }
  
  let result = '';
  for (let j = 0; j < strLength; j++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}

function updateRoomDisplay(dirname) {
  roomDisplay.textContent = `C:\\${dirname}>`;
}

function updateSolvedPuzzles(solved, total) {
  puzzleCounter.textContent = `${solved.length}/${total}`;
  gameState.solvedPuzzles = solved;
}

function updateRemainingTime() {
  const minutes = Math.floor(gameState.remainingTime / 60);
  const seconds = gameState.remainingTime % 60;
  remainingTime.textContent = `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}

function updateASCIIArt(art) {
  asciiDisplay.textContent = art;
}

function parsePermissions(perms) {
  return (perms.write ? "w" : "-") + 
         (perms.execute ? "x" : "-") + 
         (perms.read ? "r" : "-");
}

// ==================== PUZZLE FUNCTIONS ====================
function solvePuzzle(puzzleOrder, solution) {
  if (!socket) return;
  socket.emit("SOLVE_PUZZLE", { puzzleOrder, sol: solution });
}

function requestHint(status = "completed", score = 100, category = "General") {
  if (!socket) return;
  socket.emit("REQUEST_HINT", { status, score, category });
}

function startPlaying() {
  if (!socket) return;
  socket.emit("START_PLAYING");
}

// ==================== ROOM AND FILE FUNCTIONS ====================
function listFiles(hidden = false, longList = false) {
  if (gameState.currentRoom?.perms.read === false) {
    outputLine("Permiso denegado.", "command-error");
    return;
  }

  if (gameState.currentRoom.displayName === "server_logs") {
    for (let i = 0; i <= 49; i++) {
      const filename = `registro_${i}.log`;
      outputLine(longList ? `--r ${filename}` : filename, "command-output");
    }
    return;
  }

  if (gameState.currentRoom.displayName === "Servidores") {
    outputLine("Está muy oscuro y apenas puede verse nada", "command-special");
    if (!hidden) return;
  }

  // List directories
  gameState.currentRoom?.links.forEach(element => {
    if (element.startsWith('.') && !hidden) return;
    
    if (longList) {
      const elementPerms = "dr" + parsePermissions(rooms[element]?.perms);
      outputLine(`${elementPerms}\t${rooms[element]?.displayName}/`, "command-output");
    } else {
      outputLine(`${rooms[element]?.displayName}/`, "command-output");
    }
  });

  // List files
  gameState.currentRoom?.files.forEach(element => {
    if (element.startsWith('.') && !hidden) return;
    
    if (longList) {
      const elementPerms = parsePermissions(files[element]?.perms);
      outputLine(`${elementPerms}\t${element}`, "command-output");
    } else {
      outputLine(`${element}`, "command-output");
    }
  });
}

function readFileContent(fileName) {
  if (files[fileName].perms.read === false) {
    outputLine("Permiso denegado.", "command-error");
    return;
  }
  outputLine(files[fileName].content, "command-output");
}

// ==================== COMMAND DEFINITIONS ====================
const commands = {
  help: {
    description: "Muestra esta ayuda",
    help: "Uso: help [?OPCION] Muestra una lista de comandos disponibles.",
    execute: (args) => executeHelp(args)
  },
  login: {
    description: "Inicia sesión en la plataforma de escapp",
    help: "Uso: login [?OPCION] [USUARIO] [CONTRASEÑA] con tu cuenta de escapp.",
    execute: (args) => executeLogin(args)
  },
  start: {
    description: "Comienza a jugar la EscapeRoom",
    help: "Uso: start [?OPCION]   Inicia la EscapeRoom si no has comenzado aún.",
    execute: (args) => executeStart(args)
  },
  hint: {
    description: "Solicita una pista para el puzzle actual",
    help: "Uso: hint [?OPCION]    Solicita una pista para el puzzle actual.",
    execute: (args) => executeHint(args)
  },
  ls: {
    description: "Lista los archivos en la habitación actual",
    help: "Uso: ls [?OPCION] Muestra los archivos disponibles en la habitación actual.",
    execute: (args) => executeLs(args)
  },
  cat: {
    description: "Muestra el contenido de un archivo",
    help: "Uso: cat [?OPCION] [NOMBRE_ARCHIVO]    Muestra el contenido del archivo especificado.",
    execute: (args) => executeCat(args)
  },
  grep: {
    description: "Muestra líneas dentro de un archivo que siguen un patrón.",
    help: "Uso: grep [?OPCION] [PATRÓN] [ARCHIVO*]    Busca en el ARCHIVO una línea que siga el PATRÓN",
    execute: (args) => executeGrep(args)
  },
  find: {
    description: "Busca un archivo y muestra el directorio en el que se encuentra",
    help: "Uso: find [?OPCION] [DIR] [PATRÓN]  Busca a partir del DIRECTORIO archivos que sigan el PATRÓN",
    execute: (args) => executeFind(args)
  },
  exit: {
    description: "Terminar la ejecución del programa actual",
    help: "Uso: exit [?OPCION]    Termina la ejecución del programa actual y vuelve al directorio.",
    execute: (args) => executeExit(args)
  },
  echo: {
    description: "Manda un mensaje al terminal, que se replica en el juego",
    help: "Uso: echo [?OPCION] [MENSAJE]    Manda el MENSAJE a la terminal del juego. Permite enviar información a programas en ejecución.",
    execute: (args) => executeEcho(args)
  },
  cd: {
    description: "Cambia de directorio a la habitación especificada",
    help: "Uso: cd [?OPCION] [NOMBRE_HABITACIÓN]  Cambia a la habitación especificada.",
    execute: (args) => executeCd(args)
  },
  mv: {
    description: "Mueve un archivo a otra ubicación",
    help: "Uso: mv [?OPCION] [ARCHIVO] [DESTINO]    Mueve el ARCHIVO al DESTINO especificado.",
    execute: (args) => executeMv(args)
  },
  rm: {
    description: "Elimina un archivo en la localización actual",
    help: "Uso: rm [?OPCION] [ARCHIVO]    Elimina el ARCHIVO en la localización actual.",
    execute: (args) => executeRm(args)
  },
  cp: {
    description: "Copia un archivo a la localización especificada.",
    help: "Uso: cp [?OPCION] [ARCHIVO] [DIR]  Copia el ARCHIVO al DIRECTORIO especificado.",
    execute: (args) => executeCp(args)
  },
  clear: {
    description: "Borra los mensajes de la terminal",
    help: "Uso: clear [?OPCION]   Borra todos los mensajes de la terminal",
    execute: (args) => executeClear(args)
  },
  inventory: {
    description: "Muestra el inventario, la descripción de un item, o añade items.",
    help: "Uso: inventory [?OPCION] [?ITEM]   Muestra el contenido del inventario, o de un ITEM en concreto",
    execute: (args) => executeInventory(args)
  },
  touch: {
    description: "Crea y guarda una nota en el inventario",
    help: "Uso: touch [?OPCION] [VAR_NAME] [TEXTO]   Guarda el TEXTO en la variable VAR_NAME del inventario.",
    execute: (args) => executeTouch(args)
  },
  chmod: {
    description: "Cambia los permisos de un archivo o directorio",
    help: "Uso: chmod [?OPCION] [+/-][PERMISOS] [ARCHIVO]   Añade o elimina los PERMISOS al ARCHIVO.",
    execute: (args) => executeChmod(args)
  }
};


// ==================== COMMAND EXECUTION FUNCTIONS ====================
function validateGameState() {
  return gameState.authenticated && gameState.started;
}

function validateNoProgramRunning() {
  if (gameState.executingProgram) {
    outputLine("No se puede lanzar el comando mientras haya otro programa en ejecución.", "command-error");
    return false;
  }
  return true;
}

function showHelp(command) {
  outputLine(commands[command].help, "command-help");
  outputLine("  Opciones:  --help    Muestra esta información de ayuda.", "command-help");
}

function executeHelp(args) {
  if (args.length === 1 && args[0] === "--help") {
    showHelp('help');
    return;
  } else if (args.length > 0) {
    outputLine("Estructura de comando inválida. Utiliza --help para ver más información", "command-error");
    return;
  }
  
  outputLines([
    "Comandos disponibles:",
    "Usa 'command --help' para ver más información de cada commando",
    ""
  ], "command-help");
  
  Object.entries(commands).forEach(([cmd, data]) => {
    outputLine(`\t  ${cmd}: ${data.description}`, "command-help");
  });
}

function executeLogin(args) {
  if (args.length === 1 && args[0] === "--help") {
    showHelp('login');
    return;
  } else if (args.length === 2) {
    if (gameState.authenticated) {
      outputLine("Ya has iniciado sesión.", "command-error");
      return;
    }

    const [username, password] = args;
    USER_ACCOUNT = username;

    socket = io(CONFIG.SERVER_URL, {
      withCredentials: false,
      transports: ["websocket", "polling"],
      query: {
        escapeRoom: CONFIG.ESCAPE_ROOM_ID,
        email: username,
        password: password,
      },
    });

    if (socket) setupSocketEvents();
  } else {
    outputLine("Estructura de comando inválida. Utiliza --help para ver más información", "command-error");
  }
}

function executeStart(args) {
  if (args.length === 1 && args[0] === "--help") {
    showHelp('start');
    return;
  } else if (args.length === 0) {
    if (!gameState.authenticated) {
      outputLine("Debes iniciar sesión antes de comenzar la EscapeRoom.", "command-error");
      return;
    }
    if (gameState.started) {
      outputLine("La EscapeRoom ya está iniciada.", "command-error");
      return;
    }
    startPlaying();
  } else {
    outputLine("Estructura de comando inválida. Utiliza --help para ver más información", "command-error");
  }
}

function executeHint(args) {
  if (args.length === 1 && args[0] === "--help") {
    showHelp('hint');
    return;
  } else if (args.length === 0) {
    if (!validateGameState()) {
      outputLine("Debes iniciar sesión y comenzar la EscapeRoom para ejecutar el comando.", "command-error");
      return;
    }
    if (gameState.currentPuzzle > 5){
      outputLine(`Ya has completado todos los puzzles, puedes escapar sin problemas`, "command-error");
      return;
    }

    if (gameState.currentPuzzleHintsUsed < 5) {
      requestHint();
    } else {
      outputLine("Ya has usado todas las pistas disponibles para este puzzle.", "command-error");
    }
  } else {
    outputLine("Estructura de comando inválida. Utiliza --help para ver más información", "command-error");
  }
}

function executeLs(args) {
  if (!validateGameState()) {
    outputLine("Debes iniciar sesión y comenzar la EscapeRoom para ejecutar el comando.", "command-error");
    return;
  }
  
  if (!validateNoProgramRunning()) return;

  if (args.length === 1) {
    switch (args[0]) {
      case "--help":
        showHelp('ls');
        outputLines([
          "-a    Muestra todos los archivos, incluidos los ocultos.",
          "-l    Muestra información detallada de los archivos.",
          "-al   Muestra todos los archivos con información detallada."
        ], "command-help");
        return;
      case "-a":
        listFiles(true, false);
        return;
      case "-l":
        listFiles(false, true);
        return;
      case "-al":
      case "-la":
        listFiles(true, true);
        return;
      default:
        outputLine("Estructura de comando inválida. Utiliza --help para ver más información", "command-error");
        return;
    }
  } else if (args.length > 0) {
    outputLine("Estructura de comando inválida. Utiliza --help para ver más información", "command-error");
  } else {
    listFiles(false);
  }
}

function executeCat(args) {
  if (!validateGameState()) {
    outputLine("Debes iniciar sesión y comenzar la EscapeRoom para ejecutar el comando.", "command-error");
    return;
  }

  if (!validateNoProgramRunning()) return;

  if (args.length === 1 && args[0] === "--help") {
    showHelp('cat');
    return;
  } else if (args.length === 1) {
    const fileName = args[0];
    
    // Handle server logs room
    if (gameState.currentRoom.displayName === "server_logs") {
      const logsRegex = /^registro_([0-9]|[1-4][0-9])\.log$/;
      if (!logsRegex.test(fileName)) {
        outputLine(`El archivo ${fileName} no existe en la habitación actual.`, "command-error");
        return;
      }
      
      const fileNum = parseInt(fileName.match(/\d+/)[0]);
      for (let i = 0; i < 10; i++) {
        if (fileNum === gameState.log_solution_num && i === 6) {
          const line = generateRandomString(128, true) + "ACCESO=" + gameState.log_solution + generateRandomString(112, true);
          outputLine(line, "command-output");
        } else {
          outputLine(generateRandomString(256, true), "command-output");
        }
      }
      return;
    }

    if (!gameState.currentRoom?.files.includes(fileName)) {
      outputLine(`El archivo ${fileName} no existe en la habitación actual.`, "command-error");
      return;
    }
    
    readFileContent(fileName);

    if (fileName === "tarjeta_seguridad.bin") {
      outputLine("Se ha añadido la tarjeta de seguridad al inventario. Ahora puedes modificar permisos", "command-special");
      gameState.inventory[`$KEYCARD`] = "Tarjeta de seguridad de nivel 2. Permite sobreescribir permisos.";
    }
  } else {
    outputLine("Estructura de comando inválida. Utiliza --help para ver más información", "command-error");
  }
}

function executeGrep(args) {
  if (!validateGameState()) {
    outputLine("Debes iniciar sesión y comenzar la EscapeRoom para ejecutar el comando.", "command-error");
    return;
  }

  if (!validateNoProgramRunning()) return;

  if (args.length === 1 && args[0] === "--help") {
    outputLine(commands.grep.help, "command-help");
    outputLine("Opciones:  --help    Muestra esta información de ayuda.", "command-help");
    outputLine("-r   Ejecuta la búsqueda de forma recursiva en todos los archivos de la carpeta. *No requiere el argumento ARCHIVO.", "command-help");
    return;
  } else if (args.length === 2) {
    if (args[0] === "-r") {
      if (gameState.currentRoom.displayName === "server_logs") {
        if (new RegExp(/^ACCESO/).test(args[1])) {
          outputLine(`ACCESO=${gameState.log_solution}`, "command-special");
          return;
        }
        return;
      }
      
      gameState.currentRoom.files.forEach(element => {
        const match = files[element].content.match(args[1]);
        if (match) {
          outputLine(match[0], "command-special");
        }
      });
    } else {
      const pattern = args[0];
      const fileName = args[1];

      if (gameState.currentRoom.displayName === "server_logs") {
        const logsRegex = /^registro_([0-9]|[1-4][0-9])\.log$/;
        if (!logsRegex.test(fileName)) {
          outputLine(`El archivo ${fileName} no existe en la habitación actual.`, "command-error");
          return;
        }
        console.log(gameState.log_solution_num);
        
        const fileNum = parseInt(fileName.match(/\d+/)[0]);
        if (fileNum === gameState.log_solution_num && new RegExp(/^ACCESO/).test(pattern)) {
          outputLine(`ACCESO=${gameState.log_solution}`, "command-special");
          return;
        } else {
          outputLine(`No se ha encontrado el patrón en el archivo.`, "command-error");
          return;
        }
      }
      
      if (!gameState.currentRoom?.files.includes(fileName)) {
        outputLine(`El archivo ${fileName} no existe en la habitación actual.`, "command-error");
        return;
      }

      const match = files[fileName].content.match(pattern);
      if (match) {
        outputLine(match[0], "command-special");
      }
    }
  } else {
    outputLine("Estructura de comando inválida. Utiliza --help para ver más información", "command-error");
  }
}

function executeFind(args) {
  if (!validateGameState()) {
    outputLine("Debes iniciar sesión y comenzar la EscapeRoom para ejecutar el comando.", "command-error");
    return;
  }

  if (!validateNoProgramRunning()) return;

  if (args.length === 1 && args[0] === "--help") {
    outputLine(commands.find.help, "command-help");
    outputLine("'.' representa el directorio actual", "command-help");
    outputLine("Opciones:  --help    Muestra esta información de ayuda.", "command-help");
    return;
  } else if (args.length === 2) {
    const dir = args[0];
    const pattern = args[1];
    
    let targetDir = null;
    let found = false;
    
    if (dir === "." && gameState.currentRoom.perms.read) {
      targetDir = gameState.currentRoom.displayName;
    }
    
    if (!targetDir) {
      for (const link of gameState.currentRoom?.links) {
        if (rooms[link]?.displayName === dir) {
          targetDir = link;
          break;
        }
      }
    }

    if (!targetDir) {
      outputLine(`La habitación ${dir} no existe o no es accesible desde la habitación actual.`, "command-error");
      return;
    }
    
    if (!rooms[targetDir]?.perms.read) {
      outputLine("Permiso denegado.", "command-error");
      return;
    }

    // Directorio actual
    rooms[targetDir].files.forEach(file => {
      if (new RegExp(pattern).test(file)) {
        outputLine(`Archivo encontrado en ${rooms[targetDir].displayName}`, "command-special");
        found = true;
      }
    });

    // Directorios internos
    rooms[targetDir].links.forEach(link => {
      rooms[link].files.forEach(file => {
        if (new RegExp(pattern).test(file)) {
          outputLine(`Archivo encontrado en ${rooms[link].displayName}`, "command-special");
          found = true;
        }
      });
    });

    if (!found) {
      outputLine("No se ha encontrado ningún archivo que se corresponda al patrón", "command-error");
    }
  } else {
    outputLine("Estructura de comando inválida. Utiliza --help para ver más información", "command-error");
  }
}

function executeExit(args) {
  if (!validateGameState()) {
    outputLine("Debes iniciar sesión y comenzar la EscapeRoom para ejecutar el comando.", "command-error");
    return;
  }
  
  if (args.length === 1 && args[0] === "--help") {
    showHelp('exit');
    return;
  } else if (args.length === 0) {
    if (gameState.executingProgram) {
      gameState.currentProgram = null;
      gameState.executingProgram = false;
      outputLine("Terminando la ejecución del programa...", "command-special");
      updateRoomDisplay(gameState.currentRoom.dirName);
      roomDisplay.classList.remove("command-special");
      updateASCIIArt(gameState.currentRoom.asciiArt);
    } else {
      outputLine("No hay ningún programa en ejecución.", "command-error");
    }
  } else {
    outputLine("Estructura de comando inválida. Utiliza --help para ver más información", "command-error");
  }
}

function executeEcho(args) {
  if (!validateGameState()) {
    outputLine("Debes iniciar sesión y comenzar la EscapeRoom para ejecutar el comando.", "command-error");
    return;
  }
  
  if (args.length === 1 && args[0] === "--help") {
    showHelp('echo');
    return;
  } else if (args.length >= 1) {
    const message = args.join(" ");
    outputLine(`ECHO ${message}`, "command-prompt");
    
    if (gameState.executingProgram) {
      if (gameState.solvedPuzzles.includes(gameState.currentProgram)) {
        switch(gameState.currentProgram) {
          case 1:
          case 2:
          case 3:
            outputLine("La puerta ya está abierta.", "command-special");
            return;
          case 5:
            outputLine("El usuario ya se encuentra en la lista de sudoers.", "command-special");
            return;
        }
        return;
      }
      solvePuzzle(gameState.currentProgram, message);
    } else {
      outputLine(`ECHO ${message}`, "command-echo2");
      outputLine(`ECHO ${message}`, "command-echo3");
      outputLine("El vacío no responde.", "command-special");
    }
  } else {
    outputLine("Estructura de comando inválida. Utiliza --help para ver más información", "command-error");
  }
}

function executeCd(args) {
  if (!validateGameState()) {
    outputLine("Debes iniciar sesión y comenzar la EscapeRoom para ejecutar el comando.", "command-error");
    return;
  }
  
  if (!validateNoProgramRunning()) return;

  if (args.length === 1 && args[0] === "--help") {
    showHelp('cd');
    outputLine("  ..        Vuelve a la habitación anterior.", "command-help");
    return;
  } else if (args.length === 1) {
    const dirName = args[0];
    let targetRoomName = null;
    
    if (dirName === "..") {
      targetRoomName = gameState.currentRoom?.backlink;
    } else {
      for (const link of gameState.currentRoom?.links) {
        if (rooms[link]?.displayName === dirName) {
          targetRoomName = link;
          break;
        }
      }
    }
    
    if (!targetRoomName) {
      outputLine(`La habitación ${dirName} no existe o no es accesible desde la habitación actual.`, "command-error");
      return;
    }
    
    if (!rooms[targetRoomName]?.perms.execute) {
      outputLine(rooms[targetRoomName]?.lockmsg || "Permiso denegado.", "command-error");
      return;
    }

    if (targetRoomName === "Salida") {
      if (!Object.keys(gameState.inventory).includes("$SUDOER")) {
        outputLine("La puerta está bloqueada por el escáner de retina.", "command-error");
        return;
      }
    }

    gameState.currentRoom = rooms[targetRoomName];
    updateRoomDisplay(gameState.currentRoom.dirName);
    updateASCIIArt(gameState.currentRoom.asciiArt);

    if (gameState.currentRoom.displayName === "Servidores") {
      solvePuzzle(4, "Storage");
    }
  } else {
    outputLine("Estructura de comando inválida. Utiliza --help para ver más información", "command-error");
  }
}

function executeMv(args) {
  if (!validateGameState()) {
    outputLine("Debes iniciar sesión y comenzar la EscapeRoom para ejecutar el comando.", "command-error");
    return;
  }
  
  if (!validateNoProgramRunning()) return;

  if (args.length === 1 && args[0] === "--help") {
    showHelp('mv');
    return;
  } else if (args.length === 2) {
    const fileName = args[0];
    const destName = args[1];
    
    if (!gameState.currentRoom?.files.includes(fileName)) {
      outputLine(`El archivo ${fileName} no existe en la habitación actual.`, "command-error");
      return;
    }
    
    // Objetos inamovibles
    const immovableItems = ["estatua.obj", "panel.exe", "consola.exe", "keypad.exe"];
    if (immovableItems.includes(fileName)) {
      outputLine(fileName === "estatua.obj" ? "La estatua pesa demasiado y no puede moverse" : "No se puede arrancar esto de la pared", "command-error");
      return;
    }

    const targetRoom = Object.values(rooms).find(room => room.displayName === destName);
    if (!targetRoom) {
      outputLine(`La ruta de destino ${destName} no existe.`, "command-error");
      return;
    }
    
    if (!targetRoom.perms.write) {
      outputLine("Permiso de escritura denegado en la ruta de destino.", "command-error");
      return;
    }
    
    if (!files[fileName].perms.write) {
      outputLine("Permiso de escritura denegado en el archivo.", "command-error");
      return;
    }

    // Mover el archivo
    targetRoom.files.push(fileName);
    const fileIndex = gameState.currentRoom.files.indexOf(fileName);
    if (fileIndex > -1) {
      gameState.currentRoom.files.splice(fileIndex, 1);
    }
    
    rooms[gameState.currentRoom.dirName].files = gameState.currentRoom.files;
    outputLine(`Archivo ${fileName} movido a ${destName}.`, "command-output");
    
    if (files[fileName].moved) {
      files[fileName].moved();
    }
  } else {
    outputLine("Estructura de comando inválida. Utiliza --help para ver más información", "command-error");
  }
}

function executeRm(args) {
  if (!validateGameState()) {
    outputLine("Debes iniciar sesión y comenzar la EscapeRoom para ejecutar el comando.", "command-error");
    return;
  }
  
  if (!validateNoProgramRunning()) return;

  if (args.length === 1 && args[0] === "--help") {
    showHelp('rm');
    return;
  } else if (args.length === 1) {
    const fileName = args[0];
    
    if (!gameState.currentRoom?.files.includes(fileName)) {
      outputLine(`El archivo ${fileName} no existe en la habitación actual.`, "command-error");
      return;
    }
    
    if (!files[fileName].perms.write) {
      outputLine("Permiso de escritura denegado en el archivo.", "command-error");
      return;
    }

    switch(fileName) {
      case "estatua.obj":
        const fileIndex = gameState.currentRoom.files.indexOf(fileName);
        if (fileIndex > -1) {
          gameState.currentRoom.files.splice(fileIndex, 1);
        }
        gameState.currentRoom.files.push("boton-almacen");
        rooms[gameState.currentRoom.dirName].files = gameState.currentRoom.files;
        outputLine("La estatua se ha hecho pedazos. Parece que había algo debajo.", "command-output");
        break;
      
      default:
        outputLine("No creo que sea buena idea destruir este objeto", "command-special");
        break;
    }
  } else {
    outputLine("Estructura de comando inválida. Utiliza --help para ver más información", "command-error");
  }
}

function executeCp(args) {
  if (!validateGameState()) {
    outputLine("Debes iniciar sesión y comenzar la EscapeRoom para ejecutar el comando.", "command-error");
    return;
  }
  
  if (!validateNoProgramRunning()) return;

  if (args.length === 1 && args[0] === "--help") {
    showHelp('cp');
    return;
  } else if (args.length === 2) {
    const fileName = args[0];
    const dirName = args[1];
    
    if (!gameState.currentRoom?.files.includes(fileName)) {
      outputLine(`El archivo ${fileName} no existe en la habitación actual.`, "command-error");
      return;
    }

    const targetRoom = Object.values(rooms).find(room => room.displayName === dirName);
    if (!targetRoom) {
      outputLine(`La ruta de destino ${dirName} no existe.`, "command-error");
      return;
    }
    
    if (!targetRoom.perms.write) {
      outputLine("Permiso de escritura denegado en la ruta de destino.", "command-error");
      return;
    }
    
    if (!files[fileName].perms.write) {
      outputLine("Permiso de escritura denegado en el archivo.", "command-error");
      return;
    }

    targetRoom.files.push(fileName);
    gameState.currentRoom.files = rooms[gameState.currentRoom.dirName].files;
    outputLine(`Archivo ${fileName} copiado a ${dirName}.`, "command-output");
  } else {
    outputLine("Estructura de comando inválida. Utiliza --help para ver más información", "command-error");
  }
}

function executeClear(args) {
  if (args.length === 1 && args[0] === "--help") {
    showHelp('clear');
    return;
  } else if (args.length > 0) {
    outputLine("Estructura de comando inválida. Utiliza --help para ver más información", "command-error");
    return;
  } else {
    terminalOutput.replaceChildren();
  }
}

function executeInventory(args) {
  if (!validateGameState()) {
    outputLine("Debes iniciar sesión y comenzar la EscapeRoom para ejecutar el comando.", "command-error");
    return;
  }
  
  if (args.length === 1 && args[0] === "--help") {
    outputLine(commands.inventory.help, "command-help");
    outputLine("inventory --help    Muestra esta información de ayuda.", "command-help");
    outputLine("inventory [ITEM]    Muestra información sobre el ITEM del inventario", "command-help");
    return;
  } else if (args.length === 1) {
    let item = args[0].toUpperCase();
    if (!item.startsWith('$')) {
      item = '$' + item;
    }
    
    if (gameState.inventory[item]) {
      switch (item) {
        case "$KEYCARD":
          outputLine(item, "inventory-item");
          outputLine("Tarjeta de seguridad de nivel 2. Permite sobreescribrir permisos.", "inventory-item");
          break;
        default:
          outputLine(`${item}: ${gameState.inventory[item]}`, "inventory-item");
      }
    } else {
      outputLine(`El objeto ${item} no se encuentra en el inventario`, "command-error");
    }
  } else if (args.length > 1) {
    outputLine("Estructura de comando inválida. Utiliza --help para ver más información", "command-error");
  } else {
    Object.entries(gameState.inventory).forEach(([varName, text]) => {
      outputLine(`  ${varName}`, "object-item");
    });
  }
}

function executeTouch(args) {
  if (!validateGameState()) {
    outputLine("Debes iniciar sesión y comenzar la EscapeRoom para ejecutar el comando.", "command-error");
    return;
  }

  if (args.length === 1 && args[0] === "--help") {
    showHelp('touch');
    return;
  } else if (args.length >= 2) {
    const varName = args[0];
    const text = args.slice(1).join(" ");
    gameState.inventory[`$${varName.toUpperCase()}`] = text;
    outputLine(`Variable $${varName.toUpperCase()} guardada en el inventario.`, "command-output");
  } else {
    outputLine("Estructura de comando inválida. Utiliza --help para ver más información", "command-error");
  }
}

function executeChmod(args) {
  if (!validateGameState()) {
    outputLine("Debes iniciar sesión y comenzar la EscapeRoom para ejecutar el comando.", "command-error");
    return;
  }

  if (!validateNoProgramRunning()) return;

  if (!Object.keys(gameState.inventory).includes("$KEYCARD")) {
    outputLine("No tienes autorización para cambiar permisos", "command-error");
    return;
  }

  if (args.length === 1 && args[0] === "--help") {
    outputLine(commands.chmod.help, "command-help");
    outputLines([
      "PERMISOS:",
      "    w: Escritura. Permite mover y eliminar el objeto.",
      "    x: Ejecución. Permite ejecutar el archivo o entrar en un directorio.",
      "    r: Lectura. Permite leer los contenidos del archivo o directorio.",
      "EJEMPLO:",
      "    chmod +w papel.txt",
      "    chmod -rx Armario"
    ], "command-help");
    return;
  } else if (args.length === 2) {
    const fileName = args[1];
    const permits = [...args[0]];

    if (permits[0] !== "+" && permits[0] !== "-") {
      outputLine("Estructura de comando inválida. Utiliza --help para ver más información", "command-error");
      return;
    }
    
    for (let i = 1; i < permits.length; i++) {
      if (permits[i] !== "w" && permits[i] !== "x" && permits[i] !== "r") {
        outputLine("Estructura de comando inválida. Utiliza --help para ver más información", "command-error");
        return;
      }
    }

    if (fileName === "Salida" && !Object.keys(gameState.inventory).includes("$SUDOER")) {
      outputLine("Requiere permisos de administrador", "command-error");
      return;
    }
    
    let changed = false;
    
    // Intentar cambiar permisos de directorio
    for (const link of gameState.currentRoom.links) {
      if (rooms[link].displayName === fileName) {
        for (let i = 1; i < permits.length; i++) {
          switch(permits[i]) {
            case "w":
              rooms[link].perms.write = permits[0] === "+";
              break;
            case "x":
              rooms[link].perms.execute = permits[0] === "+";
              break;
            case "r":
              rooms[link].perms.read = permits[0] === "+";
              break;
          }
        }
        changed = true;
        outputLine("Permisos del directorio modificados", "command-special");
        break;
      }
    }
    
    // Intentar cambiar permisos de archivo
    if (!changed && gameState.currentRoom.files.includes(fileName)) {
      for (let i = 1; i < permits.length; i++) {
        switch(permits[i]) {
          case "w":
            files[fileName].perms.write = permits[0] === "+";
            changed = true;
            break;
          case "x":
            files[fileName].perms.execute = permits[0] === "+";
            changed = true;
            break;
          case "r":
            files[fileName].perms.read = permits[0] === "+";
            changed = true;
            break;
        }
      }
      
      if (changed) {
        outputLine("Permisos del archivo modificados", "command-special");
      }
    }
    
    if (!changed) {
      outputLine("No existe ningún fichero o directorio con ese nombre en esta localización", "command-error");
    }
  } else {
    outputLine("Estructura de comando inválida. Utiliza --help para ver más información", "command-error");
  }
}

// ==================== GAME COMPLETION ====================
function endSequence() {
  clearInterval(remainingTimer);
  updateRoomDisplay("Libertad");
  
  updateASCIIArt(victoryASCII);
  
  outputLines(["", "", "", "", "¡Enhorabuena!", "Has conseguido completar el juego y salir de la escaperoom", "Gracias por jugar"], "command-output");

  socket.close();

  // Reconexión para obtener ranking
  socket = io(CONFIG.SERVER_URL, {
    withCredentials: false,
    transports: ["websocket", "polling"],
    query: {
      escapeRoom: CONFIG.ESCAPE_ROOM_ID,
      email: USER_ACCOUNT,
      token: USER_TOKEN, //la contraseña no se almacena
    },
  });
  
  if (socket) setupSocketEvents();
}