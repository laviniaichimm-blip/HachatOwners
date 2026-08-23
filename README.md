<h1 align="center">BioSignal</h1>

<p align="center">
  <strong>Turning physiological measurements into understandable early warning signals.</strong>
</p>

<p align="center">
  Physiological timeline analysis · explainable warning score · trend detection · interactive browser dashboard
</p>

<p align="center">
  <img alt="Python 3" src="https://img.shields.io/badge/Python-3.x-3776AB?style=flat-square&logo=python&logoColor=white" />
  <img alt="HTML5" src="https://img.shields.io/badge/HTML5-Frontend-E34F26?style=flat-square&logo=html5&logoColor=white" />
  <img alt="CSS3" src="https://img.shields.io/badge/CSS3-Dashboard-1572B6?style=flat-square&logo=css3&logoColor=white" />
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=000000" />
  <img alt="Dependencies" src="https://img.shields.io/badge/External_Dependencies-None-success?style=flat-square" />
  <img alt="Status" src="https://img.shields.io/badge/Status-Research_Prototype-orange?style=flat-square" />
</p>

<p align="center">
  <a href="#about-biosignal">About</a> ·
  <a href="#current-features">Features</a> ·
  <a href="#system-architecture">Architecture</a> ·
  <a href="#dashboard">Dashboard</a> ·
  <a href="#api">API</a> ·
  <a href="#running-the-project">Run locally</a> ·
  <a href="#important-limitations">Limitations</a>
</p>

---

## About BioSignal

BioSignal is a lightweight physiological signal-analysis prototype that combines several measurements into a single, easier-to-understand warning signal.

Instead of showing heart rate, temperature, white blood cell count and lactate as isolated numbers, BioSignal analyzes their combined pattern over time and produces a normalized warning score, signal level, trend and explanation.

| Output | What it represents |
| --- | --- |
| **BioSignal Warning Score** | A normalized prototype signal from 0 to 100 |
| **Signal Level** | `LOW`, `ELEVATED` or `STRONG` |
| **Trend** | `RISING`, `STABLE` or `FALLING` |
| **Timeline** | Smoothed score evolution across multiple measurements |
| **Explanations** | Human-readable descriptions of relevant changes |
| **Contributors** | Relative contribution of each current measurement |

> **Research prototype:** BioSignal is not a medical device, diagnostic system or clinically validated probability model.

---

## The Idea

Physiological measurements are often viewed separately.

A patient's heart rate may increase.

Temperature may rise.

Lactate may increase.

White blood cell measurements may change.

Each measurement can provide information on its own, but BioSignal explores whether their combined evolution can be represented as one clear signal.

The current prototype analyzes four measurements:

| Measurement | Unit |
| --- | --- |
| ❤️ **Heart Rate** | BPM |
| 🌡️ **Temperature** | °C |
| 🧪 **White Blood Cells** | 10⁹/L |
| 🩸 **Lactate** | mmol/L |

The project intentionally uses the term:

> **BioSignal Warning Score**

rather than describing the output as a probability of sepsis or another medical condition.

---

## Current Features

| Feature | Description |
| --- | --- |
| 📊 **0–100 animated warning score** | Displays the current BioSignal score with a smooth number animation |
| 🚦 **Three signal levels** | Classifies the smoothed score as LOW, ELEVATED or STRONG |
| 📈 **Trend detection** | Identifies RISING, STABLE or FALLING signal behavior |
| 🕒 **Measurement timeline** | Users can add repeated measurements before running analysis |
| 🔄 **Reset / New Patient** | Clears the complete timeline and dashboard |
| 🔔 **Contextual alert banner** | Elevated and strong states generate a visible alert |
| ↕️ **Measurement deltas** | Shows changes in HR, temperature, WBC and lactate |
| 💡 **Most Important Change** | Highlights the largest change across the observed period |
| 📉 **Signal evolution graph** | SVG graph displays the smoothed score history |
| 🕐 **Timestamped measurements** | Timeline points include measurement times |
| 🧠 **Explainable signal** | Generates readable explanations for signal changes |
| 📊 **Contributor bars** | Shows current contribution from each physiological variable |
| 🧪 **Three demo patients** | Stable Patient, Rising Signal and Strong Signal |
| ⚡ **Zero external packages** | Uses Python standard library and native browser technologies |

---

## How It Works

```text
Repeated physiological measurements
                ↓
          Input validation
                ↓
        BioSignal algorithm
                ↓
   Weighted raw warning scores
                ↓
         Signal smoothing
                ↓
     Level + trend detection
                ↓
 Explanations + contributors
                ↓
           JSON response
                ↓
      Interactive dashboard
