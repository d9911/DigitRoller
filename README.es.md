[English](README.md) | Español | [Русский](README.ru.md)

# DigitRoller

Una demostración interactiva en el navegador que anima transiciones entre valores numéricos mediante rodillos de dígitos.

## Dirección web

[digit-roller.d9911.org](https://digit-roller.d9911.org/)

## Funciones

- Anima la primera secuencia numérica de dos valores editables.
- Admite dígitos enteros y fraccionarios, incluidos los separadores `.` o `,`.
- Hace girar los dígitos cíclicamente de 0 a 9, mientras que el texto no numérico cambia al instante.
- Ofrece temas claro y oscuro y traducciones de interfaz en inglés, español y ruso.

## Uso

1. Introduce los valores actual y nuevo; puedes incluir texto alrededor del número.
2. Selecciona **Animar** para alternar entre los dos valores.
3. Edita el valor actual para actualizar la vista previa mientras se muestra.

## Ejecución local

Es un sitio estático. Desde la raíz del repositorio, sirve los archivos con cualquier servidor HTTP estático; por ejemplo:

```bash
python3 -m http.server 8000
```

Después abre [http://localhost:8000](http://localhost:8000).

## Estructura

```text
index.html              marcado de la aplicación
src/style.css           estilos de interfaz y rodillos
src/script.js           lógica de análisis, animación, tema e idioma
src/img/                iconos
src/manifest.webmanifest manifiesto de aplicación web
```

## Tecnologías

HTML, CSS, JavaScript, requestAnimationFrame y Web Storage API.

## Licencia

Los términos de distribución se indican en [LICENSE](LICENSE).

## Autor

Denis Gutsuliak ([d9911.org](https://d9911.org/)).
