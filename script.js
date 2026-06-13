const STORAGE_KEY = "sg-study-tool-history-v1";
let currentPool = [];
let currentIndex = 0;
let currentMode = "分野別";

const els = {
  totalQuestions: document.getElementById("totalQuestions"),
  categorySelect: document.getElementById("categorySelect"),
  startBtn: document.getElementById("startBtn"),
  wrongBtn: document.getElementById("wrongBtn"),
  resetBtn: document.getElementById("resetBtn"),
  nextBtn: document.getElementById("nextBtn"),
  modeBadge: document.getElementById("modeBadge"),
  progressText: document.getElementById("progressText"),
  questionText: document.getElementById("questionText"),
  choices: document.getElementById("choices"),
  result: document.getElementById("result"),
  scoreRate: document.getElementById("scoreRate"),
  scoreDetail: document.getElementById("scoreDetail"),
  categoryStats: document.getElementById("categoryStats"),
  wrongList: document.getElementById("wrongList"),
  scoreRing: document.querySelector(".score-ring")
};

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function saveHistory(history) { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); }
function shuffle(array) { return [...array].sort(() => Math.random() - 0.5); }
function categories() { return [...new Set(QUESTIONS.map(q => q.category))]; }

function setup() {
  els.totalQuestions.textContent = QUESTIONS.length;
  els.categorySelect.innerHTML = `<option value="all">すべて</option>` + categories().map(c => `<option value="${c}">${c}</option>`).join("");
  els.startBtn.addEventListener("click", startCategoryMode);
  els.wrongBtn.addEventListener("click", startWrongMode);
  els.resetBtn.addEventListener("click", resetHistory);
  els.nextBtn.addEventListener("click", nextQuestion);
  renderStats();
}

function startCategoryMode() {
  const selected = els.categorySelect.value;
  const pool = selected === "all" ? QUESTIONS : QUESTIONS.filter(q => q.category === selected);
  currentPool = shuffle(pool);
  currentIndex = 0;
  currentMode = selected === "all" ? "全分野" : selected;
  renderQuestion();
}

function startWrongMode() {
  const history = loadHistory();
  const wrongIds = Object.entries(history).filter(([, v]) => v.wrong > 0 && v.correct === 0).map(([id]) => id);
  const alsoRecentWrong = Object.entries(history).filter(([, v]) => v.last === "wrong").map(([id]) => id);
  const ids = [...new Set([...wrongIds, ...alsoRecentWrong])];
  currentPool = shuffle(QUESTIONS.filter(q => ids.includes(q.id)));
  currentIndex = 0;
  currentMode = "間違い復習";
  if (currentPool.length === 0) {
    els.modeBadge.textContent = currentMode;
    els.progressText.textContent = "対象なし";
    els.questionText.textContent = "今のところ、復習対象の問題はありません。きれいすぎて逆に不安、くらいです。";
    els.choices.innerHTML = "";
    els.result.className = "result hidden";
    return;
  }
  renderQuestion();
}

function renderQuestion() {
  const q = currentPool[currentIndex];
  els.modeBadge.textContent = currentMode;
  els.progressText.textContent = `${currentIndex + 1} / ${currentPool.length}`;
  els.questionText.textContent = q.question;
  els.result.className = "result hidden";
  els.result.textContent = "";
  const shuffledChoices = shuffle(q.choices.map((choice, i) => ({ text: choice, isAnswer: i === q.answer })));
  els.choices.innerHTML = shuffledChoices.map((choice, i) => `<button class="choice" data-answer="${choice.isAnswer}">${String.fromCharCode(65+i)}. ${choice.text}</button>`).join("");
  document.querySelectorAll(".choice").forEach(btn => btn.addEventListener("click", () => answerQuestion(btn)));
}

function answerQuestion(selectedBtn) {
  const q = currentPool[currentIndex];
  const isCorrect = selectedBtn.dataset.answer === "true";
  document.querySelectorAll(".choice").forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.answer === "true") btn.classList.add("correct");
    if (btn === selectedBtn && !isCorrect) btn.classList.add("incorrect");
  });
  const history = loadHistory();
  const item = history[q.id] || { correct: 0, wrong: 0, attempts: 0, last: null };
  item.attempts += 1;
  if (isCorrect) item.correct += 1; else item.wrong += 1;
  item.last = isCorrect ? "correct" : "wrong";
  history[q.id] = item;
  saveHistory(history);

  els.result.className = `result ${isCorrect ? "ok" : "ng"}`;
  els.result.innerHTML = `<strong>${isCorrect ? "正解" : "不正解"}</strong><br>${q.explanation}`;
  renderStats();
}

function nextQuestion() {
  if (currentPool.length === 0) return;
  currentIndex = (currentIndex + 1) % currentPool.length;
  renderQuestion();
}

function renderStats() {
  const history = loadHistory();
  const records = Object.entries(history);
  const attempts = records.reduce((sum, [, v]) => sum + v.attempts, 0);
  const correct = records.reduce((sum, [, v]) => sum + v.correct, 0);
  const rate = attempts ? Math.round(correct / attempts * 100) : 0;
  els.scoreRate.textContent = `${rate}%`;
  els.scoreDetail.textContent = `${attempts}問中 ${correct}問正解`;
  els.scoreRing.style.background = `conic-gradient(var(--accent) ${rate * 3.6}deg, var(--accent-weak) 0deg)`;

  els.categoryStats.innerHTML = categories().map(cat => {
    const qs = QUESTIONS.filter(q => q.category === cat);
    const catAttempts = qs.reduce((sum, q) => sum + (history[q.id]?.attempts || 0), 0);
    const catCorrect = qs.reduce((sum, q) => sum + (history[q.id]?.correct || 0), 0);
    const catRate = catAttempts ? Math.round(catCorrect / catAttempts * 100) : 0;
    return `<div class="stat-row"><strong>${cat}</strong>${catAttempts}問 / 正答率 ${catRate}%</div>`;
  }).join("");

  const wrongQuestions = QUESTIONS.filter(q => history[q.id]?.last === "wrong");
  els.wrongList.innerHTML = wrongQuestions.length ? wrongQuestions.map(q =>
    `<div class="wrong-item"><strong>${q.category}</strong><br>${q.question}<button onclick="jumpToQuestion('${q.id}')">この問題を解く</button></div>`
  ).join("") : `<div class="wrong-item">間違いリストは空です。</div>`;
}

function jumpToQuestion(id) {
  const q = QUESTIONS.find(item => item.id === id);
  if (!q) return;
  currentPool = [q];
  currentIndex = 0;
  currentMode = "間違い復習";
  renderQuestion();
}

function resetHistory() {
  if (!confirm("学習履歴をリセットしますか？")) return;
  localStorage.removeItem(STORAGE_KEY);
  renderStats();
}

setup();
