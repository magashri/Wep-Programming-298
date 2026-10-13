from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

DATABASE = os.path.join(os.path.dirname(__file__), "tripmate.db")


def get_db():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def create_tables():
    connection = get_db()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS trips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            destination TEXT NOT NULL,
            start_date TEXT,
            end_date TEXT,
            budget REAL DEFAULT 0,
            travel_type TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trip_id INTEGER,
            name TEXT,
            amount REAL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS itinerary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trip_id INTEGER,
            day TEXT,
            activity TEXT,
            time TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS packing (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trip_id INTEGER,
            name TEXT,
            completed INTEGER DEFAULT 0
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pre_trip (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trip_id INTEGER,
            task TEXT,
            completed INTEGER DEFAULT 0
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS hotels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trip_id INTEGER,
            hotel_name TEXT,
            hotel_address TEXT,
            check_in TEXT,
            check_out TEXT,
            booking_reference TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trip_id INTEGER,
            transport_type TEXT,
            departure_location TEXT,
            arrival_location TEXT,
            departure_date TEXT,
            departure_time TEXT,
            arrival_date TEXT,
            arrival_time TEXT,
            ticket_reference TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trip_id INTEGER,
            booking_type TEXT,
            booking_name TEXT,
            booking_date TEXT,
            booking_reference TEXT,
            booking_status TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trip_id INTEGER,
            notes TEXT
        )
    """)

    connection.commit()
    connection.close()


@app.route("/")
def home():
    return jsonify({
        "status": "success",
        "message": "TripMate Backend Running"
    })


@app.route("/api/test-db")
def test_database():
    try:
        connection = get_db()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT name
            FROM sqlite_master
            WHERE type='table'
        """)

        tables = [row["name"] for row in cursor.fetchall()]

        connection.close()

        return jsonify({
            "status": "success",
            "database": "tripmate.db",
            "tables": tables
        })

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500


@app.route("/api/trips", methods=["POST"])
def create_trip():

    data = request.json

    connection = get_db()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO trips
        (destination, start_date, end_date, budget, travel_type)
        VALUES (?, ?, ?, ?, ?)
    """, (
        data.get("destination"),
        data.get("startDate"),
        data.get("endDate"),
        data.get("budget", 0),
        data.get("travelType", "Solo")
    ))

    connection.commit()

    trip_id = cursor.lastrowid

    connection.close()

    return jsonify({
        "status": "success",
        "trip_id": trip_id
    })


if __name__ == "__main__":
    create_tables()

    print("================================")
    print(" TripMate Backend Starting...")
    print(" Database: tripmate.db")
    print(" URL: http://127.0.0.1:5000")
    print("================================")

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )