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

    return {

        hr: Number(
            document.getElementById(
                "hr"
            ).value
        ),

        temperature: Number(
            document.getElementById(
                "temperature"
            ).value
        ),

        wbc: Number(
            document.getElementById(
                "wbc"
            ).value
        ),

        lactate: Number(
            document.getElementById(
                "lactate"
            ).value
        )

    };

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


function addMeasurement() {

    const measurement =
        getInputMeasurement();


    measurementHistory.push(
        measurement
    );


    updateHistoryPreview();

}


function clearHistory() {

    measurementHistory = [];

    updateHistoryPreview();

    resetDashboard();

}


function updateHistoryPreview() {

    const preview =
        document.getElementById(
            "historyPreview"
        );


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
                        #${index + 1}
                        HR ${measurement.hr},
                        ${measurement.temperature}°C,
                        WBC ${measurement.wbc},
                        Lactate ${measurement.lactate}
                    </span>
                    `

            )
            .join("");

}


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
                data.error
                || "Analysis failed"
            );
        }


        updateDashboard(
            data
        );


    } catch (error) {

        document.getElementById(
            "statusText"
        ).innerText =
            error.message;

    }

}


function loadDemo(name) {

    const demo =
        demos[name];


    measurementHistory =
        demo.map(
            measurement => ({
                ...measurement
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


function updateDashboard(data) {

    document.getElementById(
        "score"
    ).innerText =
        data.percentage;


    const level =
        document.getElementById(
            "level"
        );


    level.innerText =
        `${data.level} SIGNAL`;


    level.className =
        "signal-pill "
        + data.level.toLowerCase();


    const symbols = {

        RISING: "↑",

        FALLING: "↓",

        STABLE: "→"

    };


    document.getElementById(
        "trend"
    ).innerText =
        `${symbols[data.trend]} ${data.trend}`;


    updateHeroMeasurements(
        data.current
    );


    updateReasons(
        data.reasons
    );


    updateContributors(
        data.contributors
    );


    drawChart(
        data.history
    );


    document.getElementById(
        "pointCount"
    ).innerText =
        `${data.measurement_count} points`;


    document.getElementById(
        "statusText"
    ).innerText =
        `Current BioSignal warning score: `
        + `${data.percentage}/100. `
        + `Trend: ${data.trend}.`;

}


function updateHeroMeasurements(
    current
) {

    document.getElementById(
        "heroHr"
    ).innerText =
        `${current.hr} BPM`;


    document.getElementById(
        "heroTemp"
    ).innerText =
        `${current.temperature}°C`;


    document.getElementById(
        "heroWbc"
    ).innerText =
        current.wbc;


    document.getElementById(
        "heroLactate"
    ).innerText =
        current.lactate;

}


function updateReasons(
    reasons
) {

    document.getElementById(
        "reasons"
    ).innerHTML =

        reasons
            .map(
                reason =>
                    `
                    <div class="reason-item">
                        ${reason}
                    </div>
                    `
            )
            .join("");

}


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


    for (
        const [
            key,
            barId,
            valueId
        ] of mapping
    ) {

        const value =
            contributors[key] || 0;


        const percentage =
            Math.round(
                value * 100
            );


        document.getElementById(
            barId
        ).style.width =
            `${percentage}%`;


        document.getElementById(
            valueId
        ).innerText =
            `${percentage}%`;

    }

}


function drawChart(
    history
) {

    const width = 700;
    const height = 260;

    const padding = 14;


    const line =
        document.getElementById(
            "signalLine"
        );


    const group =
        document.getElementById(
            "signalPoints"
        );


    if (
        !history
        || history.length === 0
    ) {

        line.setAttribute(
            "points",
            ""
        );

        group.innerHTML = "";

        return;

    }


    const coordinates =
        history.map(
            (value, index) => {

                let x;


                if (
                    history.length === 1
                ) {

                    x =
                        width / 2;

                } else {

                    x =
                        padding
                        +
                        (
                            index
                            /
                            (
                                history.length
                                - 1
                            )
                        )
                        *
                        (
                            width
                            - padding * 2
                        );

                }


                const y =
                    padding
                    +
                    (
                        1 - value
                    )
                    *
                    (
                        height
                        - padding * 2
                    );


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


    group.innerHTML =
        coordinates
            .map(
                point =>

                    `
                    <circle
                        class="signal-point"
                        cx="${point.x}"
                        cy="${point.y}"
                        r="6"
                    ></circle>
                    `

            )
            .join("");

}


function resetDashboard() {

    document.getElementById(
        "score"
    ).innerText =
        "--";


    document.getElementById(
        "level"
    ).innerText =
        "WAITING";


    document.getElementById(
        "trend"
    ).innerText =
        "— NO TREND";


    drawChart([]);

}


window.addEventListener(
    "DOMContentLoaded",
    () => {

        resetDashboard();

        loadDemo(
            "rising"
        );

    }
);
