from flask import Flask, jsonify
import sqlite3
from pathlib import Path

app = Flask(__name__)

database = Path(__file__).with_name("Loom.db")

@app.route("/")
def home():
    return "Loom Clothing Database connecting is running!"

@app.route("/products")
def get_products():
    connection = sqlite3.connect(database)
    connection.row_factory = sqlite3.Row

    products = connection.execute("SELECT * FROM products").fetchall()
    connection.close()

    return jsonify([dict(product) for product in products])

if __name__ == "__main__":
    app.run(debug=True)