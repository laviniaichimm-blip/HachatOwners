let measurementHistory = [];


const demos = {

    stable: [
        {
            hr: 82,
            temperature: 36.8,
            wbc: 7.4,
            lactate: 1.0
        },
        {
            hr: 80,
            temperature: 36.9,
            wbc: 7.2,
            lactate: 1.1
        },
        {
            hr: 84,
            temperature: 37.0,
            wbc: 7.5,
            lactate: 1.0
        },
        {
            hr: 81,
            temperature: 36.9,
            wbc: 7.1,
            lactate: 1.1
        }
    ],


    rising: [
        {
            hr: 82,
            temperature: 37.0,
            wbc: 8.0,
            lactate: 1.1
        },
        {
            hr: 94,
            temperature: 37.5,
            wbc: 9.5,
            lactate: 1.5
        },
        {
            hr: 105,
            temperature: 38.0,
            wbc: 11.5,
            lactate: 2.1
        },
        {
            hr: 116,
            temperature: 38.7,
            wbc: 14.0,
            lactate: 3.0
        },
        {
            hr: 126,
            temperature: 39.2,
            wbc: 16.0,
            lactate: 4.5
        }
    ],


    strong: [
        {
            hr: 108,
            temperature: 38.1,
            wbc: 12.0,
            lactate: 2.3
        },
        {
            hr: 118,
            temperature: 38.7,
            wbc: 14.5,
            lactate: 3.3
        },
        {
            hr: 125,
            temperature: 39.2,
            wbc: 16.0,
            lactate: 4.5
        },
        {
            hr: 132,
            temperature: 39.5,
            wbc: 18.0,
            lactate: 5.2
        }
    ]
};


function getInputMeasurement() {

    const measurement = {
        hr: Number(document.getElementById("hr").value),
        temperature:
            Number(document.getElementById("temperature").value),
        wbc: Number(document.getElementById("wbc").value),
        lactate:
            Number(document.getElementById("lactate").value)
    };

    const values = Object.values(measurement);

    if (values.some(value => Number.isNaN(value))) {
        throw new Error("Please enter all four measurements.");
    }

    return measurement;
}


function setInputMeasurement(measurement) {

    document.getElementById("hr").value =
        measurement.hr;

    document.getElementById("temperature").value =
        measurement.temperature;

    document.getElementById("wbc").value =
        measurement.wbc;

    document.getElementById("lactate").value =
        measurement.lactate;
}


function addMeasurement() {

    try {

        const measurement = getInputMeasurement();

        measurementHistory.push(measurement);

        updateHistoryPreview();

    } catch (error) {

        showError(error.message);
    }
}


function clearHistory() {

    measurementHistory = [];

    updateHistoryPreview();
    resetDashboard();
}


function updateHistoryPreview() {

    const preview =
        document.getElementById("historyPreview");

    if (measurementHistory.length === 0) {

        preview.innerHTML =
            "No measurements added yet.";

        return;
    }

    preview.innerHTML =
        measurementHistory
            .map(
                (measurement, index) =>
                    `
                    <span class="history-chip">
                        #${index + 1}
                        HR ${measurement.hr},
                        ${measurement.temperature}°C,
                        WBC ${measurement.wbc},
                        Lac ${measurement.lactate}
                    </span>
                    `
            )
            .join("");
}


async function analyzeHistory() {

    try {

        if (measurementHistory.length === 0) {

            const measurement =
                getInputMeasurement();

            measurementHistory.push(measurement);

            updateHistoryPreview();
        }


        setLoading(true);


        const response = await fetch(
            "/predict",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    history: measurementHistory
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.error || "Analysis failed."
            );
        }


        updateDashboard(data);


    } catch (error) {

        showError(error.message);

    } finally {

        setLoading(false);
    }
}


function loadDemo(name) {

    const demo = demos[name];

    if (!demo) {
        return;
    }


    measurementHistory =
        demo.map(measurement => ({
            ...measurement
        }));


    setInputMeasurement(
        measurementHistory[
            measurementHistory.length - 1
        ]
    );


    updateHistoryPreview();

    analyzeHistory();
}


function setLoading(isLoading) {

    const level =
        document.getElementById("level");

    const status =
        document.getElementById("statusText");


    if (isLoading) {

        level.innerText = "ANALYZING";
        level.className =
            "signal-pill neutral";

        status.innerText =
            "Processing the measurement timeline...";
    }
}


function updateDashboard(data) {

    document.getElementById("score").innerText =
        data.percentage;


    updateLevel(data.level);
    updateTrend(data.trend);
    updateHeroMeasurements(data.current);
    updateReasons(data.reasons);
    updateContributors(data.contributors);
    drawChart(data.history);


    document.getElementById("pointCount").innerText =
        `${data.measurement_count} ${
            data.measurement_count === 1
                ? "point"
                : "points"
        }`;


    document.getElementById("statusText").innerText =
        `The current smoothed BioSignal warning score is ` +
        `${data.percentage}/100. ` +
        `The detected timeline trend is ${data.trend.toLowerCase()}.`;
}


function updateLevel(level) {

    const element =
        document.getElementById("level");

    element.innerText =
        `${level} SIGNAL`;

    element.className =
        "signal-pill " +
        level.toLowerCase();
}


function updateTrend(trend) {

    const element =
        document.getElementById("trend");

    const symbols = {
        RISING: "↑",
        FALLING: "↓",
        STABLE: "→"
    };

    element.innerText =
        `${symbols[trend] || "—"} ${trend}`;
}


function updateHeroMeasurements(current) {

    document.getElementById("heroHr").innerText =
        `${formatNumber(current.hr)} BPM`;

    document.getElementById("heroTemp").innerText =
        `${formatNumber(current.temperature)}°C`;

    document.getElementById("heroWbc").innerText =
        formatNumber(current.wbc);

    document.getElementById("heroLactate").innerText =
        formatNumber(current.lactate);
}


function updateReasons(reasons) {

    const container =
        document.getElementById("reasons");

    container.innerHTML =
        reasons
            .map(
                reason =>
                    `<div class="reason-item">${escapeHtml(reason)}</div>`
            )
            .join("");
}


function updateContributors(contributors) {

    const mapping = [
        [
            "heart_rate",
            "barHr",
            "valueHr"
        ],
        [
            "temperature",
            "barTemperature",
            "valueTemperature"
        ],
        [
            "wbc",
            "barWbc",
            "valueWbc"
        ],
        [
            "lactate",
            "barLactate",
            "valueLactate"
        ]
    ];


    for (const [
        key,
        barId,
        valueId
    ] of mapping) {

        const value =
            contributors[key] || 0;

        const percentage =
            Math.round(value * 100);

        document.getElementById(barId).style.width =
            `${percentage}%`;

        document.getElementById(valueId).innerText =
            `${percentage}%`;
    }
}


function drawChart(history) {

    const svgWidth = 700;
    const svgHeight = 260;
    const horizontalPadding = 14;
    const verticalPadding = 10;

    const usableWidth =
        svgWidth - horizontalPadding * 2;

    const usableHeight =
        svgHeight - verticalPadding * 2;


    const line =
        document.getElementById("signalLine");

    const pointsGroup =
        document.getElementById("signalPoints");


    if (!history || history.length === 0) {

        line.setAttribute("points", "");
        pointsGroup.innerHTML = "";
        return;
    }


    const coordinates =
        history.map((value, index) => {

            let x;

            if (history.length === 1) {

                x = svgWidth / 2;

            } else {

                x =
                    horizontalPadding +
                    (
                        index /
                        (history.length - 1)
                    ) *
                    usableWidth;
            }


            const clamped =
                Math.max(
                    0,
                    Math.min(1, value)
                );


            const y =
                verticalPadding +
                (
                    1 - clamped
                ) *
                usableHeight;


            return {
                x,
                y,
                value: clamped
            };
        });


    const polyline =
        coordinates
            .map(
                point =>
                    `${point.x},${point.y}`
            )
            .join(" ");


    line.setAttribute(
        "points",
        polyline
    );


    pointsGroup.innerHTML =
        coordinates
            .map(
                point =>
                    `
                    <circle
                        class="signal-point"
                        cx="${point.x}"
                        cy="${point.y}"
                        r="6"
                    >
                        <title>
                            ${Math.round(point.value * 100)}/100
                        </title>
                    </circle>
                    `
            )
            .join("");
}


function showError(message) {

    document.getElementById("level").innerText =
        "ERROR";

    document.getElementById("level").className =
        "signal-pill strong";

    const status =
        document.getElementById("statusText");

    status.innerText = message;
    status.classList.add("error");
}


function resetDashboard() {

    document.getElementById("score").innerText =
        "--";

    document.getElementById("level").innerText =
        "WAITING";

    document.getElementById("level").className =
        "signal-pill neutral";

    document.getElementById("trend").innerText =
        "— NO TREND";

    document.getElementById("statusText").innerText =
        "Choose a demo patient or enter a measurement history.";

    document.getElementById("statusText").classList.remove(
        "error"
    );

    document.getElementById("heroHr").innerText =
        "--";

    document.getElementById("heroTemp").innerText =
        "--";

    document.getElementById("heroWbc").innerText =
        "--";

    document.getElementById("heroLactate").innerText =
        "--";

    document.getElementById("reasons").innerHTML =
        `
        <div class="reason-item muted">
            Analysis reasons will appear here.
        </div>
        `;

    document.getElementById("pointCount").innerText =
        "0 points";

    updateContributors({
        heart_rate: 0,
        temperature: 0,
        wbc: 0,
        lactate: 0
    });

    drawChart([]);
}


function formatNumber(value) {

    if (Number.isInteger(value)) {
        return value;
    }

    return Number(value).toFixed(1);
}


function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.innerText = text;

    return div.innerHTML;
}


window.addEventListener(
    "DOMContentLoaded",
    () => {

        resetDashboard();

        // Start with the most useful judging demo.
        loadDemo("rising");
    }
);
