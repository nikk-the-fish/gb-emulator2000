/*
 GameBoyIO.js
 GameBoy Online
 
 Copyright (C) 2010-2016 Grant Galitz
 
 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var gameboy = null;						//GameBoy low-level instance
var gbRunInterval = null;				//Stores the interval object for the CPU loop.
var settings = [						//Comprehensive settings list:
	true,								//Is sound enabled?
	false,								//Is GB mode forced over GBC?
	true,								//Use BIOS?
	true,								//Override ROM-only cartridge typing to MBC1?
	true,								//Always allow MBC bank read/writes?
	true,								//Colorize GB palettes?
	true,								//Minimal view on fullscreen?
	false,								//Resize canvas in JS?
	false,								//Disallow typed arrays?
	false,								//Use DMG boot ROM?
	true,								//Smooth dynamic resizing?
	true,								//Enable Sound Channel 1
	true,								//Enable Sound Channel 2
	true,								//Enable Sound Channel 3
	true								//Enable Sound Channel 4
];
var GameBoyAudioHandler = null;			//Audio device object.
var GameBoyAudioNode = null;			//Audio delay node / web audio object.
var audioContextHandle = null;			//Web Audio API Context
var audioResampler = null;              //Resampler
var gameboyVolume = 1;					//Master Volume

function start(canvas, ROM) {
	clearMasterControl();
	var canvasElement = document.getElementById(canvas);
	gameboy = new GameBoyCore(canvasElement, ROM);
	gameboy.onSRAMWrite = saveSRAM;
	gameboy.start();
	run();
}

function run() {
	if (GameBoyCoreExecuter) {
		GameBoyCoreExecuter.start();
	}
}

function pause() {
	if (GameBoyCoreExecuter) {
		GameBoyCoreExecuter.pause();
	}
}

function clearMasterControl() {
	if (GameBoyCoreExecuter) {
		GameBoyCoreExecuter.pause();
	}
	gameboy = null;
}

// Helper function to force browser file downloads
function triggerFileDownload(filename, dataArray) {
    var blob = new Blob([new Uint8Array(dataArray)], { type: "application/octet-stream" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

// Updated saveSRAM function that saves to localStorage AND triggers a download
function saveSRAM() {
	if (gameboy && gameboy.CompileSRAM) {
		try {
			var sramData = gameboy.CompileSRAM();
			
			// Save to browser localStorage
			var key = "GB_SRAM_" + gameboy.name;
			var data = JSON.stringify(sramData);
			window.localStorage.setItem(key, data);
			
			// Trigger download as .sav file
			var filename = (gameboy.name || "gameboy_save") + ".sav";
			triggerFileDownload(filename, sramData);
			
			console.log("SRAM saved locally and downloaded as " + filename);
		} catch (e) {
			console.log("Could not save SRAM: " + e.message);
		}
	}
}

function loadSRAM(name) {
	if (gameboy) {
		try {
			var key = "GB_SRAM_" + name;
			var data = window.localStorage.getItem(key);
			if (data) {
				gameboy.autoLoadSRAM(JSON.parse(data));
			}
		} catch (e) {
			console.log("Could not load SRAM from localStorage: " + e.message);
		}
	}
}

function saveFreezeState() {
	if (gameboy) {
		try {
			var key = "GB_FREEZE_" + gameboy.name;
			var data = JSON.stringify(gameboy.saveState());
			window.localStorage.setItem(key, data);
		} catch (e) {
			console.log("Could not save Freeze State: " + e.message);
		}
	}
}

function loadFreezeState() {
	if (gameboy) {
		try {
			var key = "GB_FREEZE_" + gameboy.name;
			var data = window.localStorage.getItem(key);
			if (data) {
				gameboy.returnFromState(JSON.parse(data));
			}
		} catch (e) {
			console.log("Could not load Freeze State: " + e.message);
		}
	}
}

// Keybindings mapping
window.addEventListener("keydown", function (event) {
	if (!gameboy) return;
	switch (event.keyCode) {
		case 39: gameboy.JoyPadEvent(0, true); break; // Right
		case 37: gameboy.JoyPadEvent(1, true); break; // Left
		case 38: gameboy.JoyPadEvent(2, true); break; // Up
		case 40: gameboy.JoyPadEvent(3, true); break; // Down
		case 88: // X
		case 74: gameboy.JoyPadEvent(4, true); break; // A
		case 90: // Z
		case 81:
		case 89: gameboy.JoyPadEvent(5, true); break; // B
		case 16: gameboy.JoyPadEvent(6, true); break; // Select
		case 13: gameboy.JoyPadEvent(7, true); break; // Start
	}
}, false);

window.addEventListener("keyup", function (event) {
	if (!gameboy) return;
	switch (event.keyCode) {
		case 39: gameboy.JoyPadEvent(0, false); break; // Right
		case 37: gameboy.JoyPadEvent(1, false); break; // Left
		case 38: gameboy.JoyPadEvent(2, false); break; // Up
		case 40: gameboy.JoyPadEvent(3, false); break; // Down
		case 88:
		case 74: gameboy.JoyPadEvent(4, false); break; // A
		case 90:
		case 81:
		case 89: gameboy.JoyPadEvent(5, false); break; // B
		case 16: gameboy.JoyPadEvent(6, false); break; // Select
		case 13: gameboy.JoyPadEvent(7, false); break; // Start
	}
}, false);