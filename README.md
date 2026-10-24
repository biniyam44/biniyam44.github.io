# Biniyam Berga

My personal portfolio, covering AI engineering, data science, evaluation, and technical leadership.

Visit [Biniyam Berga](https://biniyam44.github.io/).

The main navigation and Data Science Portfolio card link to the [interactive forecasting studies](https://biniyam44.github.io/forecasting/). The card also links directly to the [source repository](https://github.com/biniyam44/Data-Science-Portfolio-).

The [AI Engineering page](https://biniyam44.github.io/engineering/) includes Terminal Recovery Tasks and Code Evaluation Runner, with links to their public repositories, measured checks, and completed CI runs. The forecasting service and research-assistant examples remain available below those projects.

## Run locally

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173`.

## Files

- `index.html`: experience, education, selected work, and contact details.
- `styles.css`: layout and responsive styles.
- `app.js`: area selectors with related-work links, work filters, project details, and navigation.
- `assets/`: favicon and résumé.
- `forecasting/`: interactive historical price and hourly appliance-energy studies.
- `forecasting/data/`: checked forecasts, metrics, and reproducibility records exported from the forecasting repository.
- `engineering/`: public recovery and evaluation projects, plus recorded energy API, monitoring, research-assistant and independent-replication examples. This is not a live backend.

The site uses plain HTML, CSS, and JavaScript. There are no dependencies or build steps. GitHub Pages publishes the root of the `main` branch.

## Checks

```sh
node --check app.js
node --check forecasting/forecasting.js
node --check engineering/engineering.js
git diff --check
```

Before publishing an update, check the mobile menu, work filters, project dialogs, and résumé download.

In “The way I work,” select each area and confirm that the three steps, description, tags, and related-work link change together. The numbered steps are a diagram, not buttons. The area buttons support native Tab and Enter/Space activation.

For the engineering page, check both project cards and their repository, results, and CI links. Test all horizon and question selections, citation links and JSON downloads. Refresh its recorded data with `python scripts/export_engineering.py --destination ../biniyam-berga` from the forecasting repository after its local checks and HTTP benchmark. Do not add API tokens or model-provider keys to this site.

For the forecasting explorer, check both datasets and each forecast horizon. Confirm that energy uses hours and kWh, the model-selection badge follows validation results, and CSV downloads match the selected dataset. Model fitting does not run in the visitor's browser. The recorded results come from [the forecasting source repository](https://github.com/biniyam44/Data-Science-Portfolio-), whose export command checks the source data, evaluation rows, and metrics before copying them here.
