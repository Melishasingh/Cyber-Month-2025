// --- DOM Elements ---
const gameContainer = document.getElementById('gameContainer');
const scoreEl = document.getElementById('score');
const gameTimerEl = document.getElementById('gameTimer');
const playerNameDisplayEl = document.getElementById('playerNameDisplay');
const streakEl = document.getElementById('streak');
const streakContainer = document.getElementById('streakContainer');
const scenarioContainer = document.getElementById('scenarioContainer');
const questionTimerBar = document.getElementById('questionTimerBar');
const actionButtons = document.getElementById('actionButtons');
const feedbackContainer = document.getElementById('feedbackContainer');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');

// --- Game Scenarios ---
const scenarios = [
    { type: 'email', from: 'IT Support <it-support@company.com>', to: 'All Employees <all@company.com>', subject: 'Action Required: Verify Your Password', body: 'Our records show your password is out of date. Please reply to this email with your current password to keep your account active.', isUnsafe: true, explanation: 'UNSAFE! Legitimate IT departments will NEVER ask for your password in an email. This is a classic tactic to steal credentials.' },
    { type: 'sms', sender: '+1-484-555-0104', body: 'MFA Code: 123456. We received a login request from a new device. If this wasn\'t you, reply with this code to cancel the login.', isUnsafe: true, explanation: 'UNSAFE! This is a scam. Attackers already have your password and are trying to trick you into giving them the MFA code to complete their login.' },
    { type: 'browser', title: 'Password Manager', body: 'Would you like to generate and save a strong, unique password for this site?', isUnsafe: false, explanation: 'SAFE! Using a password manager to create and store complex, unique passwords for each site is a core security best practice.' },
    { type: 'website', title: 'Create Account', body: 'You are signing up for a new service. You decide to reuse the same password you use for your email and banking.', isUnsafe: true, explanation: 'UNSAFE! Reusing passwords is extremely risky. If one site is breached, attackers will use that same password to try and access your other, more important accounts.' },
    { type: 'login_prompt', title: 'Social Media Login', body: 'You log in to your social media. After entering your password, you are prompted to enter a 6-digit code from your authenticator app.', isUnsafe: false, explanation: 'SAFE! This is exactly how Multi-Factor Authentication (MFA) is supposed to work. It provides an essential second layer of security.' },
    { type: 'email', from: 'Microsoft Security <no-reply@mail.microsoft-online.com>', to: 'user@company.com', subject: 'Someone shared a file with you', body: 'A file named \'Q3 Financials.docx\' has been shared with you. Click here to access the document.', isUnsafe: true, explanation: 'UNSAFE! The sender uses a subdomain \'mail.microsoft-online.com\' to appear legitimate. This is a common phishing tactic to steal login credentials.' },
    { type: 'sticky_note', title: 'Desktop', body: 'You write your new, complex password on a sticky note and put it on your monitor so you don\'t forget it.', isUnsafe: true, explanation: 'UNSAFE! Writing passwords down physically, especially in plain sight, completely defeats the purpose of having a strong password.' },
    { type: 'sms', sender: 'Your Mobile Carrier', body: 'Enable MFA on your account to prevent unauthorized SIM swaps and protect your number. Visit our official website to learn how.', isUnsafe: false, explanation: 'SAFE! This is good advice. SIM swapping is a real threat, and MFA on your mobile account is a key defense against it.' },
    { type: 'email', from: 'HR Department <hr@company-hr.com>', to: 'user@company.com', subject: 'Important: Update to Company Policy', body: 'All employees must review and acknowledge the updated remote work policy by EOD. Failure to comply may affect your network access. Click here to review.', isUnsafe: true, explanation: 'UNSAFE! The sender is a generic "HR Department" from a suspicious domain (company-hr.com) and creates a false sense of urgency with a threat.' },
    { type: 'browser', title: 'Password Manager Alert', body: 'Warning: The password for your banking site is weak and has been seen in a data breach. We recommend changing it immediately.', isUnsafe: false, explanation: 'SAFE! This is a critical feature of good password managers. They check your passwords against known breaches and alert you so you can change them.' },
];

let shuffledScenarios = [];
let currentScenarioIndex = 0;
let score = 0;
let streak = 0;
let playerName = '';
let gameTimer = 90;
let questionTimer = 15;
let gameTimerInterval;
let questionTimerInterval;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function displayScenario() {
    if (currentScenarioIndex >= shuffledScenarios.length) {
        endGame();
        return;
    }
    feedbackContainer.classList.add('hidden');
    actionButtons.style.display = 'grid';
    const scenario = shuffledScenarios[currentScenarioIndex];
    let content = '';
    if (scenario.type === 'email') {
        content = `<div class="border rounded-md p-4">
                        <div class="border-b pb-2 mb-2 text-sm">
                            <p><span class="font-semibold">From:</span> ${scenario.from}</p>
                            <p><span class="font-semibold">To:</span> ${scenario.to}</p>
                        </div>
                        <div><span class="font-semibold">Subject:</span> ${scenario.subject}</div>
                        <hr class="my-3">
                        <p class="text-gray-700">${scenario.body}</p>
                    </div>`;
    } else if (scenario.type === 'sms') {
        content = `<div class="w-4/5 mx-auto bg-green-200 p-3 rounded-lg shadow">
                            <div class="font-semibold text-sm mb-1">${scenario.sender}</div>
                            <p>${scenario.body}</p>
                        </div>`;
    } else {
        content = `<div class="border-2 border-gray-300 rounded-lg shadow-inner">
                            <div class="bg-gray-200 p-2 border-b-2 border-gray-300 font-semibold text-gray-600">${scenario.title}</div>
                            <p class="p-8 text-center text-lg">${scenario.body}</p>
                        </div>`;
    }
    scenarioContainer.innerHTML = content;
    startQuestionTimer();
}

function startQuestionTimer() {
    questionTimer = 15;
    questionTimerBar.style.width = '100%';
    questionTimerBar.classList.remove('bg-yellow-400', 'bg-red-500');
    questionTimerBar.classList.add('bg-cyan-400');
    clearInterval(questionTimerInterval);
    questionTimerInterval = setInterval(() => {
        questionTimer--;
        const percentage = (questionTimer / 15) * 100;
        questionTimerBar.style.width = `${percentage}%`;
        if (percentage < 60) questionTimerBar.classList.replace('bg-cyan-400', 'bg-yellow-400');
        if (percentage < 30) questionTimerBar.classList.replace('bg-yellow-400', 'bg-red-500');
        if (questionTimer <= 0) {
            makeChoice(null);
        }
    }, 1000);
}

function makeChoice(isUnsafeChoice) {
    clearInterval(questionTimerInterval);
    const scenario = shuffledScenarios[currentScenarioIndex];
    const correctChoice = (isUnsafeChoice === scenario.isUnsafe);
    let feedbackHtml = '';
    if (isUnsafeChoice === null) {
        streak = 0;
        feedbackHtml = `<h3 class="font-bold text-xl text-yellow-400 mb-2">Time's Up!</h3><p>${scenario.explanation}</p>`;
        feedbackContainer.className = 'mt-6 p-4 rounded-lg bg-gray-800 text-white feedback-incorrect';
    } else if (correctChoice) {
        streak++;
        const streakBonus = streak * 10;
        const points = 100 + (questionTimer * 10) + streakBonus;
        score += points;
        feedbackHtml = `<h3 class="font-bold text-xl text-green-400 mb-2">Correct! (+${points})</h3><p>${scenario.explanation}</p>`;
        feedbackContainer.className = 'mt-6 p-4 rounded-lg bg-gray-800 text-white feedback-correct';
        streakContainer.classList.add('streak-pop-animation');
        setTimeout(() => streakContainer.classList.remove('streak-pop-animation'), 300);
    } else {
        streak = 0;
        feedbackHtml = `<h3 class="font-bold text-xl text-red-400 mb-2">Incorrect!</h3><p>${scenario.explanation}</p>`;
        feedbackContainer.className = 'mt-6 p-4 rounded-lg bg-gray-800 text-white feedback-incorrect';
    }
    scoreEl.textContent = score;
    streakEl.textContent = `${streak}x`;
    feedbackContainer.innerHTML = feedbackHtml;
    feedbackContainer.classList.remove('hidden');
    actionButtons.style.display = 'none';
    currentScenarioIndex++;
    setTimeout(displayScenario, 4500);
}

function startGame() {
    const nameInput = document.getElementById('playerNameInput');
    if (!nameInput || nameInput.value.trim() === '') {
        alert('Please enter your name to start!');
        return;
    }
    playerName = nameInput.value.trim();
    score = 0;
    streak = 0;
    gameTimer = 90;
    currentScenarioIndex = 0;
    shuffledScenarios = [...scenarios];
    shuffleArray(shuffledScenarios);
    modal.style.display = 'none';
    gameContainer.style.display = 'block';
    scoreEl.textContent = score;
    streakEl.textContent = `${streak}x`;
    gameTimerEl.textContent = gameTimer;
    playerNameDisplayEl.textContent = playerName;
    gameTimerInterval = setInterval(() => {
        gameTimer--;
        gameTimerEl.textContent = gameTimer;
        if (gameTimer <= 0) {
            endGame();
        }
    }, 1000);
    displayScenario();
}

async function endGame() {
    clearInterval(gameTimerInterval);
    clearInterval(questionTimerInterval);

    // Submit the score to the Google Form
    await submitScoreToGoogleForm(playerName, score);

    showModal('Challenge Over!', `
        <p class="text-xl mb-4">Final Score: <span class="font-bold text-green-400">${score}</span></p>
        <p class="text-gray-300 mb-6">Your score has been submitted! The more you practice, the safer you'll be online.</p>
        <div class="flex justify-center gap-4">
            <button onclick="showIntroModal()" class="btn btn-safe text-white font-bold py-3 px-6 rounded-lg text-lg">Play Again</button>
        </div>
    `);
}

// --- Google Form Submission ---
async function submitScoreToGoogleForm(name, score) {
    // ⚠️ **ACTION REQUIRED:** Replace these placeholders with your actual IDs from your Google Form pre-filled link.
    const formId = '1tjuz0k_j6czw0iKkLf4svSA5hpTq8fEs9PaS2WjaRCw'; // The part after /d/ and before /prefill
    const nameEntryId = 'entry.1843475151'; // The entry ID for your "Name" question
    const scoreEntryId = 'entry.1082597792'; // The entry ID for your "Score" question

    const formData = new FormData();
    formData.append(nameEntryId, name);
    formData.append(scoreEntryId, score);

    const url = `https://docs.google.com/forms/d/e/${formId}/formResponse`;

    try {
        await fetch(url, {
            method: 'POST',
            mode: 'no-cors', // Important: This prevents a CORS error, but you won't get a success response back. The data still gets submitted.
            body: formData
        });
        console.log("Score submitted successfully (or at least, we tried!).");
    } catch (error) {
        console.error('Error submitting score:', error);
    }
}


// --- Modals ---
function showModal(title, content) {
    modalContent.innerHTML = `<h2 class="text-3xl font-bold mb-4 text-cyan-400">${title}</h2>${content}`;
    modal.style.display = 'flex';
}

function showIntroModal() {
    showModal('Credential Guardian Challenge', `
        <p class="text-gray-300 mb-2">Test your security skills! You'll be shown a series of scenarios related to passwords, MFA, and phishing.</p>
        <p class="text-gray-300 mb-4">Decide if each one is a <span class="font-bold text-green-400">Safe Practice</span> or an <span class="font-bold text-red-400">Unsafe Practice</span> before the timer runs out. Good luck!</p>
        <input type="text" id="playerNameInput" placeholder="Enter your name" class="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus-outline-none focus:ring-2 focus:ring-cyan-500 mb-4" required>
        <div class="flex justify-center gap-4">
            <button onclick="startGame()" class="btn btn-safe text-white font-bold py-3 px-6 rounded-lg text-lg">Start Challenge</button>
        </div>
    `);
}

// --- Initializer ---
showIntroModal();
