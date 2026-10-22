# Biniyam Berga

My personal portfolio, covering AI engineering, data science, evaluation, and technical leadership.

Visit [Biniyam Berga](https://biniyam44.github.io/).

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

The site uses plain HTML, CSS, and JavaScript. There are no dependencies or build steps. GitHub Pages publishes the root of the `main` branch.

## Checks

```sh
node --check app.js
git diff --check
```

Before publishing an update, check the mobile menu, work filters, project dialogs, and résumé download.
