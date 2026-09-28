/*
 gui.js
 GameBoy Online
 
 Copyright (C) 2010-2016 Grant Galitz
 
 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var windowingInitialized = false;

function windowingInitialize() {
	if (!windowingInitialized) {
		windowingInitialized = true;
		
		// Setup Window Listeners
		document.getElementById("GameBoy_file_menu").onclick = function () {
			showMenu("GameBoy_file_popup");
		};
		document.getElementById("GameBoy_view_menu").onclick = function () {
			showMenu("GameBoy_view_popup");
		};
		document.getElementById("GameBoy_settings_menu").onclick = function () {
			showWindow("settings");
		};
		document.getElementById("GameBoy_about_menu").onclick = function () {
			showWindow("about");
		};
		
		// Setup Save Game Memory clicker (triggers save + file download)
		document.getElementById("save_SRAM_state_clicker").onclick = function () {
			if (gameboy) {
				saveSRAM();
			} else {
				cout("Cannot save game memory: No ROM loaded.", 2);
			}
		};
		
		document.getElementById("save_state_clicker").onclick = function () {
			if (gameboy) {
				saveFreezeState();
			} else {
				cout("Cannot save freeze state: No ROM loaded.", 2);
			}
		};
		
		document.getElementById("restart_cpu_clicker").onclick = function () {
			if (gameboy) {
				gameboy.reset();
			}
		};
		
		document.getElementById("run_cpu_clicker").onclick = function () {
			if (gameboy) {
				run();
			}
		};
		
		document.getElementById("kill_cpu_clicker").onclick = function () {
			if (gameboy) {
				pause();
			}
		};
		
		document.getElementById("view_terminal").onclick = function () {
			showWindow("terminal");
		};
		
		document.getElementById("view_instructions").onclick = function () {
			showWindow("instructions");
		};
		
		document.getElementById("internal_file_clicker").onclick = function () {
			showWindow("input_select");
		};
		
		// Attach Close Listeners
		document.getElementById("about_close_button").onclick = function () {
			hideWindow("about");
		};
		document.getElementById("settings_close_button").onclick = function () {
			hideWindow("settings");
		};
		document.getElementById("instructions_close_button").onclick = function () {
			hideWindow("instructions");
		};
		document.getElementById("input_select_close_button").onclick = function () {
			hideWindow("input_select");
		};
		document.getElementById("terminal_close_button").onclick = function () {
			hideWindow("terminal");
		};
		document.getElementById("terminal_clear_button").onclick = function () {
			document.getElementById("terminal_output").innerHTML = "";
		};
		
		// Setup local file picker input
		var fileInput = document.getElementById("local_file_open");
		fileInput.addEventListener("change", function (event) {
			if (this.files.length > 0) {
				var file = this.files[0];
				var reader = new FileReader();
				reader.onload = function (e) {
					start("mainCanvas", e.target.result);
					hideWindow("input_select");
				};
				reader.readAsBinaryString(file);
			}
		}, false);
	}
}

function showWindow(id) {
	var win = document.getElementById(id);
	if (win) {
		win.style.display = "block";
	}
}

function hideWindow(id) {
	var win = document.getElementById(id);
	if (win) {
		win.style.display = "none";
	}
}

function showMenu(id) {
	var menu = document.getElementById(id);
	if (menu) {
		menu.style.display = menu.style.display === "block" ? "none" : "block";
	}
}

function cout(message, level) {
	var output = document.getElementById("terminal_output");
	if (output) {
		var p = document.createElement("p");
		p.textContent = message;
		if (level === 2) {
			p.style.color = "red";
		}
		output.appendChild(p);
	}
}