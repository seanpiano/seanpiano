const keys = "cdefgabcdefgabc";
let currentKey = "c";
let hackCount = 0;

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
	},
	loadSettings: function () {
		if (localStorage.getItem("data-selected")) {
			try {
				const dataSelected = JSON.parse(localStorage.getItem("data-selected"));
				if (dataSelected.length === this.selected.length) {
					dataSelected.forEach((d,i)=>{
						this.selected[i] = Boolean(d);
					});
				}
				this.updateEnabled();
				document.querySelectorAll(".keyset").forEach((set,i)=>{
					if (this.selected[i]) {
						set.classList.add("selected");
					} else {
						set.classList.remove("selected");
					}
				});
				generateNewKey();
			} catch (e) {
				console.log(e);
				return;
			}
		}
	},
	toggleSelected: function(target) {
		target.classList.toggle("selected");
		const index = target.getAttribute("data-noteset");
		this.selected[index] = !notePicker.selected[index];
		this.updateEnabled();
		localStorage.setItem("data-selected", JSON.stringify(this.selected));
		console.log(localStorage.getItem("data-selected"));
	}
};

const RESET = 0;
const INCREMENT = 1;

let timedMode;
let timerInterval;
let score = 0;
let hue = 50;

const HTMLWhiteKeys = document.querySelectorAll(".whitekeys .keys");
const HTMLLetter = document.querySelector(".letter");
const HTMLPianoContainer = document.querySelector(".piano");
const HTMLTimer = document.querySelector(".timer-text");

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
	document.body.classList.add('timed-mode');
	document.querySelector(".score").innerHTML = "??";
	HTMLTimer.innerHTML = "On";
	HTMLTimer.classList.add("timer-mode");
	HTMLTimer.parentElement.setAttribute("data-disabled",true);
	HTMLTimer.parentElement.classList.add("selected");
	timerInterval = setInterval(() => {
		//HTMLTimer.innerHTML = --timeLeft + "s";
		--timeLeft;
		if (timeLeft === -1) {
			stopTimer();
		}
	}, 1000);
}

function stopTimer() {
	document.body.classList.remove('timed-mode');
	updateHue(RESET);
	window.clearInterval(timerInterval);
	timedMode = false;
	HTMLTimer.classList.remove("timer-mode");
	HTMLTimer.innerHTML = "Timed Mode";
	HTMLTimer.parentElement.setAttribute("data-disabled",false);
	HTMLTimer.parentElement.classList.remove("selected");
	document.querySelector(".score").innerHTML = score;
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
	if (score % 10 === 0) {
		//updateHue(INCREMENT);
	}
	if (score === 60) {
		document.body.style.setProperty('--light', '50%');
	}
	// HTMLScore.innerHTML = score;
}

function updateHue(command) {
	if (command === RESET) {
		document.body.style.setProperty('--hue', 200);
		document.body.style.setProperty('--light', '70%');
		hue = 50;
	} else if (command === INCREMENT) {
		hue += 50;
		document.body.style.setProperty('--hue', hue);
	}
}

function resetNotes() {
	HTMLWhiteKeys.forEach((key) => {
		key.classList.remove("correct");
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

document.addEventListener("click", (e) => {
	const t = e.target;
	if (t.getAttribute("data-disabled")) {
		if (t.getAttribute("data-disabled") === "true") {
			hackCount++;
			if (hackCount > 5) {
				hackCount = 0;
				alert("I fixed the bug xd");
			}
			return;
		}
	}
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
		notePicker.toggleSelected(t);
	} else {
		console.info(t);
	}
});

function updatePianoHeight() {
	HTMLPianoContainer.style.height = HTMLPianoContainer.offsetWidth / 3.33 + "px";
}

function onPageLoad() {
	HTMLWhiteKeys.forEach((key, i) => {
		key.setAttribute("data-key", keys[i]);
		key.innerHTML = `<div class="note invis">${keys[i].toUpperCase()}</div>`;
	});
	notePicker.loadSettings();
	updatePianoHeight();
}

onPageLoad();

window.addEventListener("resize", updatePianoHeight);
