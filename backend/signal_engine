def clamp(value, minimum=0.0, maximum=1.0):
    return max(
        minimum,
        min(value, maximum)
    )


def smooth_signal(
    previous,
    current,
    alpha=0.6
):
    return clamp(
        alpha * current
        + (1 - alpha) * previous
    )


def smooth_history(
    raw_history,
    alpha=0.6
):
    if not raw_history:
        return []

    smoothed = [
        raw_history[0]
    ]

    for current in raw_history[1:]:

        previous = smoothed[-1]

        smoothed.append(
            smooth_signal(
                previous,
                current,
                alpha
            )
        )

    return [
        round(value, 4)
        for value in smoothed
    ]


def signal_level(risk):

    if risk < 0.35:
        return "LOW"

    if risk < 0.65:
        return "ELEVATED"

    return "STRONG"


def detect_trend(history):

    if len(history) < 2:
        return "STABLE"

    delta = (
        history[-1]
        - history[0]
    )

    if delta >= 0.08:
        return "RISING"

    if delta <= -0.08:
        return "FALLING"

    return "STABLE"


def measurement_direction(
    first,
    last,
    threshold
):
    delta = last - first

    if delta > threshold:
        return "increased"

    if delta < -threshold:
        return "decreased"

    return "remained relatively stable"


def explain_history(
    history,
    analyses
):
    if not history or not analyses:

        return [
            "No measurements were provided."
        ]

    first = history[0]
    last = history[-1]

    reasons = []

    hr_direction = measurement_direction(
        first["hr"],
        last["hr"],
        5
    )

    temp_direction = measurement_direction(
        first["temperature"],
        last["temperature"],
        0.3
    )

    wbc_direction = measurement_direction(
        first["wbc"],
        last["wbc"],
        1
    )

    lactate_direction = measurement_direction(
        first["lactate"],
        last["lactate"],
        0.4
    )


    if hr_direction != "remained relatively stable":

        reasons.append(
            f"Heart rate {hr_direction} "
            "across the observed period."
        )


    if temp_direction != "remained relatively stable":

        reasons.append(
            f"Temperature {temp_direction} "
            "across the observed period."
        )


    if wbc_direction != "remained relatively stable":

        reasons.append(
            "White blood cell measurement "
            f"{wbc_direction} "
            "across the observed period."
        )


    if lactate_direction != "remained relatively stable":

        reasons.append(
            f"Lactate {lactate_direction} "
            "across the observed period."
        )


    current_contributors = (
        analyses[-1]["contributors"]
    )


    strongest_name = max(
        current_contributors,
        key=current_contributors.get
    )


    readable_names = {
        "heart_rate": "Heart rate",
        "temperature": "Temperature",
        "wbc": "White blood cell measurement",
        "lactate": "Lactate",
    }


    strongest_score = (
        current_contributors[
            strongest_name
        ]
    )


    if strongest_score >= 0.35:

        reasons.append(
            f"{readable_names[strongest_name]} "
            "is one of the strongest "
            "contributors to the current signal."
        )


    if not reasons:

        reasons.append(
            "Measurements remained relatively "
            "stable with no major prototype "
            "warning contributor."
        )


    return reasons[:4]


def build_signal_summary(
    history,
    analyses
):
    raw_scores = [
        item["risk"]
        for item in analyses
    ]

    smoothed_scores = smooth_history(
        raw_scores
    )

    current = (
        smoothed_scores[-1]
        if smoothed_scores
        else 0.0
    )

    return {
        "risk": round(current, 4),

        "percentage":
            round(current * 100),

        "level":
            signal_level(current),

        "trend":
            detect_trend(smoothed_scores),

        "raw_history":
            raw_scores,

        "history":
            smoothed_scores,

        "reasons":
            explain_history(
                history,
                analyses
            ),
    }
