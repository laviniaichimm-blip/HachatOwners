let measurementHistory = [];

let latestAnalysis = null;

let selectedExplorerMetric = "score";

let scoreAnimation = null;

let replayInProgress = false;


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

        const time =
            new Date(
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


    if (
        measurement.hr < 20
        ||
        measurement.hr > 250
    ) {

        throw new Error(
            "Heart rate must be between 20 and 250 BPM."
        );
    }


    if (
        measurement.temperature < 30
        ||
        measurement.temperature > 45
    ) {

        throw new Error(
            "Temperature must be between 30 and 45 °C."
        );
    }


    if (
        measurement.wbc < 0
        ||
        measurement.wbc > 100
    ) {

        throw new Error(
            "WBC must be between 0 and 100."
        );
    }


    if (
        measurement.lactate < 0
        ||
        measurement.lactate > 30
    ) {

        throw new Error(
            "Lactate must be between 0 and 30 mmol/L."
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

        drawVitalsExplorer();

    } catch (error) {

        showError(
            error.message
        );
    }
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
                    method:
                        "POST",

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
                data.error
                ||
                "Analysis failed."
            );
        }


        latestAnalysis =
            data;


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


    clearSymptoms();


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


    const latest =
        measurementHistory[
            measurementHistory.length
            -
            1
        ];


    setInputMeasurement(
        latest
    );


    updateHistoryPreview();

    analyzeHistory();
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
                measurement => `

                    <span class="history-chip">

                        <span class="chip-time">
                            ${measurement.timestamp || ""}
                        </span>

                        HR ${formatNumber(measurement.hr)}
                        ·
                        ${formatNumber(measurement.temperature)}°C
                        ·
                        WBC ${formatNumber(measurement.wbc)}
                        ·
                        Lac ${formatNumber(measurement.lactate)}

                    </span>

                `
            )

            .join("");
}


/* =========================================================
   DASHBOARD UPDATE
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


    drawSignalChart(
        data.history
    );


    updateMainTimeLabels();


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

        "The current smoothed BioSignal warning score is "
        +
        `${data.percentage}/100. `
        +
        "The detected trend is "
        +
        `${data.trend.toLowerCase()}.`;


    drawVitalsExplorer();

    updateNextStep(
        data
    );
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
        )
        ||
        0;


    const duration =
        700;


    const startTime =
        performance.now();


    function step(
        currentTime
    ) {

        const elapsed =
            currentTime
            -
            startTime;


        const progress =
            Math.min(
                elapsed / duration,
                1
            );


        const eased =
            1
            -
            Math.pow(
                1 - progress,
                3
            );


        const current =
            Math.round(
                start
                +
                (
                    target
                    -
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
   LEVEL
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

        RISING:
            "↑",

        FALLING:
            "↓",

        STABLE:
            "→"
    };


    document.getElementById(
        "trend"
    ).innerText =

        `${symbols[trend] || "—"} ${trend}`;
}


/* =========================================================
   ALERT
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
        level ===
        "LOW"
    ) {

        banner.classList.add(
            "hidden"
        );

        return;
    }


    if (
        level ===
        "ELEVATED"
    ) {

        banner.classList.add(
            "elevated-alert"
        );


        title.innerText =
            "Elevated physiological signal";


        text.innerText =

            trend ===
            "RISING"

                ?
                "The warning signal is elevated and continuing to rise."

                :
                "Several measurements are contributing to an elevated warning signal.";


        return;
    }


    banner.classList.add(
        "strong-alert"
    );


    title.innerText =
        "Strong physiological warning signal detected";


    text.innerText =

        trend ===
        "RISING"

            ?
            "The current signal is strong and continues to rise across the observed period."

            :
            "The current combination of measurements produces a strong BioSignal warning score.";
}


/* =========================================================
   HERO MEASUREMENTS
========================================================= */

function updateHeroMeasurements(
    current
) {

    document.getElementById(
        "heroHr"
    ).innerText =

        `${formatNumber(current.hr)} BPM`;


    document.getElementById(
        "heroTemp"
    ).innerText =

        `${formatNumber(current.temperature)}°C`;


    document.getElementById(
        "heroWbc"
    ).innerText =

        formatNumber(
            current.wbc
        );


    document.getElementById(
        "heroLactate"
    ).innerText =

        `${formatNumber(current.lactate)} mmol/L`;
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
            "°C",
            1
        );


        setDelta(
            "deltaWbc",
            0,
            "",
            1
        );


        setDelta(
            "deltaLactate",
            0,
            "mmol/L",
            1
        );


        return;
    }


    const previous =
        measurementHistory[
            measurementHistory.length
            -
            2
        ];


    const current =
        measurementHistory[
            measurementHistory.length
            -
            1
        ];


    setDelta(
        "deltaHr",
        current.hr
        -
        previous.hr,
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
        current.wbc
        -
        previous.wbc,
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
        )
        <
        0.001
    ) {

        element.innerText =
            "→ No change";


        element.className =
            "measurement-delta neutral-delta";


        return;
    }


    const arrow =
        difference > 0
            ?
            "↑"
            :
            "↓";


    const sign =
        difference > 0
            ?
            "+"
            :
            "";


    element.innerText =

        `${arrow} ${sign}${difference.toFixed(decimals)} ${unit}`;


    element.className =

        difference > 0

            ?
            "measurement-delta delta-up"

            :
            "measurement-delta delta-down";
}


/* =========================================================
   REASONS
========================================================= */

function updateReasons(
    reasons
) {

    const container =
        document.getElementById(
            "reasons"
        );


    container.innerHTML =
        "";


    if (
        !reasons
        ||
        reasons.length === 0
    ) {

        container.innerHTML = `

            <div class="reason-item muted">
                No major contributing changes detected.
            </div>

        `;

        return;
    }


    reasons.forEach(
        reason => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "reason-item";


            element.innerText =
                reason;


            container.appendChild(
                element
            );
        }
    );
}


/* =========================================================
   CONTRIBUTORS
========================================================= */

function updateContributors(
    contributors
) {

    if (!contributors) {
        return;
    }


    setContributor(
        "barHr",
        "valueHr",
        contributors.heart_rate
    );


    setContributor(
        "barTemperature",
        "valueTemperature",
        contributors.temperature
    );


    setContributor(
        "barWbc",
        "valueWbc",
        contributors.wbc
    );


    setContributor(
        "barLactate",
        "valueLactate",
        contributors.lactate
    );
}


function setContributor(
    barId,
    valueId,
    value
) {

    const safeValue =
        Math.max(
            0,
            Math.min(
                Number(value) || 0,
                1
            )
        );


    document.getElementById(
        barId
    ).style.width =

        `${safeValue * 100}%`;


    document.getElementById(
        valueId
    ).innerText =

        `${Math.round(safeValue * 100)}%`;
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
            "Add another measurement";


        text.innerText =
            "Two or more measurements are needed to compare changes over time.";


        return;
    }


    const first =
        measurementHistory[0];


    const last =
        measurementHistory[
            measurementHistory.length
            -
            1
        ];


    const metrics = [

        {
            name:
                "Heart rate",

            difference:
                last.hr
                -
                first.hr,

            scale:
                40,

            unit:
                "BPM"
        },

        {
            name:
                "Temperature",

            difference:
                last.temperature
                -
                first.temperature,

            scale:
                2,

            unit:
                "°C"
        },

        {
            name:
                "White blood cell measurement",

            difference:
                last.wbc
                -
                first.wbc,

            scale:
                8,

            unit:
                ""
        },

        {
            name:
                "Lactate",

            difference:
                last.lactate
                -
                first.lactate,

            scale:
                3,

            unit:
                "mmol/L"
        }
    ];


    metrics.forEach(
        metric => {

            metric.relative =
                Math.abs(
                    metric.difference
                )
                /
                metric.scale;
        }
    );


    metrics.sort(
        (
            firstMetric,
            secondMetric
        ) =>

            secondMetric.relative
            -
            firstMetric.relative
    );


    const biggest =
        metrics[0];


    const direction =

        biggest.difference > 0

            ?
            "increased"

            :
            biggest.difference < 0

                ?
                "decreased"

                :
                "remained stable";


    title.innerText =

        `${biggest.name} ${direction}`;


    text.innerText =

        `${biggest.name} changed by `
        +
        `${Math.abs(biggest.difference).toFixed(1)}`
        +
        `${biggest.unit ? " " + biggest.unit : ""} `
        +
        "from the first to the latest measurement.";
}


/* =========================================================
   MAIN SIGNAL CHART
========================================================= */

function drawSignalChart(
    history
) {

    const line =
        document.getElementById(
            "signalLine"
        );


    const pointsGroup =
        document.getElementById(
            "signalPoints"
        );


    if (
        !history
        ||
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


    const width =
        700;


    const top =
        10;


    const usableHeight =
        240;


    const coordinates =

        history.map(
            (
                value,
                index
            ) => {

                const x =

                    history.length === 1

                        ?
                        width / 2

                        :
                        index
                        *
                        (
                            width
                            /
                            (
                                history.length
                                -
                                1
                            )
                        );


                const y =

                    top
                    +
                    (
                        1
                        -
                        Math.max(
                            0,
                            Math.min(
                                value,
                                1
                            )
                        )
                    )
                    *
                    usableHeight;


                return {
                    x,
                    y,
                    value
                };
            }
        );


    line.setAttribute(

        "points",

        coordinates

            .map(
                point =>
                    `${point.x},${point.y}`
            )

            .join(" ")
    );


    pointsGroup.innerHTML =

        coordinates

            .map(
                (
                    point,
                    index
                ) => `

                    <circle
                        class="signal-point"
                        cx="${point.x}"
                        cy="${point.y}"
                        r="6"
                    >

                        <title>
                            ${
                                measurementHistory[index]
                                ?.timestamp
                                ||
                                ""
                            }
                            —
                            ${Math.round(point.value * 100)}/100
                        </title>

                    </circle>

                `
            )

            .join("");
}


/* =========================================================
   MAIN TIME LABELS
========================================================= */

function updateMainTimeLabels() {

    const element =
        document.getElementById(
            "timeLabels"
        );


    if (
        measurementHistory.length === 0
    ) {

        element.innerHTML =
            "";

        return;
    }


    const timestamps =
        measurementHistory.map(
            item =>
                item.timestamp
                ||
                ""
        );


    if (
        timestamps.length === 1
    ) {

        element.innerHTML = `

            <span></span>

            <span>
                ${timestamps[0]}
            </span>

            <span></span>

        `;

        return;
    }


    const first =
        timestamps[0];


    const middle =
        timestamps[
            Math.floor(
                timestamps.length
                /
                2
            )
        ];


    const last =
        timestamps[
            timestamps.length
            -
            1
        ];


    element.innerHTML = `

        <span>
            ${first}
        </span>

        <span>
            ${middle}
        </span>

        <span>
            ${last}
        </span>

    `;
}


/* =========================================================
   QUICK ADD + ANALYZE
========================================================= */

async function addAndAnalyze() {

    try {

        const measurement =
            getInputMeasurement();


        measurementHistory.push(
            measurement
        );


        updateHistoryPreview();


        await analyzeHistory();

    } catch (error) {

        showError(
            error.message
        );
    }
}


/* =========================================================
   UNDO
========================================================= */

async function undoLastMeasurement() {

    if (
        measurementHistory.length === 0
    ) {

        showError(
            "There are no measurements to undo."
        );

        return;
    }


    measurementHistory.pop();


    updateHistoryPreview();


    if (
        measurementHistory.length === 0
    ) {

        latestAnalysis =
            null;


        resetDashboard();

        drawVitalsExplorer();

        updateNextStep();

        return;
    }


    const latest =
        measurementHistory[
            measurementHistory.length
            -
            1
        ];


    setInputMeasurement(
        latest
    );


    await analyzeHistory();
}


/* =========================================================
   DUPLICATE LAST
========================================================= */

async function duplicateLastMeasurement() {

    try {

        let source;


        if (
            measurementHistory.length > 0
        ) {

            source =
                measurementHistory[
                    measurementHistory.length
                    -
                    1
                ];

        } else {

            source =
                getInputMeasurement();
        }


        const duplicate = {

            hr:
                source.hr,

            temperature:
                source.temperature,

            wbc:
                source.wbc,

            lactate:
                source.lactate,

            timestamp:
                getCurrentTime()
        };


        measurementHistory.push(
            duplicate
        );


        setInputMeasurement(
            duplicate
        );


        updateHistoryPreview();


        await analyzeHistory();

    } catch (error) {

        showError(
            error.message
        );
    }
}


/* =========================================================
   REPLAY
========================================================= */

function wait(milliseconds) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );
}


async function replayTimeline() {

    if (replayInProgress) {
        return;
    }


    if (
        measurementHistory.length < 2
    ) {

        showError(
            "Add at least two measurements before replaying the timeline."
        );

        return;
    }


    replayInProgress =
        true;


    const button =
        document.getElementById(
            "replayButton"
        );


    button.disabled =
        true;


    button.innerText =
        "⏳ Replaying...";


    const original =

        measurementHistory.map(
            point => ({
                ...point
            })
        );


    const replayPoints =

        original.length > 12

            ?
            original.slice(-12)

            :
            original;


    measurementHistory =
        [];


    latestAnalysis =
        null;


    resetDashboard();

    updateHistoryPreview();


    for (
        const point
        of replayPoints
    ) {

        measurementHistory.push({
            ...point
        });


        setInputMeasurement(
            point
        );


        updateHistoryPreview();


        await analyzeHistory();


        await wait(
            650
        );
    }


    replayInProgress =
        false;


    button.disabled =
        false;


    button.innerText =
        "▶ Replay Timeline";
}


/* =========================================================
   EXPLORER
========================================================= */

function setExplorerMetric(
    metric,
    button
) {

    selectedExplorerMetric =
        metric;


    document
        .querySelectorAll(
            ".chart-tab"
        )
        .forEach(
            tab =>
                tab.classList.remove(
                    "active"
                )
        );


    button.classList.add(
        "active"
    );


    drawVitalsExplorer();
}


function drawVitalsExplorer() {

    const line =
        document.getElementById(
            "vitalsLine"
        );


    const pointsGroup =
        document.getElementById(
            "vitalsPoints"
        );


    const title =
        document.getElementById(
            "explorerTitle"
        );


    const range =
        document.getElementById(
            "explorerRange"
        );


    const labels =
        document.getElementById(
            "vitalsTimeLabels"
        );


    let values =
        [];


    let label =
        "";


    let unit =
        "";


    if (
        selectedExplorerMetric ===
        "score"
    ) {

        label =
            "BioSignal Warning Score";


        unit =
            "/100";


        if (
            latestAnalysis
            &&
            latestAnalysis.history
        ) {

            values =

                latestAnalysis.history.map(
                    value =>
                        value * 100
                );
        }

    } else {

        const settings = {

            hr: {
                label:
                    "Heart Rate",

                unit:
                    " BPM"
            },

            temperature: {
                label:
                    "Temperature",

                unit:
                    " °C"
            },

            wbc: {
                label:
                    "White Blood Cells",

                unit:
                    " ×10⁹/L"
            },

            lactate: {
                label:
                    "Lactate",

                unit:
                    " mmol/L"
            }
        };


        const setting =
            settings[
                selectedExplorerMetric
            ];


        label =
            setting.label;


        unit =
            setting.unit;


        values =

            measurementHistory.map(
                measurement =>
                    measurement[
                        selectedExplorerMetric
                    ]
            );
    }


    title.innerText =
        label;


    if (
        values.length === 0
    ) {

        line.setAttribute(
            "points",
            ""
        );


        pointsGroup.innerHTML =
            "";


        range.innerText =
            "No data";


        labels.innerHTML =
            "";


        return;
    }


    let minimum;

    let maximum;


    if (
        selectedExplorerMetric ===
        "score"
    ) {

        minimum =
            0;

        maximum =
            100;

    } else {

        minimum =
            Math.min(
                ...values
            );


        maximum =
            Math.max(
                ...values
            );


        let padding =

            (
                maximum
                -
                minimum
            )
            *
            0.18;


        if (
            padding === 0
        ) {

            padding =
                Math.max(
                    Math.abs(
                        maximum
                    )
                    *
                    0.10,
                    1
                );
        }


        minimum -=
            padding;


        maximum +=
            padding;
    }


    const left =
        25;


    const top =
        20;


    const width =
        655;


    const height =
        195;


    const span =
        maximum
        -
        minimum
        ||
        1;


    const coordinates =

        values.map(
            (
                value,
                index
            ) => {

                const x =

                    values.length === 1

                        ?
                        left
                        +
                        width / 2

                        :
                        left
                        +
                        index
                        *
                        (
                            width
                            /
                            (
                                values.length
                                -
                                1
                            )
                        );


                const y =

                    top
                    +
                    height
                    -
                    (
                        (
                            value
                            -
                            minimum
                        )
                        /
                        span
                    )
                    *
                    height;


                return {
                    x,
                    y,
                    value
                };
            }
        );


    line.setAttribute(

        "points",

        coordinates

            .map(
                point =>
                    `${point.x},${point.y}`
            )

            .join(" ")
    );


    pointsGroup.innerHTML =

        coordinates

            .map(
                (
                    point,
                    index
                ) => `

                    <circle
                        class="explorer-point"
                        cx="${point.x}"
                        cy="${point.y}"
                        r="6"
                    >

                        <title>
                            ${
                                measurementHistory[index]
                                ?.timestamp
                                ||
                                ""
                            }
                            —
                            ${point.value.toFixed(1)}${unit}
                        </title>

                    </circle>

                `
            )

            .join("");


    range.innerText =

        `${Math.min(...values).toFixed(1)}${unit}`
        +
        " → "
        +
        `${Math.max(...values).toFixed(1)}${unit}`;


    const timestamps =

        measurementHistory.map(
            measurement =>
                measurement.timestamp
                ||
                ""
        );


    if (
        timestamps.length === 0
    ) {

        labels.innerHTML =
            "";

        return;
    }


    const first =
        timestamps[0];


    const middle =
        timestamps[
            Math.floor(
                timestamps.length
                /
                2
            )
        ];


    const last =
        timestamps[
            timestamps.length
            -
            1
        ];


    labels.innerHTML = `

        <span>
            ${first}
        </span>

        <span>
            ${middle}
        </span>

        <span>
            ${last}
        </span>

    `;
}


/* =========================================================
   NEXT STEP / TRIAGE DISPLAY
========================================================= */

function updateNextStep(
    data = latestAnalysis
) {

    const card =
        document.getElementById(
            "nextStepCard"
        );


    const icon =
        document.getElementById(
            "nextStepIcon"
        );


    const title =
        document.getElementById(
            "nextStepTitle"
        );


    const text =
        document.getElementById(
            "nextStepText"
        );


    const redFlags =

        document.querySelectorAll(
            "[data-red-flag]:checked"
        );


    const concerning =

        document.querySelectorAll(
            "[data-concerning]:checked"
        );


    /*
        Symptoms marked as emergency warning signs
        override the prototype BioSignal score.
    */

    if (
        redFlags.length > 0
    ) {

        card.className =
            "next-step-card next-emergency";


        icon.innerText =
            "🚨";


        title.innerText =
            "Urgent medical attention";


        text.innerText =

            "An emergency warning symptom was selected. "
            +
            "Do not rely on the BioSignal score. "
            +
            "Seek urgent medical help. "
            +
            "Use your local emergency number; in Romania and the EU, 112 is the emergency number.";


        return;
    }


    if (
        concerning.length > 0
    ) {

        card.className =
            "next-step-card next-elevated";


        icon.innerText =
            "⚠";


        title.innerText =
            "Consider medical evaluation";


        text.innerText =

            "You entered symptoms that may occur during significant illness. "
            +
            "BioSignal cannot determine their cause. "
            +
            "Contact a healthcare professional if symptoms are worsening or you are concerned.";


        return;
    }


    if (!data) {

        card.className =
            "next-step-card next-neutral";


        icon.innerText =
            "○";


        title.innerText =
            "Run an analysis";


        text.innerText =

            "Enter measurements or choose a demo patient to generate contextual guidance.";


        return;
    }


    if (
        data.level ===
        "STRONG"
    ) {

        card.className =
            "next-step-card next-strong";


        icon.innerText =
            "▲";


        title.innerText =
            "Prompt medical review may be appropriate";


        text.innerText =

            "BioSignal detected a strong prototype pattern. "
            +
            "This is not a diagnosis. "
            +
            "If the person is unwell, worsening, or has concerning symptoms, seek professional medical assessment promptly.";


        return;
    }


    if (
        data.level ===
        "ELEVATED"
    ) {

        card.className =
            "next-step-card next-elevated";


        icon.innerText =
            "△";


        title.innerText =
            "Elevated prototype signal";


        text.innerText =

            "Several measurements are contributing to an elevated prototype signal. "
            +
            "Continue monitoring and consider contacting a healthcare professional if symptoms are concerning or worsening.";


        return;
    }


    card.className =
        "next-step-card next-low";


    icon.innerText =
        "✓";


    title.innerText =
        "Low prototype signal";


    text.innerText =

        "No strong warning pattern is currently displayed. "
        +
        "A low BioSignal score does not rule out serious illness. "
        +
        "Seek medical care if symptoms are concerning.";
}


/* =========================================================
   SYMPTOMS
========================================================= */

function clearSymptoms() {

    document
        .querySelectorAll(
            "[data-red-flag], [data-concerning]"
        )
        .forEach(
            checkbox => {

                checkbox.checked =
                    false;
            }
        );


    updateNextStep();
}


/* =========================================================
   MEDICATION PANEL
========================================================= */

function toggleMedicationSafety() {

    document
        .getElementById(
            "medicationSafety"
        )
        .classList.toggle(
            "interactive-hidden"
        );
}


/* =========================================================
   RESET
========================================================= */

function clearHistory() {

    measurementHistory =
        [];


    latestAnalysis =
        null;


    clearSymptoms();

    updateHistoryPreview();

    resetDashboard();

    drawVitalsExplorer();
}


function resetDashboard() {

    if (scoreAnimation) {

        cancelAnimationFrame(
            scoreAnimation
        );
    }


    document.getElementById(
        "score"
    ).innerText =
        "0";


    const level =
        document.getElementById(
            "level"
        );


    level.innerText =
        "WAITING";


    level.className =
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
        "alertBanner"
    ).className =
        "alert-banner hidden";


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


    [
        "deltaHr",
        "deltaTemp",
        "deltaWbc",
        "deltaLactate"
    ].forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            element.innerText =
                "—";


            element.className =
                "measurement-delta neutral-delta";
        }
    );


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
    ).innerHTML = `

        <div class="reason-item muted">
            Analysis reasons will appear here.
        </div>

    `;


    [
        "barHr",
        "barTemperature",
        "barWbc",
        "barLactate"
    ].forEach(
        id => {

            document.getElementById(
                id
            ).style.width =
                "0%";
        }
    );


    [
        "valueHr",
        "valueTemperature",
        "valueWbc",
        "valueLactate"
    ].forEach(
        id => {

            document.getElementById(
                id
            ).innerText =
                "--";
        }
    );


    document.getElementById(
        "signalLine"
    ).setAttribute(
        "points",
        ""
    );


    document.getElementById(
        "signalPoints"
    ).innerHTML =
        "";


    document.getElementById(
        "timeLabels"
    ).innerHTML =
        "";


    document.getElementById(
        "pointCount"
    ).innerText =
        "0 points";


    updateNextStep();
}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    const banner =
        document.getElementById(
            "alertBanner"
        );


    banner.className =
        "alert-banner error-alert";


    document.getElementById(
        "alertTitle"
    ).innerText =
        "Unable to complete action";


    document.getElementById(
        "alertText"
    ).innerText =
        message;
}


/* =========================================================
   NUMBER FORMAT
========================================================= */

function formatNumber(value) {

    const number =
        Number(value);


    if (
        Number.isNaN(number)
    ) {

        return "--";
    }


    if (
        Number.isInteger(number)
    ) {

        return number.toString();
    }


    return number
        .toFixed(1)
        .replace(
            /\.0$/,
            ""
        );
}


/* =========================================================
   INITIAL STATE
========================================================= */

updateHistoryPreview();

resetDashboard();

drawVitalsExplorer();

updateNextStep();
