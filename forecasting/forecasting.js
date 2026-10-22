'use strict';

(() => {
  const modelLabels = {
    naive: 'Last value',
    drift: 'Drift',
    seasonal_naive: 'Seasonal naive',
    arima: 'ARIMA',
    prophet: 'Prophet',
    boosted: 'Gradient-boosted trees'
  };
  const datasetFiles = { crypto: 'data/crypto.json', energy: 'data/energy.json' };
  const elements = Object.fromEntries([
    'dataset-select', 'horizon-select', 'model-select', 'data-status', 'results',
    'dataset-period', 'dataset-title', 'dataset-description', 'selection-label',
    'metric-mae', 'metric-rmse', 'metric-unit', 'metric-coverage', 'interval-target',
    'forecast-chart', 'chart-caption', 'comparison-caption', 'comparison-body',
    'errors-body', 'points-body', 'source-credit', 'test-period', 'dataset-limitations',
    'download-predictions', 'download-metrics', 'download-summary', 'run-metadata'
  ].map(id => [id, document.getElementById(id)]));
  const cache = new Map();
  const formatter = new Intl.NumberFormat('en', { maximumFractionDigits: 2 });
  const smallNumberFormatter = new Intl.NumberFormat('en', { maximumFractionDigits: 3 });
  const integerFormatter = new Intl.NumberFormat('en', { maximumFractionDigits: 0 });
  const dateFormatter = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const axisDateFormatter = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  const dateTimeFormatter = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'UTC' });
  const axisDateTimeFormatter = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'UTC' });
  let currentData;
  let requestVersion = 0;

  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const number = value => finite(value) ? (Math.abs(value) < 1 ? smallNumberFormatter : formatter).format(value) : 'Not available';
  const percent = value => finite(value) ? `${formatter.format(value * 100)}%` : 'Not available';
  const label = model => modelLabels[model] || model;
  const period = data => /^(h|1h|hour|hourly)$/i.test(data?.frequency || '')
    ? { singular: 'hour', plural: 'hours', adjective: 'hourly' }
    : { singular: 'day', plural: 'days', adjective: 'daily' };
  const parseTimestamp = value => {
    if (typeof value !== 'string') return NaN;
    // Preserve timezone-naive source clock labels across visitors' timezones.
    // UTC is only a rendering coordinate here, not a claim about the source timezone.
    const normalized = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(value)
      ? `${value.replace(' ', 'T')}Z` : value;
    return Date.parse(normalized);
  };
  const date = value => {
    const timestamp = parseTimestamp(value);
    const dateFormat = period(currentData).singular === 'hour' ? dateTimeFormatter : dateFormatter;
    return Number.isFinite(timestamp) ? dateFormat.format(new Date(timestamp)) : 'Date unavailable';
  };
  const textNode = (tag, text, className) => {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  const safeSourceUrl = value => {
    try {
      const url = new URL(value);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  };
  const svgNode = (tag, attributes, text) => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
    if (text !== undefined) element.textContent = text;
    return element;
  };

  function validateData(data) {
    if (data.schema_version !== 1 || !Array.isArray(data.horizons) || !data.horizons.length ||
        !Array.isArray(data.metrics) || !Array.isArray(data.predictions)) {
      throw new Error('The results file does not match the supported schema.');
    }
    const testMetrics = data.metrics.filter(row => row.phase === 'test');
    const testPredictions = data.predictions.filter(row => row.phase === 'test');
    if (!testMetrics.length || !testPredictions.length) throw new Error('No final-test results were recorded.');
    if (testPredictions.some(row => !finite(row.actual) || !finite(row.prediction) ||
        !Number.isFinite(parseTimestamp(row.timestamp)) || !Number.isFinite(parseTimestamp(row.origin)))) {
      throw new Error('The forecast values or dates could not be read.');
    }
    for (const horizon of data.horizons) {
      if (!Number.isInteger(horizon) || horizon < 1) throw new Error('A forecast horizon is invalid.');
      for (const model of Object.keys(modelLabels)) {
        const metrics = testMetrics.filter(row => row.model === model && row.horizon === horizon);
        const predictions = testPredictions.filter(row => row.model === model && row.horizon === horizon);
        if (metrics.length !== 1 || !predictions.length || metrics[0].n !== predictions.length) {
          throw new Error(`The recorded results are incomplete for ${label(model)} at horizon ${horizon}.`);
        }
      }
    }
    return data;
  }

  function fillOptions(select, options, value) {
    select.replaceChildren(...options.map(([optionValue, optionLabel]) => {
      const option = textNode('option', optionLabel);
      option.value = String(optionValue);
      return option;
    }));
    if (options.some(([optionValue]) => String(optionValue) === String(value))) select.value = String(value);
  }

  async function loadDataset() {
    const version = ++requestVersion;
    const dataset = elements['dataset-select'].value;
    elements.results.hidden = true;
    elements['horizon-select'].disabled = true;
    elements['model-select'].disabled = true;
    elements['data-status'].hidden = false;
    elements['data-status'].classList.remove('sr-only');
    elements['data-status'].dataset.error = 'false';
    elements['data-status'].textContent = 'Loading the recorded results.';
    try {
      if (!cache.has(dataset)) {
        const response = await fetch(datasetFiles[dataset]);
        if (!response.ok) throw new Error(`The results file returned HTTP ${response.status}.`);
        cache.set(dataset, validateData(await response.json()));
      }
      if (version !== requestVersion) return;
      currentData = cache.get(dataset);
      const timePeriod = period(currentData);
      fillOptions(elements['horizon-select'], currentData.horizons.map(horizon => [horizon, `${horizon} ${horizon === 1 ? timePeriod.singular : timePeriod.plural} ahead`]), currentData.horizons[0]);
      chooseValidationModel();
      elements['horizon-select'].disabled = false;
      elements['model-select'].disabled = false;
      render();
      elements.results.hidden = false;
    } catch (error) {
      if (version !== requestVersion) return;
      currentData = undefined;
      elements['data-status'].classList.remove('sr-only');
      elements['data-status'].dataset.error = 'true';
      elements['data-status'].textContent = location.protocol === 'file:'
        ? 'The results cannot be loaded directly from a local file. Serve this folder through a local HTTP server, or use the recorded files in the source repository.'
        : `The recorded results are unavailable. ${error.message} The source repository remains available; no example numbers are substituted here.`;
    }
  }

  function chooseValidationModel() {
    const horizon = Number(elements['horizon-select'].value);
    const selected = currentData.selected_models?.[String(horizon)];
    fillOptions(elements['model-select'], Object.keys(modelLabels).map(model => [model, `${label(model)}${model === selected ? ' · validation choice' : ''}`]), selected || 'naive');
  }

  function renderChart(rows, model, horizon, unit, intervalLevel) {
    const chart = elements['forecast-chart'];
    const timePeriod = period(currentData);
    chart.replaceChildren(
      svgNode('title', { id: 'chart-title' }, `${label(model)}, ${horizon}-${timePeriod.singular} forecast, held-out test observations`),
      svgNode('desc', { id: 'chart-description' }, `${rows.length} forecasts from ${date(rows[0].timestamp)} to ${date(rows.at(-1).timestamp)}. Solid green is observed ${unit}; dashed brown is the forecast. The shaded band is the ${percent(intervalLevel)} empirical prediction interval. Every plotted value is also available in the table below.`)
    );
    const bounds = { left: 80, right: 930, top: 25, bottom: 310 };
    const timestamps = rows.map(row => parseTimestamp(row.timestamp));
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const values = rows.flatMap(row => [row.actual, row.prediction, row.lower, row.upper].filter(finite));
    let minValue = Math.min(...values);
    let maxValue = Math.max(...values);
    const padding = Math.max((maxValue - minValue) * .08, Math.abs(maxValue) * .015, .01);
    minValue -= padding;
    maxValue += padding;
    const x = timestamp => minTime === maxTime ? (bounds.left + bounds.right) / 2 : bounds.left + (timestamp - minTime) / (maxTime - minTime) * (bounds.right - bounds.left);
    const y = value => bounds.bottom - (value - minValue) / (maxValue - minValue) * (bounds.bottom - bounds.top);
    const axisNumberFormatter = new Intl.NumberFormat('en', { maximumFractionDigits: maxValue - minValue < 1 ? 3 : maxValue - minValue < 10 ? 2 : 0 });
    for (let tick = 0; tick <= 4; tick++) {
      const value = minValue + (maxValue - minValue) * tick / 4;
      chart.append(svgNode('line', { x1: bounds.left, x2: bounds.right, y1: y(value), y2: y(value), class: 'chart-grid' }));
      chart.append(svgNode('text', { x: bounds.left - 13, y: y(value) + 4, 'text-anchor': 'end', class: 'chart-axis-label' }, axisNumberFormatter.format(value)));
    }
    const indexes = [...new Set([0, Math.floor((rows.length - 1) / 3), Math.floor((rows.length - 1) * 2 / 3), rows.length - 1])];
    const axisFormat = timePeriod.singular === 'hour' ? axisDateTimeFormatter : axisDateFormatter;
    indexes.forEach(index => chart.append(svgNode('text', { x: x(timestamps[index]), y: bounds.bottom + 27, 'text-anchor': index === 0 ? 'start' : index === rows.length - 1 ? 'end' : 'middle', class: 'chart-axis-label' }, axisFormat.format(new Date(timestamps[index])))));
    const intervalsComplete = rows.every(row => finite(row.lower) && finite(row.upper));
    if (intervalsComplete) {
      const upper = rows.map((row, index) => `${x(timestamps[index])},${y(row.upper)}`);
      const lower = rows.map((row, index) => `${x(timestamps[index])},${y(row.lower)}`).reverse();
      chart.append(svgNode('polygon', { points: [...upper, ...lower].join(' '), class: 'chart-band' }));
    }
    for (const [key, className] of [['actual', 'chart-actual'], ['prediction', 'chart-prediction']]) {
      chart.append(svgNode('polyline', { points: rows.map((row, index) => `${x(timestamps[index])},${y(row[key])}`).join(' '), class: className }));
    }
    rows.forEach((row, index) => {
      const circle = svgNode('circle', { cx: x(timestamps[index]), cy: y(row.actual), r: 3, class: 'chart-observation' });
      circle.append(svgNode('title', {}, `${date(row.timestamp)}: observed ${number(row.actual)}, forecast ${number(row.prediction)} ${unit}`));
      chart.append(circle);
    });
    elements['chart-caption'].textContent = `${rows.length} forecasts, each made ${horizon} ${horizon === 1 ? timePeriod.singular : timePeriod.plural} before its target time. Lines connect evaluated timestamps, not every ${timePeriod.adjective} observation. ${intervalsComplete ? 'The shaded band is calibrated using earlier, pre-test errors.' : 'An interval is unavailable for one or more plotted observations.'}`;
  }

  function renderComparison(metrics, selected, viewing, horizon, unit) {
    elements['comparison-caption'].textContent = `Final-test metrics for ${horizon}-${period(currentData).singular} forecasts. Errors and interval widths are in ${unit}.`;
    elements['comparison-body'].replaceChildren(...Object.keys(modelLabels).map(model => {
      const metric = metrics.find(row => row.model === model);
      const row = document.createElement('tr');
      row.dataset.selected = String(model === selected);
      row.dataset.viewing = String(model === viewing);
      const name = textNode('th', label(model));
      name.scope = 'row';
      if (model === selected) name.append(textNode('span', 'Selected on validation', 'table-model-label'));
      row.append(name);
      const cells = [number(metric.mae), number(metric.rmse), finite(metric.mape_pct) ? `${number(metric.mape_pct)}%` : 'Not available', number(metric.mase), percent(metric.coverage), number(metric.mean_interval_width), integerFormatter.format(metric.n)];
      cells.forEach(value => row.append(textNode('td', value)));
      if (metric.mape_n !== metric.n) row.children[3].title = `MAPE uses ${metric.mape_n} nonzero observations out of ${metric.n}.`;
      return row;
    }));
  }

  function renderDataTables(rows) {
    elements['errors-body'].replaceChildren(...[...rows].sort((a, b) => Math.abs(b.actual - b.prediction) - Math.abs(a.actual - a.prediction)).slice(0, 5).map(row => {
      const tr = document.createElement('tr');
      [date(row.origin), date(row.timestamp), number(row.actual), number(row.prediction), number(Math.abs(row.actual - row.prediction))].forEach(value => tr.append(textNode('td', value)));
      return tr;
    }));
    elements['points-body'].replaceChildren(...rows.map(row => {
      const tr = document.createElement('tr');
      [date(row.origin), date(row.timestamp), number(row.actual), number(row.prediction), number(row.lower), number(row.upper)].forEach(value => tr.append(textNode('td', value)));
      return tr;
    }));
  }

  function renderProvenance(data, rows) {
    const source = data.source || {};
    const sourceUrl = safeSourceUrl(source.url);
    elements['source-credit'].replaceChildren(document.createTextNode('Source: '));
    if (sourceUrl) {
      const link = textNode('a', source.title || 'Original dataset');
      link.href = sourceUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      elements['source-credit'].append(link);
    } else {
      elements['source-credit'].append(document.createTextNode(source.title || 'See repository data documentation'));
    }
    if (source.license) elements['source-credit'].append(document.createTextNode(`. License: ${source.license}.`));
    elements['test-period'].textContent = `Targets shown: ${date(rows[0].timestamp)} to ${date(rows.at(-1).timestamp)}. Forecast issue times and every prediction are included in the download. Model selection and interval calibration precede this test period.${period(data).singular === 'hour' ? ' Times preserve the source clock labels; the dataset does not specify a timezone.' : ''}`;
    elements['dataset-limitations'].textContent = Array.isArray(data.limitations) ? data.limitations.join(' ') : 'Historical data only. These experiments do not establish production performance.';
    const dataset = elements['dataset-select'].value;
    elements['download-predictions'].href = `data/${dataset}-predictions.csv`;
    elements['download-metrics'].href = `data/${dataset}-metrics.csv`;
    elements['download-summary'].href = `data/${dataset}-summary.json`;
    elements['run-metadata'].textContent = JSON.stringify({
      schema_version: data.schema_version,
      dataset: data.dataset,
      unit: data.unit,
      frequency: data.frequency,
      input_sha256: data.input_sha256,
      data_summary: data.data_summary,
      config: data.config,
      splits: data.splits,
      selected_models: data.selected_models,
      source: data.source
    }, null, 2);
  }

  function render() {
    if (!currentData) return;
    const data = currentData;
    const model = elements['model-select'].value;
    const horizon = Number(elements['horizon-select'].value);
    const selected = data.selected_models?.[String(horizon)];
    const metrics = data.metrics.filter(row => row.phase === 'test' && row.horizon === horizon);
    const metric = metrics.find(row => row.model === model);
    const rows = data.predictions.filter(row => row.phase === 'test' && row.model === model && row.horizon === horizon).sort((a, b) => parseTimestamp(a.timestamp) - parseTimestamp(b.timestamp));
    const unit = data.unit || 'target units';
    const timePeriod = period(data);
    const intervalLevel = finite(data.config?.interval_level) ? data.config.interval_level : .8;
    elements['data-status'].hidden = false;
    elements['data-status'].textContent = `Showing ${label(model)}, ${horizon}-${timePeriod.singular} horizon, ${rows.length} recorded test forecasts.`;
    elements['data-status'].classList.add('sr-only');
    elements['dataset-title'].textContent = data.title || (elements['dataset-select'].value === 'crypto' ? 'Historical cryptocurrency prices' : 'Household appliance energy demand');
    const summary = data.data_summary;
    elements['dataset-period'].textContent = summary?.start && summary?.end
      ? `${date(summary.start)} to ${date(summary.end)}${Number.isInteger(summary.n_rows) ? ` · ${integerFormatter.format(summary.n_rows)} ${timePeriod.adjective} observations` : ''}`
      : `${timePeriod.adjective} data · Historical experiment`;
    elements['dataset-description'].textContent = elements['dataset-select'].value === 'crypto'
      ? 'Forecasting the future closing price from historical observations. SAR-denominated versions of the same price are excluded from the predictors.'
      : 'Forecasting hourly appliance energy use in kWh per hour from historical household readings. Ten-minute observations are aggregated to complete hours; partial hours are excluded, and the preparation rules are recorded with the dataset.';
    elements['selection-label'].dataset.selected = String(model === selected);
    elements['selection-label'].textContent = model === selected
      ? 'Selected using validation MAE'
      : selected ? `Validation choice: ${label(selected)}` : 'Validation choice not recorded';
    elements['metric-mae'].textContent = number(metric.mae);
    elements['metric-rmse'].textContent = number(metric.rmse);
    elements['metric-unit'].textContent = unit;
    elements['metric-coverage'].textContent = percent(metric.coverage);
    elements['interval-target'].textContent = `${percent(intervalLevel)} nominal interval, measured on test data`;
    renderChart(rows, model, horizon, unit, intervalLevel);
    renderComparison(metrics, selected, model, horizon, unit);
    renderDataTables(rows);
    renderProvenance(data, rows);
  }

  elements['dataset-select'].addEventListener('change', () => {
    elements['data-status'].classList.remove('sr-only');
    loadDataset();
  });
  elements['horizon-select'].addEventListener('change', () => { chooseValidationModel(); render(); });
  elements['model-select'].addEventListener('change', render);
  loadDataset();
})();
