def clamp(value, minimum=0.0, maximum=1.0):
    return max(minimum, min(value, maximum))


def validate_inputs(hr, temperature, wbc, lactate):
    values = [hr, temperature, wbc, lactate]

    for value in values:
        if not isinstance(value, (int, float)):
            return False

    if not 20 <= hr <= 250:
        return False

    if not 30 <= temperature <= 45:
        return False

    if not 0 <= wbc <= 100:
        return False

    if not 0 <= lactate <= 30:
        return False

    return True


def interpolate(value, start, end, low_score, high_score):
    if end == start:
        return high_score

    ratio = (value - start) / (end - start)
    ratio = clamp(ratio)

    return low_score + ratio * (high_score - low_score)


def score_heart_rate(hr):
    if hr <= 90:
        return 0.05

    if hr <= 100:
        return interpolate(hr, 90, 100, 0.05, 0.20)

    if hr <= 120:
        return interpolate(hr, 100, 120, 0.20, 0.60)

    if hr <= 140:
        return interpolate(hr, 120, 140, 0.60, 0.90)

    return 1.0


def score_temperature(temperature):
    if temperature <= 37.5:
        return 0.05

    if temperature <= 38.0:
        return interpolate(
            temperature,
            37.5,
            38.0,
            0.05,
            0.20
        )

    if temperature <= 39.0:
        return interpolate(
            temperature,
            38.0,
            39.0,
            0.20,
            0.65
        )

    if temperature <= 40.0:
        return interpolate(
            temperature,
            39.0,
            40.0,
            0.65,
            0.90
        )

    return 1.0


def score_wbc(wbc):
    if wbc <= 11:
        return 0.05

    if wbc <= 15:
        return interpolate(
            wbc,
            11,
            15,
            0.05,
            0.50
        )

    if wbc <= 20:
        return interpolate(
            wbc,
            15,
            20,
            0.50,
            0.85
        )

    return 1.0


def score_lactate(lactate):
    if lactate <= 2.0:
        return 0.05

    if lactate <= 3.0:
        return interpolate(
            lactate,
            2.0,
            3.0,
            0.05,
            0.45
        )

    if lactate <= 4.0:
        return interpolate(
            lactate,
            3.0,
            4.0,
            0.45,
            0.80
        )

    if lactate <= 6.0:
        return interpolate(
            lactate,
            4.0,
            6.0,
            0.80,
            1.00
        )

    return 1.0


def get_contributors(
    hr,
    temperature,
    wbc,
    lactate
):
    return {
        "heart_rate": round(
            score_heart_rate(hr),
            4
        ),

        "temperature": round(
            score_temperature(temperature),
            4
        ),

        "wbc": round(
            score_wbc(wbc),
            4
        ),

        "lactate": round(
            score_lactate(lactate),
            4
        ),
    }


def predict_risk(
    hr,
    temperature,
    wbc,
    lactate
):
    if not validate_inputs(
        hr,
        temperature,
        wbc,
        lactate
    ):
        raise ValueError(
            "Invalid patient measurements"
        )

    contributors = get_contributors(
        hr,
        temperature,
        wbc,
        lactate
    )

    weights = {
        "heart_rate": 0.25,
        "temperature": 0.25,
        "wbc": 0.20,
        "lactate": 0.30,
    }

    combined = sum(
        contributors[name] * weight
        for name, weight in weights.items()
    )

    return round(
        clamp(combined),
        4
    )


def analyze_patient(
    hr,
    temperature,
    wbc,
    lactate
):
    risk = predict_risk(
        hr,
        temperature,
        wbc,
        lactate
    )

    contributors = get_contributors(
        hr,
        temperature,
        wbc,
        lactate
    )

    return {
        "risk": risk,
        "score": round(risk * 100),
        "contributors": contributors,
    }


if __name__ == "__main__":

    test_patient = {
        "hr": 116,
        "temperature": 38.8,
        "wbc": 15.0,
        "lactate": 3.1,
    }

    result = analyze_patient(
        test_patient["hr"],
        test_patient["temperature"],
        test_patient["wbc"],
        test_patient["lactate"],
    )

    print("BioSignal algorithm running")
    print(result)
