"use strict";

const element = id => document.getElementById(id);
const number = (value, digits = 3) => Number.isFinite(value) ? value.toFixed(digits) : "Not measured";
const modelName = name => ({naive: "Last value", seasonal_naive: "Seasonal naive", boosted: "Boosted trees", prophet: "Prophet"}[name] || name);
const codeRoot = "https://github.com/biniyam44/Data-Science-Portfolio-/blob/main/";

function summaryCard(title, lines) {
  const article = document.createElement("article");
  const heading = document.createElement("h3");
  heading.textContent = title;
  article.append(heading);
  for (const line of lines) {
    const paragraph = document.createElement("p");
    paragraph.textContent = line;
    article.append(paragraph);
  }
  return article;
}

async function load(name) {
  const response = await fetch(`data/${name}.json`);
  if (!response.ok) throw new Error(`Could not load ${name}`);
  return response.json();
}

async function start() {
  const [forecast, monitoring, loadTest, analyst, holdout] = await Promise.all([
    load("service-response"), load("monitoring"), load("load-test"), load("analyst"), load("holdout")
  ]);
  const horizon = element("service-horizon");
  horizon.replaceChildren(...forecast.forecasts.map(item => {
    const option = document.createElement("option");
    option.value = item.horizon_hours;
    option.textContent = `${item.horizon_hours} hour${item.horizon_hours === 1 ? "" : "s"}`;
    return option;
  }));
  horizon.disabled = false;
  function renderForecast() {
    const row = forecast.forecasts.find(item => item.horizon_hours === Number(horizon.value));
    element("forecast-value").textContent = number(row.prediction);
    element("forecast-interval").textContent = `${number(row.lower)} to ${number(row.upper)}`;
    element("forecast-model").textContent = modelName(row.model);
    element("forecast-context").textContent = `Origin: ${forecast.origin}. Target: ${row.target_timestamp}. Training cutoff: ${forecast.training_cutoff}. All timestamps use the dataset's source clock.`;
    element("forecast-json").textContent = JSON.stringify(forecast, null, 2);
  }
  horizon.addEventListener("change", renderForecast);
  renderForecast();

  const report = monitoring.report;
  element("monitor-summary").replaceChildren(...report.performance.map(row => summaryCard(`${row.horizon_hours}-hour horizon`, [
    `MAE: ${number(row.mae)} kWh`, `Interval coverage: ${number(row.interval_coverage * 100, 1)}%`,
    `${row.observed_count} observed outcomes / ${row.forecast_count} forecasts`
  ])));
  element("monitor-json").textContent = JSON.stringify(monitoring, null, 2);
  element("load-summary").textContent = `${loadTest.successes}/${loadTest.requests} successful requests, ${loadTest.concurrency} concurrent workers. Local p50 ${number(loadTest.latency_ms.p50, 1)} ms; p95 ${number(loadTest.latency_ms.p95, 1)} ms. ${loadTest.platform}. One warm process, not production capacity.`;

  const question = element("analyst-question");
  question.replaceChildren(...analyst.examples.map((item, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = item.question;
    return option;
  }));
  question.disabled = false;
  function renderAnswer() {
    const result = analyst.examples[Number(question.value)].result;
    element("analyst-answer").textContent = result.answer;
    element("analyst-trace").textContent = `Mode: ${result.mode}. ${result.refused ? "Request declined." : "Answer calculated from saved evidence."}`;
    element("analyst-json").textContent = JSON.stringify(result, null, 2);
    element("analyst-citations").replaceChildren(...result.citations.map(citation => {
      const li = document.createElement("li");
      const path = citation.path || citation.file;
      if (typeof path === "string" && /^(results|docs)\/[A-Za-z0-9_./-]+$/.test(path) && !path.includes("..")) {
        const a = document.createElement("a");
        a.href = codeRoot + path + `#L${citation.line_start}`;
        a.textContent = `${path}, lines ${citation.line_start} to ${citation.line_end}`;
        li.append(a);
      }
      const span = document.createElement("span");
      span.textContent = ` · SHA-256 ${String(citation.sha256).slice(0, 12)}…`;
      li.append(span);
      return li;
    }));
  }
  question.addEventListener("change", renderAnswer);
  renderAnswer();
  element("analyst-evaluation").textContent = analyst.evaluation_note;
  element("holdout-summary").replaceChildren(...holdout.selected.map(row => summaryCard(`${row.horizon}-hour selection`, [
    `${modelName(row.model)}: MAE ${number(row.mae, 4)} kWh`,
    `Last value: MAE ${number(row.naive_mae, 4)} kWh`,
    `Interval coverage: ${number(row.coverage * 100, 1)}%`
  ])));
  element("page-status").textContent = "Recorded local results loaded. No live API or paid model calls are made by this page.";
}

start().catch(error => {
  element("page-status").textContent = "The recorded examples could not be loaded. Please reload, or inspect the source repository.";
  element("page-status").dataset.error = "true";
  console.error(error);
});
