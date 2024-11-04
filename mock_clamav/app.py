import logging
import json
from flask import Flask, request

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)

@app.route("/scan", methods=["POST"])
def clamav():
    mock_clamav_response = "Everything ok : true\n"

    logging.info(f"Request data : {str(request.files)}")
    return mock_clamav_response


if __name__ == '__main__':
    app.run('0.0.0.0',port=8080)