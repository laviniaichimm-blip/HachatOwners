let measurementHistory = [];

let scoreAnimation = null;


/* =========================================================
   DEMO PATIENTS
========================================================= */

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


/* =========================================================
   TIME
========================================================= */

function getCurrentTime() {

    return new Date().toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function createDemoTimes(count) {

    const times = [];

    const now = new Date();

    const minutesBetween = 20;


    for (
        let index = count - 1;
        index >= 0;
        index--
    ) {

        const time = new Date(
            now.getTime()
            -
            index
            *
            minutesBetween
            *
            60
            *
            1000
        );


        times.push(
            time.toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )
        );
    }


    return times;
}


/* =========================================================
   INPUT
========================================================= */

function getInputMeasurement() {

    const measurement = {

        hr:
            Number(
                document.getElementById(
                    "hr"
                ).value
            ),

        temperature:
            Number(
                document.getElementById(
                    "temperature"
                ).value
            ),

        wbc:
            Number(
                document.getElementById(
                    "wbc"
                ).value
            ),

        lactate:
            Number(
                document.getElementById(
                    "lactate"
                ).value
            ),

        timestamp:
            getCurrentTime()
    };


    const values = [
        measurement.hr,
        measurement.temperature,
        measurement.wbc,
        measurement.lactate
    ];


    if (
        values.some(
            value =>
                Number.isNaN(value)
        )
    ) {

        throw new Error(
            "Please enter all four measurements."
        );
    }


    return measurement;
}


function setInputMeasurement(
    measurement
) {

    document.getElementById(
        "hr"
    ).value =
        measurement.hr;


    document.getElementById(
        "temperature"
    ).value =
        measurement.temperature;


    document.getElementById(
        "wbc"
    ).value =
        measurement.wbc;


    document.getElementById(
        "lactate"
    ).value =
        measurement.lactate;
}


/* =========================================================
   ADD MEASUREMENT
========================================================= */

function addMeasurement() {

    try {

        const measurement =
            getInputMeasurement();


        measurementHistory.push(
            measurement
        );


        updateHistoryPreview();

    } catch (error) {

        showError(
            error.message
        );
    }
}


/* =========================================================
   CLEAR
========================================================= */

function clearHistory() {

    measurementHistory = [];

    updateHistoryPreview();

    resetDashboard();
}


/* =========================================================
   HISTORY PREVIEW
========================================================= */

function updateHistoryPreview() {

    const preview =
        document.getElementById(
            "historyPreview"
        );


    const count =
        document.getElementById(
            "historyCount"
        );


    count.innerText =
        `${measurementHistory.length} ${
            measurementHistory.length === 1
                ? "measurement"
                : "measurements"
        }`;


    if (
        measurementHistory.length === 0
    ) {

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

                        <span class="chip-time">
                            ${measurement.timestamp || ""}
                        </span>

                        HR ${measurement.hr}
                        ·
                        ${measurement.temperature}°C
                        ·
                        WBC ${measurement.wbc}
                        ·
                        Lac ${measurement.lactate}

                    </span>
                    `
            )
            .join("");
}


/* =========================================================
   ANALYZE
========================================================= */

async function analyzeHistory() {

    try {

        if (
            measurementHistory.length === 0
        ) {

            measurementHistory.push(
                getInputMeasurement()
            );

            updateHistoryPreview();
        }


        const response =
            await fetch(
                "/predict",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            history:
                                measurementHistory
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Analysis failed."
            );
        }


        updateDashboard(
            data
        );


    } catch (error) {

        showError(
            error.message
        );
    }
}


/* =========================================================
   LOAD DEMO
========================================================= */

function loadDemo(name) {

    const demo =
        demos[name];


    if (!demo) {
        return;
    }


    const times =
        createDemoTimes(
            demo.length
        );


    measurementHistory =
        demo.map(
            (
                measurement,
                index
            ) => ({

                ...measurement,

                timestamp:
                    times[index]
            })
        );


    setInputMeasurement(
        measurementHistory[
            measurementHistory.length - 1
        ]
    );


    updateHistoryPreview();

    analyzeHistory();
}


/* =========================================================
   UPDATE DASHBOARD
========================================================= */

function updateDashboard(data) {

    animateScore(
        data.percentage
    );


    updateLevel(
        data.level
    );


    updateTrend(
        data.trend
    );


    updateAlert(
        data.level,
        data.trend
    );


    updateHeroMeasurements(
        data.current
    );


    updateMeasurementChanges();


    updateReasons(
        data.reasons
    );


    updateContributors(
        data.contributors
    );


    updateBiggestChange();


    drawChart(
        data.history
    );


    updateTimeLabels();


    document.getElementById(
        "pointCount"
    ).innerText =
        `${data.measurement_count} ${
            data.measurement_count === 1
                ? "point"
                : "points"
        }`;


    document.getElementById(
        "statusText"
    ).innerText =

        `The current smoothed BioSignal warning score is `
        +
        `${data.percentage}/100. `
        +
        `The detected trend is `
        +
        `${data.trend.toLowerCase()}.`;
}


/* =========================================================
   SCORE ANIMATION
========================================================= */

function animateScore(target) {

    const element =
        document.getElementById(
            "score"
        );


    if (scoreAnimation) {

        cancelAnimationFrame(
            scoreAnimation
        );
    }


    const start =
        Number(
            element.innerText
        ) || 0;


    const duration = 700;

    const startTime =
        performance.now();


    function step(currentTime) {

        const elapsed =
            currentTime -
            startTime;


        const progress =
            Math.min(
                elapsed / duration,
                1
            );


        const eased =
            1 -
            Math.pow(
                1 - progress,
                3
            );


        const current =
            Math.round(
                start
                +
                (
                    target -
                    start
                )
                *
                eased
            );


        element.innerText =
            current;


        if (
            progress < 1
        ) {

            scoreAnimation =
                requestAnimationFrame(
                    step
                );
        }
    }


    scoreAnimation =
        requestAnimationFrame(
            step
        );
}


/* =========================================================
   SIGNAL LEVEL
========================================================= */

function updateLevel(level) {

    const element =
        document.getElementById(
            "level"
        );


    element.innerText =
        `${level} SIGNAL`;


    element.className =
        "signal-pill "
        +
        level.toLowerCase();
}


/* =========================================================
   TREND
========================================================= */

function updateTrend(trend) {

    const symbols = {

        RISING: "↑",

        FALLING: "↓",

        STABLE: "→"
    };


    document.getElementById(
        "trend"
    ).innerText =

        `${symbols[trend] || "—"} ${trend}`;
}


/* =========================================================
   ALERT BANNER
========================================================= */

function updateAlert(
    level,
    trend
) {

    const banner =
        document.getElementById(
            "alertBanner"
        );


    const title =
        document.getElementById(
            "alertTitle"
        );


    const text =
        document.getElementById(
            "alertText"
        );


    banner.className =
        "alert-banner";


    if (
        level === "LOW"
    ) {

        banner.classList.add(
            "hidden"
        );

        return;
    }


    if (
        level === "ELEVATED"
    ) {

        banner.classList.add(
            "elevated-alert"
        );


        title.innerText =
            "Elevated physiological signal";


        text.innerText =

            trend === "RISING"

                ? "The warning signal is elevated and continuing to rise."

                : "Several measurements are contributing to an elevated warning signal.";


        return;
    }


    banner.classList.add(
        "strong-alert"
    );


    title.innerText =
        "Strong physiological warning signal detected";


    text.innerText =

        trend === "RISING"

            ? "The current signal is strong and continues to rise across the observed period."

            : "The current combination of measurements produces a strong BioSignal warning score.";
}


/* =========================================================
   CURRENT VALUES
========================================================= */

function updateHeroMeasurements(
    current
) {

    document.getElementById(
        "heroHr"
    ).innerText =
        `${formatNumber(
            current.hr
        )} BPM`;


    document.getElementById(
        "heroTemp"
    ).innerText =
        `${formatNumber(
            current.temperature
        )}°C`;


    document.getElementById(
        "heroWbc"
    ).innerText =
        formatNumber(
            current.wbc
        );


    document.getElementById(
        "heroLactate"
    ).innerText =
        formatNumber(
            current.lactate
        );
}


/* =========================================================
   MEASUREMENT DELTAS
========================================================= */

function updateMeasurementChanges() {

    if (
        measurementHistory.length < 2
    ) {

        setDelta(
            "deltaHr",
            0,
            "BPM"
        );

        setDelta(
            "deltaTemp",
            0,
            "°C"
        );

        setDelta(
            "deltaWbc",
            0,
            ""
        );

        setDelta(
            "deltaLactate",
            0,
            "mmol/L"
        );

        return;
    }


    const previous =
        measurementHistory[
            measurementHistory.length - 2
        ];


    const current =
        measurementHistory[
            measurementHistory.length - 1
        ];


    setDelta(
        "deltaHr",
        current.hr - previous.hr,
        "BPM"
    );


    setDelta(
        "deltaTemp",
        current.temperature
        -
        previous.temperature,
        "°C",
        1
    );


    setDelta(
        "deltaWbc",
        current.wbc - previous.wbc,
        "",
        1
    );


    setDelta(
        "deltaLactate",
        current.lactate
        -
        previous.lactate,
        "mmol/L",
        1
    );
}


function setDelta(
    id,
    difference,
    unit,
    decimals = 0
) {

    const element =
        document.getElementById(
            id
        );


    if (
        Math.abs(
            difference
        ) < 0.001
    ) {

        element.innerText =
            "→ No change";

        element.className =
            "measurement-delta neutral-delta";

        return;
    }


    const arrow =
        difference > 0
            ? "↑"
            : "↓";


    const sign =
        difference > 0
            ? "+"
            : "";


    element.innerText =

        `${arrow} ${sign}${difference.toFixed(decimals)} ${unit}`;


    element.className =

        "measurement-delta "
        +
        (
            difference > 0

                ? "delta-up"

                : "delta-down"
        );
}


/* =========================================================
   BIGGEST CHANGE
========================================================= */

function updateBiggestChange() {

    const title =
        document.getElementById(
            "biggestChangeTitle"
        );


    const text =
        document.getElementById(
            "biggestChangeText"
        );


    if (
        measurementHistory.length < 2
    ) {

        title.innerText =
            "Not enough history yet";


        text.innerText =
            "Add another measurement to compare changes over time.";

        return;
    }


    const first =
        measurementHistory[0];


    const last =
        measurementHistory[
            measurementHistory.length - 1
        ];


    const changes = [

        {
            name:
                "Heart rate",

            value:
                last.hr - first.hr,

            normalized:
                Math.abs(
                    last.hr - first.hr
                ) / 40,

            unit:
                "BPM",

            decimals:
                0
        },


        {
            name:
                "Temperature",

            value:
                last.temperature
                -
                first.temperature,

            normalized:
                Math.abs(
                    last.temperature
                    -
                    first.temperature
                ) / 2,

            unit:
                "°C",

            decimals:
                1
        },


        {
            name:
                "White blood cell measurement",

            value:
                last.wbc - first.wbc,

            normalized:
                Math.abs(
                    last.wbc - first.wbc
                ) / 8,

            unit:
                "",

            decimals:
                1
        },


        {
            name:
                "Lactate",

            value:
                last.lactate
                -
                first.lactate,

            normalized:
                Math.abs(
                    last.lactate
                    -
                    first.lactate
                ) / 3,

            unit:
                "mmol/L",

            decimals:
                1
        }

    ];


    const biggest =
        changes.reduce(
            (currentBiggest, item) =>

                item.normalized
                >
                currentBiggest.normalized

                    ? item

                    : currentBiggest
        );


    const direction =

        biggest.value > 0

            ? "increased"

            : biggest.value < 0

                ? "decreased"

                : "remained stable";


    title.innerText =

        `${biggest.name} ${direction}`;


    text.innerText =

        biggest.value === 0

            ? `${biggest.name} did not change across the observed period.`

            : `${biggest.name} changed by ${Math.abs(
                biggest.value
            ).toFixed(
                biggest.decimals
            )} ${biggest.unit} from the first to the latest measurement.`;
}


/* =========================================================
   REASONS
========================================================= */

function updateReasons(reasons) {

    const container =
        document.getElementById(
            "reasons"
        );


    container.innerHTML =
        reasons
            .map(
                reason =>

                    `
                    <div class="reason-item">
                        ${escapeHtml(reason)}
                    </div>
                    `
            )
            .join("");
}


/* =========================================================
   CONTRIBUTION BARS
========================================================= */

function updateContributors(
    contributors
) {

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


    mapping.forEach(
        (
            [
                key,
                barId,
                valueId
            ]
        ) => {

            const value =
                contributors[key] || 0;


            const percentage =
                Math.round(
                    value * 100
                );


            const bar =
                document.getElementById(
                    barId
                );


            bar.style.width =
                "0%";


            requestAnimationFrame(
                () => {

                    requestAnimationFrame(
                        () => {

                            bar.style.width =
                                `${percentage}%`;
                        }
                    );
                }
            );


            document.getElementById(
                valueId
            ).innerText =
                `${percentage}%`;
        }
    );
}


/* =========================================================
   GRAPH
========================================================= */

function drawChart(history) {

    const width = 700;
    const height = 260;

    const horizontalPadding = 14;
    const verticalPadding = 10;


    const usableWidth =
        width
        -
        horizontalPadding * 2;


    const usableHeight =
        height
        -
        verticalPadding * 2;


    const line =
        document.getElementById(
            "signalLine"
        );


    const pointsGroup =
        document.getElementById(
            "signalPoints"
        );


    if (
        !history ||
        history.length === 0
    ) {

        line.setAttribute(
            "points",
            ""
        );


        pointsGroup.innerHTML =
            "";


        return;
    }


    const coordinates =
        history.map(
            (
                value,
                index
            ) => {

                let x;


                if (
                    history.length === 1
                ) {

                    x =
                        width / 2;

                } else {

                    x =
                        horizontalPadding
                        +
                        (
                            index
                            /
                            (
                                history.length - 1
                            )
                        )
                        *
                        usableWidth;
                }


                const clamped =
                    Math.max(
                        0,
                        Math.min(
                            1,
                            value
                        )
                    );


                const y =
                    verticalPadding
                    +
                    (
                        1 - clamped
                    )
                    *
                    usableHeight;


                return {
                    x,
                    y,
                    value:
                        clamped
                };
            }
        );


    const polyline =
        coordinates
            .map(
                point =>
                    `${point.x},${point.y}`
            )
            .join(" ");


    line.style.opacity =
        "0";


    line.setAttribute(
        "points",
        polyline
    );


    setTimeout(
        () => {

            line.style.transition =
                "opacity 500ms ease";

            line.style.opacity =
                "1";
        },
        30
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
                            ${Math.round(
                                point.value * 100
                            )}/100
                        </title>

                    </circle>
                    `
            )
            .join("");
}


/* =========================================================
   TIME LABELS
========================================================= */

function updateTimeLabels() {

    const container =
        document.getElementById(
            "timeLabels"
        );


    if (
        measurementHistory.length === 0
    ) {

        container.innerHTML =
            "";

        return;
    }


    container.innerHTML =
        measurementHistory
            .map(
                measurement =>

                    `<span>${measurement.timestamp || ""}</span>`
            )
            .join("");
}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    const status =
        document.getElementById(
            "statusText"
        );


    status.innerText =
        message;


    document.getElementById(
        "level"
    ).innerText =
        "ERROR";


    document.getElementById(
        "level"
    ).className =
        "signal-pill strong";
}


/* =========================================================
   RESET DASHBOARD
========================================================= */

function resetDashboard() {

    document.getElementById(
        "score"
    ).innerText =
        "0";


    document.getElementById(
        "level"
    ).innerText =
        "WAITING";


    document.getElementById(
        "level"
    ).className =
        "signal-pill neutral";


    document.getElementById(
        "trend"
    ).innerText =
        "— NO TREND";


    document.getElementById(
        "statusText"
    ).innerText =

        "Choose a demo patient or enter your own measurements.";


    document.getElementById(
        "heroHr"
    ).innerText =
        "--";


    document.getElementById(
        "heroTemp"
    ).innerText =
        "--";


    document.getElementById(
        "heroWbc"
    ).innerText =
        "--";


    document.getElementById(
        "heroLactate"
    ).innerText =
        "--";


    document.getElementById(
        "deltaHr"
    ).innerText =
        "—";


    document.getElementById(
        "deltaTemp"
    ).innerText =
        "—";


    document.getElementById(
        "deltaWbc"
    ).innerText =
        "—";


    document.getElementById(
        "deltaLactate"
    ).innerText =
        "—";


    document.getElementById(
        "alertBanner"
    ).className =
        "alert-banner hidden";


    document.getElementById(
        "biggestChangeTitle"
    ).innerText =
        "Waiting for measurements";


    document.getElementById(
        "biggestChangeText"
    ).innerText =

        "BioSignal will highlight the largest change across the observed period.";


    document.getElementById(
        "reasons"
    ).innerHTML =

        `
        <div class="reason-item muted">
            Analysis reasons will appear here.
        </div>
        `;


    updateContributors({
        heart_rate: 0,
        temperature: 0,
        wbc: 0,
        lactate: 0
    });


    document.getElementById(
        "pointCount"
    ).innerText =
        "0 points";


    document.getElementById(
        "timeLabels"
    ).innerHTML =
        "";


    drawChart([]);
}


/* =========================================================
   HELPERS
========================================================= */

function formatNumber(value) {

    const number =
        Number(value);


    if (
        Number.isInteger(
            number
        )
    ) {

        return number;
    }


    return number.toFixed(1);
}


function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );


    div.innerText =
        text;


    return div.innerHTML;
}


/* =========================================================
   START
========================================================= */

window.addEventListener(
    "DOMContentLoaded",
    () => {

        resetDashboard();

        updateHistoryPreview();
    }
);
