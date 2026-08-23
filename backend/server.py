from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import urlparse
import json
import mimetypes

from algorithm import analyze_patient
from signal_engine import build_signal_summary


# ---------------------------------------------------------
# SERVER SETTINGS
# ---------------------------------------------------------

HOST = "127.0.0.1"
PORT = 8000


# ---------------------------------------------------------
# PROJECT FOLDERS
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent

FRONTEND_DIR = PROJECT_ROOT / "frontend"
ASSETS_DIR = PROJECT_ROOT / "assets"


# ---------------------------------------------------------
# HTTP SERVER
# ---------------------------------------------------------

class Server(BaseHTTPRequestHandler):

    # -----------------------------------------------------
    # SEND JSON
    # -----------------------------------------------------

    def send_json(self, data, status=200):

        body = json.dumps(
            data,
            indent=2
        ).encode("utf-8")

        self.send_response(status)

        self.send_header(
            "Content-Type",
            "application/json; charset=utf-8"
        )

        self.send_header(
            "Content-Length",
            str(len(body))
        )

        self.send_header(
            "Access-Control-Allow-Origin",
            "*"
        )

        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type"
        )

        self.end_headers()

        self.wfile.write(body)


    # -----------------------------------------------------
    # SEND STATIC FILE
    # -----------------------------------------------------

    def send_file(self, file_path):

        file_path = Path(file_path)

        if (
            not file_path.exists()
            or not file_path.is_file()
        ):

            self.send_json(
                {
                    "error": "File not found"
                },
                404
            )

            return


        try:

            content = file_path.read_bytes()


            content_type, _ = mimetypes.guess_type(
                str(file_path)
            )


            if content_type is None:

                content_type = (
                    "application/octet-stream"
                )


            # Make sure SVG files render correctly
            if file_path.suffix.lower() == ".svg":

                content_type = "image/svg+xml"


            self.send_response(200)

            self.send_header(
                "Content-Type",
                content_type
            )

            self.send_header(
                "Content-Length",
                str(len(content))
            )

            self.send_header(
                "Cache-Control",
                "no-cache"
            )

            self.end_headers()

            self.wfile.write(content)


        except Exception as error:

            self.send_json(
                {
                    "error": "Could not read file",
                    "details": str(error)
                },
                500
            )


    # -----------------------------------------------------
    # OPTIONS
    # -----------------------------------------------------

    def do_OPTIONS(self):

        self.send_response(200)

        self.send_header(
            "Access-Control-Allow-Origin",
            "*"
        )

        self.send_header(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS"
        )

        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type"
        )

        self.end_headers()


    # -----------------------------------------------------
    # GET
    # -----------------------------------------------------

    def do_GET(self):

        path = urlparse(self.path).path


        # ---------------------------------------------
        # API health check
        # ---------------------------------------------

        if path == "/health":

            self.send_json(
                {
                    "status": "ok",
                    "service": "BioSignal"
                }
            )

            return


        # ---------------------------------------------
        # Main frontend page
        # ---------------------------------------------

        if path in (
            "/",
            "/index.html"
        ):

            self.send_file(
                FRONTEND_DIR / "index.html"
            )

            return


        # ---------------------------------------------
        # CSS
        # ---------------------------------------------

        if path == "/style.css":

            self.send_file(
                FRONTEND_DIR / "style.css"
            )

            return


        # ---------------------------------------------
        # JavaScript
        # ---------------------------------------------

        if path == "/app.js":

            self.send_file(
                FRONTEND_DIR / "app.js"
            )

            return


        # ---------------------------------------------
        # ASSETS
        #
        # Example:
        # /assets/logo.svg
        # /assets/background.png
        # /assets/icons/heart.svg
        # ---------------------------------------------

        if path.startswith("/assets/"):

            relative_path = path[
                len("/assets/"):
            ]


            requested_file = (
                ASSETS_DIR
                / relative_path
            ).resolve()


            assets_root = (
                ASSETS_DIR.resolve()
            )


            # Security:
            # Prevent things such as:
            #
            # /assets/../backend/server.py

            try:

                requested_file.relative_to(
                    assets_root
                )

            except ValueError:

                self.send_json(
                    {
                        "error":
                            "Invalid asset path"
                    },
                    403
                )

                return


            self.send_file(
                requested_file
            )

            return


        # ---------------------------------------------
        # NOT FOUND
        # ---------------------------------------------

        self.send_json(
            {
                "error": "Not found"
            },
            404
        )


    # -----------------------------------------------------
    # POST
    # -----------------------------------------------------

    def do_POST(self):

        path = urlparse(self.path).path


        # Only POST endpoint
        if path != "/predict":

            self.send_json(
                {
                    "error": "Not found"
                },
                404
            )

            return


        try:

            # -----------------------------------------
            # Read request
            # -----------------------------------------

            length = int(
                self.headers.get(
                    "Content-Length",
                    0
                )
            )


            if length <= 0:

                raise ValueError(
                    "Request body is empty"
                )


            body = self.rfile.read(
                length
            )


            data = json.loads(
                body.decode("utf-8")
            )


            # -----------------------------------------
            # Read measurement history
            # -----------------------------------------

            history = data.get(
                "history"
            )


            # Also support a single measurement
            if history is None:

                history = [
                    {
                        "hr":
                            data["hr"],

                        "temperature":
                            data["temperature"],

                        "wbc":
                            data["wbc"],

                        "lactate":
                            data["lactate"]
                    }
                ]


            # -----------------------------------------
            # Validate history
            # -----------------------------------------

            if not isinstance(
                history,
                list
            ):

                raise ValueError(
                    "history must be a list"
                )


            if len(history) == 0:

                raise ValueError(
                    "history cannot be empty"
                )


            if len(history) > 50:

                raise ValueError(
                    "Maximum history length "
                    "is 50 measurements"
                )


            # -----------------------------------------
            # Analyze every measurement
            # -----------------------------------------

            normalized_history = []
            analyses = []


            for point in history:

                if not isinstance(
                    point,
                    dict
                ):

                    raise ValueError(
                        "Each measurement "
                        "must be an object"
                    )


                measurement = {

                    "hr":
                        float(
                            point["hr"]
                        ),

                    "temperature":
                        float(
                            point[
                                "temperature"
                            ]
                        ),

                    "wbc":
                        float(
                            point["wbc"]
                        ),

                    "lactate":
                        float(
                            point[
                                "lactate"
                            ]
                        )
                }


                analysis = analyze_patient(

                    measurement["hr"],

                    measurement[
                        "temperature"
                    ],

                    measurement["wbc"],

                    measurement[
                        "lactate"
                    ]
                )


                normalized_history.append(
                    measurement
                )

                analyses.append(
                    analysis
                )


            # -----------------------------------------
            # Signal engine
            # -----------------------------------------

            summary = build_signal_summary(

                normalized_history,

                analyses
            )


            current_measurement = (
                normalized_history[-1]
            )


            current_analysis = (
                analyses[-1]
            )


            # -----------------------------------------
            # Final API response
            # -----------------------------------------

            response = {

                **summary,

                "current":
                    current_measurement,

                "contributors":
                    current_analysis[
                        "contributors"
                    ],

                "measurement_count":
                    len(
                        normalized_history
                    ),

                "disclaimer":
                    (
                        "Research prototype only. "
                        "The BioSignal warning score "
                        "is not a medical diagnosis "
                        "or a clinically validated "
                        "probability."
                    )
            }


            self.send_json(
                response
            )


        # ---------------------------------------------
        # USER / INPUT ERRORS
        # ---------------------------------------------

        except (
            KeyError,
            TypeError,
            ValueError,
            json.JSONDecodeError
        ) as error:

            self.send_json(
                {
                    "error": str(error)
                },
                400
            )


        # ---------------------------------------------
        # SERVER ERROR
        # ---------------------------------------------

        except Exception as error:

            self.send_json(
                {
                    "error":
                        "Unexpected server error",

                    "details":
                        str(error)
                },
                500
            )


# ---------------------------------------------------------
# START SERVER
# ---------------------------------------------------------

if __name__ == "__main__":

    print()
    print("=" * 45)
    print("           BioSignal")
    print("=" * 45)
    print()
    print("BioSignal server is running.")
    print()
    print(
        f"Open: http://{HOST}:{PORT}"
    )
    print()
    print(
        "Press CTRL + C to stop the server."
    )
    print()


    server = HTTPServer(
        (
            HOST,
            PORT
        ),
        Server
    )


    try:

        server.serve_forever()


    except KeyboardInterrupt:

        print()
        print(
            "BioSignal server stopped."
        )


    finally:

        server.server_close()
