const STORAGE_ANSWERS = "love_q_submissions_v1";
const STORAGE_DRAFT = "love_q_draft_v1";
const STORAGE_SETTINGS = "love_q_settings_v1";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const state = {
  view: "home",
  sectionIndex: 0,
  answers: {},
  respondent: "",
  lastSaved: null
};

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2400);
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function submissions() {
  return loadJSON(STORAGE_ANSWERS, []);
}

function settings() {
  return loadJSON(STORAGE_SETTINGS, { owner: "", repo: "", token: "", path: "answers" });
}

function showView(name) {
  state.view = name;
  ["home", "form", "history", "settings", "result"].forEach((v) => {
    const el = document.getElementById(`view-${v}`);
    if (el) el.classList.toggle("hidden", v !== name);
  });
  if (name === "home") refreshHome();
  if (name === "history") renderHistory();
  if (name === "settings") fillSettings();
}

function refreshHome() {
  const list = submissions();
  const draft = loadJSON(STORAGE_DRAFT, null);
  $("#home-stat").textContent = list.length
    ? `已有 ${list.length} 次提交` + (draft ? " · 仲有未完成草稿" : "")
    : draft
      ? "有一份未完成草稿"
      : "尚未提交過答案";
  $("#resume-btn").style.display = draft ? "" : "none";
}

function allQuestions() {
  return QUESTIONNAIRE.sections.flatMap((s) => s.questions);
}

function collectCurrentSection() {
  const section = QUESTIONNAIRE.sections[state.sectionIndex];
  section.questions.forEach((q) => {
    if (q.type === "checkbox") {
      const picked = $$(`input[name="q${q.id}"]:checked`).map((i) => i.value);
      const otherOn = $(`#q${q.id}-other-on`);
      const otherVal = ($(`#q${q.id}-other`)?.value || "").trim();
      if (otherOn?.checked && otherVal) picked.push(`其他：${otherVal}`);
      state.answers[q.id] = picked;
    } else {
      state.answers[q.id] = ($(`#q${q.id}`)?.value || "").trim();
    }
  });
  state.respondent = ($("#respondent")?.value || "").trim();
}

function validateSection() {
  const section = QUESTIONNAIRE.sections[state.sectionIndex];
  for (const q of section.questions) {
    if (!q.required) continue;
    const val = state.answers[q.id];
    const empty = Array.isArray(val) ? val.length === 0 : !val;
    if (empty) {
      toast(`第 ${q.id} 題未填`);
      const el = document.getElementById(`q${q.id}`) || document.querySelector(`input[name="q${q.id}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
  }
  return true;
}

function saveDraft() {
  collectCurrentSection();
  saveJSON(STORAGE_DRAFT, {
    sectionIndex: state.sectionIndex,
    answers: state.answers,
    respondent: state.respondent,
    updatedAt: new Date().toISOString()
  });
}

function renderForm() {
  const sections = QUESTIONNAIRE.sections;
  const section = sections[state.sectionIndex];
  const totalQ = allQuestions().length;
  const doneBefore = sections.slice(0, state.sectionIndex).reduce((n, s) => n + s.questions.length, 0);
  const pct = Math.round((doneBefore / totalQ) * 100);

  $("#section-label").textContent = `第 ${state.sectionIndex + 1} / ${sections.length} 部分`;
  $("#progress-text").textContent = `${doneBefore} / ${totalQ} 題`;
  $("#progress-bar").style.width = `${pct}%`;
  $("#section-title").textContent = section.title;
  $("#section-hint").textContent = section.hint || "";

  const respondent = $("#respondent");
  if (respondent) respondent.value = state.respondent || "";
  respondent?.closest(".field")?.classList.toggle("hidden", state.sectionIndex !== 0);

  $("#questions").innerHTML = section.questions.map((q) => renderQuestion(q)).join("");
  $("#prev-btn").disabled = state.sectionIndex === 0;
  $("#next-btn").textContent = state.sectionIndex === sections.length - 1 ? "提交" : "下一頁";
}

function renderQuestion(q) {
  const star = q.required ? `<span class="req">*</span>` : "";
  if (q.type === "checkbox") {
    const selected = new Set(state.answers[q.id] || []);
    const otherEntry = [...selected].find((x) => String(x).startsWith("其他："));
    const otherText = otherEntry ? otherEntry.replace(/^其他：/, "") : "";
    const options = q.options.map((opt) => `
      <label class="check">
        <input type="checkbox" name="q${q.id}" value="${escapeHtml(opt)}" ${selected.has(opt) ? "checked" : ""} />
        <span>${escapeHtml(opt)}</span>
      </label>`).join("");
    const other = q.allowOther ? `
      <label class="check other-row">
        <input type="checkbox" id="q${q.id}-other-on" ${otherEntry ? "checked" : ""} />
        <span>其他：</span>
        <input type="text" id="q${q.id}-other" value="${escapeHtml(otherText)}" placeholder="自己寫" />
      </label>` : "";
    return `<article class="q-card"><div class="q-label">${q.id}. ${escapeHtml(q.label)}${star}</div><div class="checks">${options}${other}</div></article>`;
  }
  const val = escapeHtml(state.answers[q.id] || "");
  return `<article class="q-card"><div class="q-label">${q.id}. ${escapeHtml(q.label)}${star}</div>
    <textarea id="q${q.id}" rows="3" placeholder="寫而家嘅答案…">${val}</textarea></article>`;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatAnswer(q, value) {
  if (Array.isArray(value)) return value.length ? value.join("、") : "（未填）";
  return value || "（未填）";
}

async function submitForm() {
  collectCurrentSection();
  if (!validateSection()) return;

  const payload = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    respondent: state.respondent || "",
    title: QUESTIONNAIRE.title,
    answers: allQuestions().map((q) => ({
      id: q.id,
      question: q.label,
      type: q.type,
      answer: state.answers[q.id] ?? ""
    }))
  };

  const list = submissions();
  list.unshift(payload);
  saveJSON(STORAGE_ANSWERS, list);
  localStorage.removeItem(STORAGE_DRAFT);
  state.lastSaved = payload;

  let ghNote = "";
  const s = settings();
  if (s.token && s.owner && s.repo) {
    try {
      await pushToGitHub(payload, s);
      ghNote = "已同步到 GitHub。";
    } catch (err) {
      console.error(err);
      ghNote = `本機已存，但 GitHub 同步失敗：${err.message}`;
    }
  }

  $("#result-meta").textContent = `${new Date(payload.createdAt).toLocaleString()} ${payload.respondent ? "· " + payload.respondent : ""} ${ghNote}`;
  $("#result-body").innerHTML = payload.answers.map((a) => `
    <div class="answer-block card" style="padding:16px;margin:12px 0">
      <h3>${a.id}. ${escapeHtml(a.question)}</h3>
      <p>${escapeHtml(formatAnswer({ type: a.type }, a.answer))}</p>
    </div>`).join("");
  showView("result");
  toast("已儲存今次答案");
}

function githubHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28"
  };
}

function toBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

async function pushToGitHub(payload, s) {
  const stamp = payload.createdAt.replace(/[:.]/g, "-");
  const who = payload.respondent ? `-${payload.respondent.replace(/[^\w\u4e00-\u9fff-]+/g, "_")}` : "";
  const path = `${(s.path || "answers").replace(/\/$/, "")}/${stamp}${who}.json`;
  const url = `https://api.github.com/repos/${s.owner}/${s.repo}/contents/${path}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { ...githubHeaders(s.token), "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Add questionnaire ${stamp}`,
      content: toBase64(JSON.stringify(payload, null, 2))
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text.slice(0, 180) || res.statusText);
  }
  return res.json();
}

async function testGitHub() {
  const s = readSettingsForm();
  if (!s.owner || !s.repo || !s.token) {
    toast("請先填用戶名、repo 同 token");
    return;
  }
  const res = await fetch(`https://api.github.com/repos/${s.owner}/${s.repo}`, {
    headers: githubHeaders(s.token)
  });
  if (res.ok) toast("連線成功，可以同步。");
  else toast("連線失敗，請檢查 token / repo 權限。");
}

function readSettingsForm() {
  return {
    owner: $("#gh-owner").value.trim(),
    repo: $("#gh-repo").value.trim(),
    token: $("#gh-token").value.trim(),
    path: $("#gh-path").value.trim() || "answers"
  };
}

function fillSettings() {
  const s = settings();
  $("#gh-owner").value = s.owner || "";
  $("#gh-repo").value = s.repo || "";
  $("#gh-token").value = s.token || "";
  $("#gh-path").value = s.path || "answers";
}

function renderHistory() {
  const list = submissions();
  const box = $("#history-list");
  if (!list.length) {
    box.innerHTML = `<p class="muted">未有提交紀錄。</p>`;
    return;
  }
  box.innerHTML = list.map((item) => `
    <div class="history-item">
      <div>
        <b>${new Date(item.createdAt).toLocaleString()}</b>
        <span class="muted">${escapeHtml(item.respondent || "未留名")} · ${item.answers.length} 題</span>
      </div>
      <div>
        <button class="btn" data-open="${item.id}">打開</button>
        <button class="btn" data-del="${item.id}">刪除</button>
      </div>
    </div>`).join("");
}

function openSubmission(id) {
  const item = submissions().find((x) => x.id === id);
  if (!item) return;
  state.lastSaved = item;
  $("#result-meta").textContent = `${new Date(item.createdAt).toLocaleString()} ${item.respondent ? "· " + item.respondent : ""}`;
  $("#result-body").innerHTML = item.answers.map((a) => `
    <div class="answer-block card" style="padding:16px;margin:12px 0">
      <h3>${a.id}. ${escapeHtml(a.question)}</h3>
      <p>${escapeHtml(formatAnswer({ type: a.type }, a.answer))}</p>
    </div>`).join("");
  showView("result");
}

function downloadCurrent() {
  const item = state.lastSaved;
  if (!item) return;
  const blob = new Blob([JSON.stringify(item, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `questionnaire-${item.createdAt.slice(0, 19).replace(/[:T]/g, "-")}.json`;
  a.click();
}

function startFresh() {
  state.sectionIndex = 0;
  state.answers = {};
  state.respondent = "";
  localStorage.removeItem(STORAGE_DRAFT);
  showView("form");
  renderForm();
}

function resumeDraft() {
  const draft = loadJSON(STORAGE_DRAFT, null);
  if (!draft) {
    startFresh();
    return;
  }
  state.sectionIndex = draft.sectionIndex || 0;
  state.answers = draft.answers || {};
  state.respondent = draft.respondent || "";
  showView("form");
  renderForm();
}

document.addEventListener("click", (e) => {
  const view = e.target.closest("[data-view]")?.dataset.view;
  if (view) showView(view);

  if (e.target.id === "start-btn") startFresh();
  if (e.target.id === "resume-btn") resumeDraft();
  if (e.target.id === "prev-btn") {
    collectCurrentSection();
    saveDraft();
    state.sectionIndex = Math.max(0, state.sectionIndex - 1);
    renderForm();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  if (e.target.id === "next-btn") {
    collectCurrentSection();
    if (!validateSection()) return;
    saveDraft();
    if (state.sectionIndex >= QUESTIONNAIRE.sections.length - 1) {
      submitForm();
    } else {
      state.sectionIndex += 1;
      renderForm();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  if (e.target.id === "save-draft-btn") {
    saveDraft();
    toast("已暫存呢部裝置");
  }
  if (e.target.id === "save-settings") {
    saveJSON(STORAGE_SETTINGS, readSettingsForm());
    toast("設定已儲存");
  }
  if (e.target.id === "test-github") testGitHub();
  if (e.target.id === "download-btn") downloadCurrent();
  if (e.target.id === "export-all") {
    const blob = new Blob([JSON.stringify(submissions(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "questionnaire-all.json";
    a.click();
  }
  if (e.target.id === "clear-draft") {
    localStorage.removeItem(STORAGE_DRAFT);
    toast("草稿已清");
    refreshHome();
  }
  if (e.target.dataset.open) openSubmission(e.target.dataset.open);
  if (e.target.dataset.del) {
    const next = submissions().filter((x) => x.id !== e.target.dataset.del);
    saveJSON(STORAGE_ANSWERS, next);
    renderHistory();
    toast("已刪本機呢份紀錄");
  }
});

$("#import-file")?.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const incoming = Array.isArray(data) ? data : [data];
    const list = submissions();
    const ids = new Set(list.map((x) => x.id));
    incoming.forEach((item) => {
      if (item && item.id && item.answers && !ids.has(item.id)) list.unshift(item);
    });
    saveJSON(STORAGE_ANSWERS, list);
    toast("已匯入");
    renderHistory();
  } catch {
    toast("匯入失敗，檔案格式唔啱");
  }
  e.target.value = "";
});

refreshHome();
showView("home");
