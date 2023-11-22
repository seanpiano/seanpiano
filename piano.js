console.clear();
const keys = "cdefgabcdefgabc";
let currentKey = "c";

const notePicker = {
	enabled: "cde",
	options: ["cde", "fgab"],
	selected: [true, false],
	updateEnabled: function () {
		this.enabled = "";
		this.selected.forEach((sel, i) => {
			if (sel) {
				this.enabled += this.options[i];
			}
		});
		this.enabled = this.enabled ? this.enabled : "cde";
	}
};

const RESET = 0;
const INCREMENT = 1;

let timedMode;
let timerInterval;
let score = 0;

const HTMLWhiteKeys = document.querySelectorAll(".whitekeys .keys");
const HTMLLetter = document.querySelector(".letter");
const HTMLPianoContainer = document.querySelector(".piano");
const HTMLTimer = document.querySelector(".timer-text");

HTMLWhiteKeys.forEach((key, i) => {
	key.setAttribute("data-key", keys[i]);
	key.innerHTML = `<div class="note">${keys[i].toUpperCase()}</div>`;
});

function generateNewKey() {
	let randomIndex = Math.floor(Math.random() * notePicker.enabled.length);
	let newKey = notePicker.enabled[randomIndex];
	if (newKey === currentKey) {
		if (randomIndex === notePicker.enabled.length - 1) {
			randomIndex = 0;
		} else {
			randomIndex += 1;
		}
		newKey = notePicker.enabled[randomIndex];
	}
	currentKey = newKey;
	HTMLLetter.innerHTML = currentKey.toUpperCase();
}

function startTimer(timeLeft) {
	timedMode = true;
	updateScore(RESET);
	resetNotes();
	HTMLTimer.innerHTML = timeLeft + "s";
	HTMLTimer.classList.add("timer-mode");
	timerInterval = setInterval(() => {
		HTMLTimer.innerHTML = --timeLeft + "s";
		if (timeLeft === -1) {
			stopTimer();
		}
	}, 1000);
}

function stopTimer() {
	window.clearInterval(timerInterval);
	timedMode = false;
	HTMLTimer.classList.remove("timer-mode");
	HTMLTimer.innerHTML = "Timed Mode";
    alert("Timer stopped!");
}

function updateScore(command) {
	const HTMLScore = document.querySelector(".score");
	if (command === RESET) {
		score = 0;
		HTMLScore.parentElement.classList.add("visible");
	} else if (command === INCREMENT) {
		score++;
	}
	HTMLScore.innerHTML = score;
}

function resetNotes() {
	HTMLWhiteKeys.forEach((key) => {
		key.classList.remove("correct");
		console.log(key);
		key.querySelector(".note").classList.remove("visible");
	});
}

function displayNoteNames(noteEls) {
	noteEls[1].classList.add("correct");
	noteEls.forEach((note) => {
		note.querySelector(".note").classList.add("visible");
	});
}

function findClosestCorrectNote(incorrectEl, correctNote) {
	const keyArray = [...HTMLWhiteKeys];
	const start = keyArray.indexOf(incorrectEl);
	const dists = [Infinity, Infinity];
	for (let i = start - 1; i >= 0; i--) {
		if (keys[i] === correctNote) {
			dists[0] = start - i;
			break;
		}
	}
	for (let i = start + 1; i <= keys.length; i++) {
		if (keys[i] === correctNote) {
			dists[1] = i - start;
			break;
		}
	}
	if (dists[0] < dists[1]) {
		return keyArray[start - dists[0]];
	} else {
		return keyArray[start + dists[1]];
	}
}

HTMLWhiteKeys.forEach((key, i) => {
	key.setAttribute("data-key", keys[i]);
	key.innerHTML = `<div class="note invis">${keys[i].toUpperCase()}</div>`;
});

document.addEventListener("click", (e) => {
	const t = e.target;
	if (t.getAttribute("data-key")) {
		resetNotes();
		if (t.getAttribute("data-key") === currentKey) {
			HTMLLetter.classList.add("correct");
			if (timedMode) {
				updateScore(INCREMENT);
			}
		} else {
			HTMLLetter.classList.remove("correct");
			displayNoteNames([e.target, findClosestCorrectNote(e.target, currentKey)]);
			if (timedMode) {
				stopTimer();
			}
		}
		generateNewKey();
	} else if (t.classList.contains("timer")) {
		startTimer(60);
	} else if (t.classList.contains("keyset")) {
		t.classList.toggle("selected");
		notePicker.selected[t.getAttribute("data-noteset")] = !notePicker.selected[
			t.getAttribute("data-noteset")
		];
		notePicker.updateEnabled();
	} else {
		console.log(t);
	}
});

function updatePianoHeight() {
	HTMLPianoContainer.style.height = HTMLPianoContainer.offsetWidth / 3.33 + "px";
}

updatePianoHeight();
window.addEventListener("resize", updatePianoHeight);
