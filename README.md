# Biniyam Berga

My personal portfolio, covering AI engineering, data science, evaluation, and technical leadership.

Visit [Biniyam Berga](https://biniyam44.github.io/).

The main navigation and Data Science Portfolio card link to the [interactive forecasting studies](https://biniyam44.github.io/forecasting/). The card also links directly to the [source repository](https://github.com/biniyam44/Data-Science-Portfolio-).

## Run locally

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173`.

## Files

- `index.html`: experience, education, selected work, and contact details.
- `styles.css`: layout and responsive styles.
- `app.js`: work filters, project details, and navigation.
- `assets/`: favicon and résumé.
- `forecasting/`: interactive historical price and hourly appliance-energy studies.
- `forecasting/data/`: checked forecasts, metrics, and reproducibility records exported from the forecasting repository.

The site uses plain HTML, CSS, and JavaScript. There are no dependencies or build steps. GitHub Pages publishes the root of the `main` branch.

## Checks

```sh
node --check app.js
node --check forecasting/forecasting.js
git diff --check
```

Before publishing an update, check the mobile menu, work filters, project dialogs, and résumé download.

For the forecasting explorer, check both datasets and each forecast horizon. Confirm that energy uses hours and kWh, the model-selection badge follows validation results, and CSV downloads match the selected dataset. Model fitting does not run in the visitor's browser. The recorded results come from [the forecasting source repository](https://github.com/biniyam44/Data-Science-Portfolio-), whose export command checks the source data, evaluation rows, and metrics before copying them here.
