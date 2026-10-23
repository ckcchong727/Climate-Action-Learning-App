// ================= Data =================
const PAGES = [
  ["🌍", "What is SDG 13?", "SDG 13 is the United Nations Sustainable Development Goal, focusing on taking urgent action to combat climate change and its impacts."],
  ["🌡️", "What is Climate Change?", "Climate change refers to long-term changes in temperature, weather patterns and environmental conditions."],
  ["🏭", "Causes of Climate Change", "Major causes of climate change include pollution, deforestation, industrial activities, excessive use of fossil fuels and greenhouse gas emissions."],
  ["🌊", "Effects of Climate Change", "Climate change causes rising sea levels, more frequent natural disasters and impacts on biodiversity and human health."],
  ["🔥", "Heatwaves Around the World", "Extreme heatwaves are becoming more common because of climate change. High temperatures can affect health, agriculture, and daily life."],
  ["♻️", "Sustainable Living", "Sustainable living means using resources wisely, reducing waste, and making environmentally friendly choices in daily life."],
  ["☀️", "Renewable Energy", "Renewable energy sources like solar, wind and hydro power are clean alternatives to fossil fuels and help reduce greenhouse gas emissions."],
  ["🛰️", "How Technology Helps", "Scientists use satellites, artificial intelligence, and climate sensors to monitor weather changes and predict natural disasters earlier."],
  ["📅", "International Day of Climate Action", "International Day of Climate Action is observed on October 24th every year to raise awareness and encourage action against climate change."],
  ["🌱", "Be the Change", "Every small action matters. By caring for the environment and encouraging others, everyone can help build a greener future."]
];

const TF = ["True", "False", "", ""];
// [question, options, index of correct option]
const QS = [
  ["What does SDG stand for?", ["Smart Digital Goal", "Sustainable Development Goals", "Save Development Goal", "System Development Goal"], 1],
  ["Climate change mainly affects:", ["Environment", "Weather", "Humans", "All of the above"], 3],
  ["Which gas contributes most to global warming?", ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], 2],
  ["Which energy source is renewable?", ["Coal", "Petrol", "Solar", "Diesel"], 2],
  ["Trees help reduce climate change.", TF, 0],
  ["What should we reduce to help Earth?", ["Plastic waste", "Trees", "Clean water", "Education"], 0],
  ["Which SDG number is Climate Action?", ["10", "11", "12", "13"], 3],
  ["Global warming causes:", ["Sea level rise", "Cooler weather", "Less pollution", "None"], 0],
  ["Saving electricity helps the environment.", TF, 0],
  ["Which item can be recycled?", ["Paper", "Plastic bottle", "Glass", "All of the above"], 3],
  ["Deforestation means:", ["Planting trees", "Cutting down forests", "Saving animals", "Cleaning rivers"], 1],
  ["Climate action is important for future generations.", TF, 0],
  ["Which transport reduces pollution?", ["Bicycle", "Walking", "Electric car", "All of the above"], 3],
  ["Fossil fuels include:", ["Coal", "Oil", "Natural Gas", "All of the above"], 3],
  ["Water should be conserved.", TF, 0],
  ["Which activity causes pollution?", ["Burning plastic", "Planting trees", "Recycling", "Saving water"], 0],
  ["Renewable energy is cleaner.", TF, 0],
  ["Which action helps reduce waste?", ["Reuse items", "Throw everything away", "Burn trash", "Waste water"], 0],
  ["Climate change can increase natural disasters.", TF, 0],
  ["What can students do to help Earth?", ["Save energy", "Recycle", "Plant trees", "All of the above"], 3]
];

const MAX_HEARTS = 5;
const PRAISE = ["Nicely done!", "Great job!", "Awesome!", "Correct!", "You’re on fire!"];

// ================= Storage (leaderboard) =================
const KEY = "sdg13-leaderboard";
const SEED = [
  "28.05.2026 23.42.18 | janie | Score: 20 | Points: 200 | Badge: Outstanding | Time taken: 108s",
  "02.06.2026 15.23.17 | 102997 | Score: 13 | Points: 130 | Badge: Excellent | Time taken: 64s"
];
function loadScores() {
  try { const v = localStorage.getItem(KEY); if (v) return JSON.parse(v); } catch (e) {}
  return SEED.slice();
}
function writeFile(line) {
  const all = loadScores(); all.push(line);
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) {}
}

// ================= Reward manager =================
const Reward = {
  start: 0, end: 0,
  startTimer() { this.start = Date.now(); },
  stopTimer() { this.end = Date.now(); },
  seconds() { return Math.floor((this.end - this.start) / 1000); },
  badge(p) {
    return p >= 180 ? "Outstanding" : p >= 120 ? "Excellent" : p >= 80 ? "Good try"
         : p >= 40 ? "You can do better" : "Don’t give up, try again!";
  },
  save(user, score, badge, points) {
    const d = new Date(), z = n => String(n).padStart(2, "0");
    const ts = `${z(d.getDate())}.${z(d.getMonth() + 1)}.${d.getFullYear()} ${z(d.getHours())}.${z(d.getMinutes())}.${z(d.getSeconds())}`;
    writeFile(`${ts} | ${user} | Score: ${score} | Points: ${points} | Badge: ${badge} | Time taken: ${this.seconds()}s`);
  }
};

// ================= Helpers =================
const app = document.getElementById("app");
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const S = { user: null, page: 0, q: 0, score: 0, hearts: MAX_HEARTS, streak: 0, pick: null, checked: false };

// Custom dialog. alert()/confirm() are silently blocked inside embedded pages,
// which is why "Exit" appeared to do nothing before. This works everywhere.
function dialog(message, okText, cancelText) {
  return new Promise(resolve => {
    const m = document.createElement("div");
    m.className = "modal";
    m.innerHTML = `<div class="dlg" role="dialog" aria-modal="true">
      <p>${esc(message)}</p>
      <div class="stack">
        <button class="btn" data-v="1">${esc(okText || "OK")}</button>
        ${cancelText ? `<button class="btn ghost" data-v="0">${esc(cancelText)}</button>` : ""}
      </div></div>`;
    m.addEventListener("click", e => {
      const v = e.target.dataset && e.target.dataset.v;
      if (v !== undefined) { m.remove(); resolve(v === "1"); }
    });
    app.appendChild(m);
    m.querySelector("button").focus();
  });
}

// ================= Screens =================
function welcome() {
  app.innerHTML = `
    <div class="mascot" aria-hidden="true">🌍</div>
    <div class="center stack"><h1>SDG 13:<br>Climate Action</h1><p class="mute">Learn • Quiz • Save Earth</p></div>
    <div class="grow"></div>
    <div class="stack"><button class="btn" id="a">Get started</button><button class="btn ghost" id="b">Exit</button></div>`;
  $("a").onclick = login;
  $("b").onclick = async () => { if (await dialog("Exit application?", "Exit", "Stay")) { S.user = null; welcome(); } };
}

function login() {
  app.innerHTML = `
    <div class="top"><button class="x" id="b" aria-label="Back">✕</button></div>
    <h2>What’s your name?</h2>
    <p class="mute">Your results will appear on the leaderboard under this name.</p>
    <input type="text" id="u" maxlength="24" placeholder="Username" autocomplete="off" value="${esc(S.user ? S.user.username : "")}">
    <div class="grow"></div>
    <button class="btn" id="a">Login</button>`;
  const go = async () => {
    const v = $("u").value.trim();
    if (!v) { await dialog("Username cannot be empty!", "OK"); $("u").focus(); return; }
    S.user = { username: v, score: 0, points: 0, badge: "None" };
    menu();
  };
  $("a").onclick = go;
  $("u").onkeydown = e => { if (e.key === "Enter") go(); };
  $("b").onclick = welcome;
  $("u").focus();
}

function menu() {
  app.innerHTML = `
    <h2 class="center">Main Menu</h2>
    <p class="center mute">Hi ${esc(S.user.username)}! What would you like to do?</p>
    <div class="stack grow" style="justify-content:center">
      <button class="btn menu-btn" id="a"><span>📖</span>Learning Module</button>
      <button class="btn blue menu-btn" id="b"><span>📝</span>Quiz Module</button>
      <button class="btn ghost menu-btn" id="c"><span>🏆</span>Rewards</button>
      <button class="btn ghost menu-btn" id="d"><span>🚪</span>Exit</button>
    </div>`;
  $("a").onclick = () => { S.page = 0; learn(); };
  $("b").onclick = startQuiz;
  $("c").onclick = board;
  $("d").onclick = async () => { if (await dialog("Exit application?", "Exit", "Stay")) { S.user = null; welcome(); } };
}

function learn() {
  const [ico, title, text] = PAGES[S.page], last = PAGES.length - 1;
  app.innerHTML = `
    <div class="top">
      <button class="x" id="m" aria-label="Back to menu">✕</button>
      <div class="bar"><b style="width:${(S.page + 1) / PAGES.length * 100}%"></b></div>
      <span class="mute">${S.page + 1}/${PAGES.length}</span>
    </div>
    <div class="panel grow"><div class="ico" aria-hidden="true">${ico}</div><h2>${title}</h2><p>${text}</p></div>
    <div class="row">
      <button class="btn ghost" id="p" ${S.page === 0 ? "disabled" : ""}>Previous</button>
      <button class="btn" id="n">${S.page === last ? "Finish" : "Next"}</button>
    </div>`;
  $("m").onclick = menu;
  $("p").onclick = () => { S.page--; learn(); };
  $("n").onclick = () => { if (S.page === last) menu(); else { S.page++; learn(); } };
}

function startQuiz() {
  Object.assign(S, { q: 0, score: 0, hearts: MAX_HEARTS, streak: 0, pick: null, checked: false });
  Reward.startTimer();
  quiz();
}

function quiz() {
  const [question, opts, correct] = QS[S.q];
  const right = S.checked && S.pick === correct;
  const letters = ["A", "B", "C", "D"];

  const optHtml = opts.map((o, i) => {
    if (!o) return "";
    let cls = "opt";
    if (S.checked) { if (i === correct) cls += " right"; else if (i === S.pick) cls += " wrong"; }
    else if (i === S.pick) cls += " sel";
    return `<button class="${cls}" data-i="${i}" ${S.checked ? "disabled" : ""}><i>${letters[i]}</i>${esc(o)}</button>`;
  }).join("");

  let footer;
  if (!S.checked) {
    footer = `<div class="stack"><button class="btn" id="chk" ${S.pick === null ? "disabled" : ""}>Check</button></div>`;
  } else {
    const praise = PRAISE[Math.floor(Math.random() * PRAISE.length)];
    const streakTxt = right && S.streak >= 3 ? `<small>🔥 ${S.streak} in a row!</small>` : "";
    footer = `<div class="foot ${right ? "right" : "wrong"}">
      <div class="fb">${right ? "✅ " + praise + streakTxt : "❌ Correct answer:<small>" + esc(opts[correct]) + "</small>"}</div>
      <button class="btn ${right ? "" : "red"}" id="cont">Continue</button></div>`;
  }

  app.innerHTML = `
    <div class="top">
      <button class="x" id="x" aria-label="Exit quiz">✕</button>
      <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${QS.length}" aria-valuenow="${S.q}"><b style="width:${(S.q + (S.checked ? 1 : 0)) / QS.length * 100}%"></b></div>
      <span class="hearts" aria-label="${S.hearts} hearts left">❤️ ${S.hearts}</span>
    </div>
    <p class="q">${esc(question)}</p>
    <div class="stack grow">${optHtml}</div>
    ${S.checked ? "" : footer}${S.checked ? footer : ""}`;

  $("x").onclick = async () => {
    if (await dialog("Exit quiz? Your progress will NOT be saved.", "Keep going", "Exit quiz")) return;
    Reward.stopTimer(); menu();
  };
  app.querySelectorAll(".opt").forEach(b => b.onclick = () => { if (S.checked) return; S.pick = +b.dataset.i; quiz(); });

  if (!S.checked) {
    $("chk").onclick = () => {
      S.checked = true;
      if (S.pick === correct) { S.score++; S.streak++; } else { S.hearts--; S.streak = 0; }
      quiz();
    };
  } else {
    $("cont").onclick = () => {
      S.q++; S.pick = null; S.checked = false;
      if (S.q >= QS.length || S.hearts <= 0) result(S.hearts <= 0 && S.q < QS.length);
      else quiz();
    };
  }
}

function result(outOfHearts) {
  Reward.stopTimer();
  const total = QS.length, pct = Math.floor(S.score * 100 / total), pts = S.score * 10;
  const msg = outOfHearts ? "Out of hearts! Review the lessons and try again."
    : pct >= 80 ? "Outstanding! Let’s save Earth!"
    : pct >= 60 ? "That’s good! Climate Hero!"
    : pct >= 40 ? "Good try!"
    : pct >= 20 ? "You can do better!"
    : "Don’t give up!";

  const u = S.user;
  u.score = S.score; u.points += pts; u.badge = Reward.badge(pts);
  Reward.save(u.username, S.score, u.badge, u.points);

  app.innerHTML = `
    <div class="mascot" style="margin-top:8px" aria-hidden="true">${outOfHearts ? "💔" : pct >= 60 ? "🎉" : "🌱"}</div>
    <h2 class="center">${outOfHearts ? "Quiz ended" : "Quiz Completed!"}</h2>
    <div class="score">${S.score}<span class="mute" style="font-size:28px"> / ${total}</span></div>
    <div class="stats"><span class="chip">⚡ ${pts} XP</span><span class="chip">🎯 ${pct}%</span><span class="chip">⏱ ${Reward.seconds()}s</span></div>
    <div class="badge">${esc(u.badge)}</div>
    <p class="center">${msg}</p>
    <div class="grow"></div>
    <div class="stack">
      <button class="btn" id="a">View leaderboard</button>
      <button class="btn ghost" id="b">Try again</button>
      <button class="btn ghost" id="c">Back to menu</button>
    </div>`;
  $("a").onclick = board; $("b").onclick = startQuiz; $("c").onclick = menu;
}

function board() {
  const rows = loadScores().slice().reverse().map(line => {
    const p = line.split(" | ");
    if (p.length < 6) return `<div class="rec"><span>${esc(line)}</span></div>`;
    return `<div class="rec">
      <div class="n"><span>${esc(p[1])}</span><span>${esc(p[3].replace("Points: ", ""))} XP</span></div>
      <small>${esc(p[2])} · ${esc(p[4].replace("Badge: ", ""))} · ${esc(p[5].replace("Time taken: ", ""))}</small>
      <small>${esc(p[0])}</small></div>`;
  }).join("");

  app.innerHTML = `
    <h2 class="center">Rewards &amp; Achievements</h2>
    <div class="stack list grow">${rows || '<p class="mute center">No records yet. Finish a quiz and your result will show up here.</p>'}</div>
    <button class="btn" id="a">${S.user ? "Back to menu" : "Back"}</button>`;
  $("a").onclick = () => S.user ? menu() : welcome();
}

welcome();
