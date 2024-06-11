import logging
import json
from flask import Flask, request
from datetime import datetime

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
request_date = datetime.today().strftime('%a,%d %b %Y %H:%M:%S %Z')
mock_clamav_response = "Everything ok : true\n"

@app.route("/scan", methods=["POST"])
def clamav():
    logging.info(f"Request data : {str(request.data)}")
    return mock_clamav_response


if __name__ == '__main__':
    app.run('0.0.0.0',port=8080)