from flask import Flask, jsonify, send_from_directory
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

    products = connection.execute("""SELECT products.*, categories.name AS category_name FROM products JOIN categories ON products.category_id = categories.category_id""").fetchall()
    connection.close()

    return jsonify([dict(product) for product in products])

@app.route("/mens_clothing.html")
def mens_page():
    return send_from_directory(app.root_path, "mens_clothing.html")

@app.route("/script.js")
def javascript():
    return send_from_directory(app.root_path, "script.js")

@app.route("/style.css")
def stylesheet():
    return send_from_directory(app.root_path, "style.css")

@app.route("/<path:filename>")
def website_files(filename):
    allowed_files = [
        "homepage.html",
        "mens_clothing.html",
        "womens_clothing.html",
        "checkout.html",
        "admin_page.html",
        "confirmation.html",
        "script.js",
        "style.css"
    ]

    if filename in allowed_files:
        return send_from_directory(app.root_path, filename)

    return "File not found", 404

if __name__ == "__main__":
    app.run(debug=True)