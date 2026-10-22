---
status: published
date: 2026-10-22
title: Color wheel from a hex color
description: |
  Generate a 12 color wheel from any hex color with `/color-wheel/#3a7f2c`
---

# Color wheel from a hex color

I wanted a quick way to see what a color looks like when it is spread out over a full color wheel. So I made a small page that does just that: [fippli.se/color-wheel](/color-wheel).

Put a hex color in the URL hash and you get a wheel built from it.

```
https://fippli.se/color-wheel/#3a7f2c
https://fippli.se/color-wheel/#3a7
```

Without a hash you get a random green.

## How it works

The base color is converted to HSL. The saturation and lightness are kept, and the hue is rotated in 30° steps to get 12 colors. The base color takes the green spot on the wheel and the others are placed relative to it.

```javascript
const makeGreenWheel = (baseHex) => {
  const { r, g, b } = hexToRgb(baseHex);
  const { h: hb, s, l } = rgbToHsl(r, g, b);

  return Array.from({ length: 12 }, (_, i) => {
    const h = (hb + i * 30 - 120 + 360) % 360;
    return hslToHex(h, s, l);
  });
};
```

The wheel itself is a single `div` with a `conic-gradient` with one 30° stop per color.

```javascript
const stops = wheel.map(
  (color, i) => `${color} ${i * 30}deg ${(i + 1) * 30}deg`,
);
colorWheel.style.background = `conic-gradient(${stops.join(", ")})`;
```

The hole in the middle is a `mask` with a `radial-gradient`, so the wheel becomes a ring and you can see the background through it.

```css
mask: radial-gradient(circle, transparent 40%, black calc(40% + 1px));
```

## White and black

Colors look different depending on what is around them. Scroll down and the background slides over to black, scroll up and it goes back to white. It is plain CSS scroll snapping with the wheel fixed on top.

```css
html {
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
}

.panel {
  height: 100vh;
  scroll-snap-align: start;
}
```

The code is on [GitHub](https://github.com/fippli/color-wheel).
