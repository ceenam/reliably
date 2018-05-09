"""
Flask app serving dashboard and generating data endpoints
"""

import sqlalchemy
import os
from flask import Flask, render_template, jsonify
import numpy as np

app = Flask(__name__)
engine = sqlalchemy.create_engine(os.getenv("DATABASE_URL"))
connection = engine.connect()


@app.route("/hello")
def hello_world():
    return "Reliably is born."


@app.route("/")
def dashboard():
    return render_template("index.html")


@app.route("/data/flow")
def flow_data():
    """Returns json of factors impacting flow"""
    sql_query = "SELECT vibration_sensor, pressure, flow FROM system_monitoring " \
                "ORDER BY timestamp DESC LIMIT 1"
    max_time_table = connection.execute(sql_query).first()

    flow = dict(vibration=max_time_table["vibration_sensor"],
                pressure=max_time_table["pressure"],
                true_flow=max_time_table["flow"])

    coeff1 = 3*flow["vibration"] + 3*flow["pressure"]
    coeff2 = 12*flow["vibration"] + 3*flow["pressure"]

    if abs(flow["true_flow"] - coeff1) < abs(flow["true_flow"] - coeff2):
        flow["coeff1"] = 3 + np.random.normal(0, .4)
        flow["coeff2"] = 3 - np.random.normal(0, .4)

    else:
        flow["coeff1"] = 12 - np.random.normal(0, .4)
        flow["coeff2"] = 3 + np.random.normal(0, .4)

    flow["expect_flow"] = flow["coeff1"] * flow["vibration"] + \
                       flow["coeff2"] * flow["pressure"]

    return jsonify(flow)


@app.route("/data/power")
def power_data():
    """
    Fetches historical power consumption and 
        determines if current consumption is anomalous

    Returns: json with minutes and anomalous flag (green, yellow, red)
    """
    power = {}
    query = connection.execute("SELECT * FROM system_monitoring \
                               ORDER BY timestamp DESC LIMIT 30")

    for i, row in enumerate(query):
        power[str(i+1)] = row["power_consumption"]

    if power["5"] < 53 or power["5"] > 113:
        power["anomalous"] = "red"
    else:
        power["anomalous"] = "green"

    return jsonify(power)


if __name__ == "__main__":
    app.run(debug=True)

