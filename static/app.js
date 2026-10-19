const form = document.querySelector("#searchForm");
const input = document.querySelector("#searchInput");
const searchButton = document.querySelector("#searchButton");
const resultCount = document.querySelector("#resultCount");
const resultsHeading = document.querySelector("#resultsHeading");
const resultsList = document.querySelector("#resultsList");
const sourceStatus = document.querySelector("#sourceStatus");
const summaryPanel = document.querySelector("#summaryPanel");
const summaryText = document.querySelector("#summaryText");
const keywordList = document.querySelector("#keywordList");
const factList = document.querySelector("#factList");
const exportButton = document.querySelector("#exportButton");
const todayLabel = document.querySelector("#todayLabel");

let latestData = null;
let activeRequest = null;

todayLabel.textContent = new Intl.DateTimeFormat("es-MX", {
  weekday: "short",
  day: "numeric",
  month: "short",
}).format(new Date());

function addText(parent, tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function selectedSources() {
  return [...document.querySelectorAll('input[name="source"]:checked')].map((item) => item.value);
}

function setLoading(query) {
  resultsHeading.textContent = query;
  resultCount.textContent = "Consultando fuentes públicas…";
  searchButton.disabled = true;
  searchButton.querySelector("span:first-child").textContent = "Buscando";
  sourceStatus.hidden = true;
  summaryPanel.hidden = true;
  resultsList.replaceChildren();
  addText(resultsList, "div", "loading-state", "Buscando en las fuentes seleccionadas. Cada fuente puede tardar unos segundos.");
}

function resetButton() {
  searchButton.disabled = false;
  searchButton.querySelector("span:first-child").textContent = "Buscar";
}

function formatDate(value) {
  if (!value) return "Fecha no disponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function renderSources(sources) {
  sourceStatus.replaceChildren();
  const entries = Object.values(sources || {});
  for (const source of entries) {
    const badge = document.createElement("span");
    badge.className = `source-badge${source.status === "error" ? " error" : source.status === "setup_required" ? " setup-required" : ""}`;
    badge.textContent = source.status === "error"
      ? `${source.name}: sin respuesta`
      : source.status === "setup_required"
        ? `${source.name}: requiere configuración`
        : `${source.name}: ${source.count} resultados`;
    if (source.error) badge.title = source.error;
    sourceStatus.append(badge);
  }
  sourceStatus.hidden = entries.length === 0;
}

function renderSummary(data) {
  summaryText.textContent = data.summary || "Las fuentes respondieron, pero no incluyeron fragmentos suficientes para sintetizar el tema.";
  summaryPanel.hidden = false;
}

function renderKeywords(keywords) {
  keywordList.replaceChildren();
  if (!keywords?.length) {
    addText(keywordList, "p", "insight-placeholder", "No se detectaron conceptos repetidos.");
    return;
  }
  for (const word of keywords) {
    const button = addText(keywordList, "button", "keyword-chip", word);
    button.type = "button";
    button.title = `Ampliar búsqueda con “${word}”`;
    button.addEventListener("click", () => {
      input.value = `${input.value.trim()} ${word}`.trim();
      form.requestSubmit();
    });
  }
}

function renderFacts(facts) {
  factList.replaceChildren();
  if (!facts?.length) {
    addText(factList, "p", "insight-placeholder", "No se detectaron cifras, porcentajes o años en los fragmentos.");
    return;
  }
  for (const fact of facts) addText(factList, "div", "fact-item", fact);
}

function addYoutubeSummary(article, videoId) {
  const control = document.createElement("div");
  control.className = "video-summary-control";
  const button = addText(control, "button", "video-summary-button", "Resumir video");
  button.type = "button";
  const output = document.createElement("div");
  output.className = "video-summary-output";
  output.hidden = true;
  button.addEventListener("click", async () => {
    if (output.dataset.loaded === "true") {
      output.hidden = !output.hidden;
      button.textContent = output.hidden ? "Ver resumen" : "Ocultar resumen";
      return;
    }

    button.disabled = true;
    button.textContent = "Buscando subtítulos…";
    try {
      const response = await fetch(`/api/youtube-summary?id=${encodeURIComponent(videoId)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo resumir este video.");
      addText(output, "p", "video-summary-method", `${data.method} · subtítulos ${data.language.toUpperCase()}`);
      addText(output, "p", "video-summary-text", data.summary);
      output.dataset.loaded = "true";
      output.hidden = false;
      button.textContent = "Ocultar resumen";
    } catch (error) {
      addText(output, "p", "video-summary-error", error.message || "No se pudo obtener el resumen.");
      output.hidden = false;
      button.textContent = "Reintentar resumen";
    } finally {
      button.disabled = false;
    }
  });
  article.append(control, output);
}

function renderResult(result, index) {
  const article = document.createElement("article");
  article.className = "result-row";
  article.style.animationDelay = `${Math.min(index, 5) * 35}ms`;

  const meta = document.createElement("div");
  meta.className = "result-meta";
  addText(meta, "span", "result-source", result.source);
  addText(meta, "span", "meta-separator", "/");
  addText(meta, "span", "result-date", formatDate(result.publishedAt));
  article.append(meta);

  const title = addText(article, "a", "result-title", result.title);
  title.href = result.url;
  title.target = "_blank";
  title.rel = "noopener noreferrer";

  if (result.excerpt && result.excerpt !== result.title) {
    addText(article, "p", "result-excerpt", result.excerpt);
  }
  if (result.sourceKey === "youtube" && result.videoId) {
    addYoutubeSummary(article, result.videoId);
  }

  const footer = document.createElement("div");
  footer.className = "result-footer";
  addText(footer, "span", "result-domain", result.publisher || result.domain);
  const actions = document.createElement("div");
  actions.className = "result-actions";
  if (Number.isFinite(result.points)) addText(actions, "span", "points-label", `${result.points} puntos`);
  if (Number.isFinite(result.views)) {
    const views = new Intl.NumberFormat("es-MX", { notation: "compact", maximumFractionDigits: 1 }).format(result.views);
    addText(actions, "span", "points-label", `${views} vistas`);
  }
  const open = addText(actions, "a", "open-source", "Abrir fuente ↗");
  open.href = result.url;
  open.target = "_blank";
  open.rel = "noopener noreferrer";
  footer.append(actions);
  article.append(footer);

  const facts = result.excerpt.match(/(?:[$€£]\s?\d[\d.,]*(?:\s?(?:millones?|mil|billones?))?|\d+(?:[.,]\d+)?\s?(?:%|por ciento|millones?|mil)|\b(?:19|20)\d{2}\b)/gi) || [];
  const uniqueFacts = [...new Set(facts)].slice(0, 4);
  if (uniqueFacts.length) {
    const factRow = document.createElement("div");
    factRow.className = "result-facts";
    for (const fact of uniqueFacts) addText(factRow, "span", "result-fact", fact);
    article.append(factRow);
  }

  return article;
}

function renderResults(data) {
  renderSources(data.sources);
  renderSummary(data);
  renderKeywords(data.keywords);
  renderFacts(data.facts);
  resultsList.replaceChildren();

  const results = data.results || [];
  const succeeded = Object.values(data.sources || {}).some((source) => source.status === "ok");
  const activeCount = Object.values(data.sources || {}).filter((source) => source.status === "ok").length;
  resultCount.textContent = `${results.length} ${results.length === 1 ? "resultado" : "resultados"} · ${activeCount} fuentes activas`;

  if (!results.length) {
    const needsSetup = Object.values(data.sources || {}).some((source) => source.status === "setup_required");
    const message = succeeded
      ? "No encontramos coincidencias en las fuentes elegidas. Prueba con otros términos."
      : needsSetup
        ? "La fuente seleccionada requiere configuración local antes de buscar."
        : "Las fuentes no respondieron. Comprueba tu conexión y vuelve a intentarlo.";
    addText(resultsList, "p", `empty-state${succeeded ? "" : " error-state"}`, message);
    return;
  }
  results.forEach((result, index) => resultsList.append(renderResult(result, index)));
}

async function runSearch(event) {
  event?.preventDefault();
  const query = input.value.trim();
  const sources = selectedSources();
  if (!query || !sources.length) {
    if (!sources.length) resultCount.textContent = "Selecciona al menos una fuente";
    return;
  }

  activeRequest?.abort();
  const request = new AbortController();
  activeRequest = request;
  setLoading(query);
  latestData = null;
  exportButton.disabled = true;

  try {
    const params = new URLSearchParams({ q: query, sources: sources.join(",") });
    const response = await fetch(`/api/search?${params}`, { signal: request.signal });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudo completar la búsqueda.");
    latestData = data;
    renderResults(data);
    exportButton.disabled = false;
  } catch (error) {
    if (error.name === "AbortError") return;
    resultsList.replaceChildren();
    addText(resultsList, "p", "empty-state error-state", error.message || "No fue posible completar la búsqueda.");
    resultCount.textContent = "Búsqueda no disponible";
    sourceStatus.hidden = true;
    summaryPanel.hidden = true;
  } finally {
    if (activeRequest === request) {
      if (!request.signal.aborted) resetButton();
      activeRequest = null;
    }
  }
}

form.addEventListener("submit", runSearch);

document.querySelectorAll("[data-query]").forEach((button) => {
  button.addEventListener("click", () => {
    input.value = button.dataset.query;
    form.requestSubmit();
  });
});

exportButton.addEventListener("click", () => {
  if (!latestData) return;
  const blob = new Blob([JSON.stringify(latestData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ojo-de-dios-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
});