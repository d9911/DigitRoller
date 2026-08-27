English | [Español](README.es.md) | [Русский](README.ru.md)

# DigitRoller

An interactive browser demo that animates transitions between numeric values with rolling digit reels.

## Web address

[digit-roller.d9911.org](https://digit-roller.d9911.org/)

## Features

- Animates the first numeric sequence in two editable values.
- Supports integer and fractional digits, including `.` or `,` separators.
- Rolls digits cyclically from 0 to 9 while non-digit text changes immediately.
- Provides light and dark themes and English, Spanish, and Russian interface translations.

## Usage

1. Enter the current and new values; text around the number may be included.
2. Select **Animate** to switch between the two values.
3. Edit the current value to update the preview while it is displayed.

## Run locally

This is a static site. From the repository root, serve the files with any static HTTP server, for example:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Structure

```text
index.html              application markup
src/style.css           interface and reel styles
src/script.js           parsing, animation, theme, and language logic
src/img/                icons
src/manifest.webmanifest web app manifest
```

## Technologies

HTML, CSS, JavaScript, requestAnimationFrame, and Web Storage API.

## License

Distribution terms are provided in [LICENSE](LICENSE).

## Author

Denis Gutsuliak ([d9911.org](https://d9911.org/)).
