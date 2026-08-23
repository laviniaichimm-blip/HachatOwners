import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"

sys.path.insert(0, str(BACKEND_DIR))

from algorithm import analyze_patient
from signal_engine import (
    build_signal_summary,
    signal_level,
)


def test_low_patient():
    result = analyze_patient(
        75,
        36.8,
        7,
        1.0
    )

    assert result["risk"] < 0.35
    assert signal_level(result["risk"]) == "LOW"


def test_strong_patient():
    result = analyze_patient(
        132,
        39.5,
        18,
        5.2
    )

    assert result["risk"] >= 0.65
    assert signal_level(result["risk"]) == "STRONG"


def test_rising_history():
    history = [
        {
            "hr": 82,
            "temperature": 37.0,
            "wbc": 8.0,
            "lactate": 1.1
        },
        {
            "hr": 105,
            "temperature": 38.0,
            "wbc": 11.5,
            "lactate": 2.1
        },
        {
            "hr": 126,
            "temperature": 39.2,
            "wbc": 16.0,
            "lactate": 4.5
        }
    ]

    analyses = [
        analyze_patient(
            point["hr"],
            point["temperature"],
            point["wbc"],
            point["lactate"]
        )
        for point in history
    ]

    summary = build_signal_summary(
        history,
        analyses
    )

    assert summary["trend"] == "RISING"


if __name__ == "__main__":
    test_low_patient()
    test_strong_patient()
    test_rising_history()

    print("All BioSignal tests passed.")
