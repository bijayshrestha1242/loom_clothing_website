from flask import Flask, jsonify, send_from_directory, request, session
import sqlite3
from pathlib import Path
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = "loom-is-the-best"

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
        "register.html",
        "login.html",
        "script.js",
        "style.css"
    ]

    if filename in allowed_files:
        return send_from_directory(app.root_path, filename)

    return "File not found", 404

@app.route("/add-product", methods=["POST"])
def add_product():
    product = request.get_json()

    connection = sqlite3.connect(database)

    category = connection.execute(
        "SELECT category_id FROM categories WHERE name = ?",
        (product["category"],)
    ).fetchone()

    if category is None:
        connection.close()
        return jsonify({"message": "Category not found"}), 404

    connection.execute("""INSERT INTO products (category_id, name, description, price, image_url, status) VALUES (?, ?, ?, ?, ?, ?)""", (category[0], product["name"], product["description"], product["price"], product["image"], "active"))

    connection.commit()
    connection.close()

    return jsonify({"message": "Product added successfully!"})

@app.route("/remove-product",
methods=["POST"])
def remove_product():
    product = request.get_json()

    connection = sqlite3.connect(database)
    cursor = connection.execute("DELETE FROM products WHERE name = ?", (product["name"],))

    connection.commit()
    connection.close()

    if cursor.rowcount == 0: return jsonify({"message": "Product not found"}), 404

    return jsonify({"message": "Product removed successfully!"})

@app.route("/edit-product", methods=["POST"])
def edit_product():
    product = request.get_json()

    connection = sqlite3.connect(database)
    cursor = connection.execute("""UPDATE products SET description = ?, price = ? WHERE name = ?""", (product["description"], product["price"], product["name"]))

    connection.commit()
    connection.close()

    if cursor.rowcount == 0:
        return jsonify({"message": "Product not found"}), 404

    return jsonify({"message": "Product updated successfully!"})

@app.route("/register", methods=["POST"])
def register():
    customer = request.get_json()

    name = customer.get("name", "").strip()
    email = customer.get("email", "").strip().lower()
    password = customer.get("password","")

    if not name or not email or not password:
        return jsonify({"message": "Please fill all fields"}), 400
    
    connection = sqlite3.connect(database)
    existing = connection.execute("SELECT user_id FROM Customers WHERE email = ?", (email,)).fetchone()

    if existing:
        connection.close()
        return jsonify({"message": "Email already registered"}), 400

    hashed_password = generate_password_hash(password)

    connection.execute("INSERT INTO Customers (name, email, password) VALUES (?, ?, ?)", (name, email, hashed_password))
    connection.commit()
    connection.close()

    return jsonify({"message": "Account has been created!"})


@app.route("/login", methods=["POST"])
def login():
    customer = request.get_json()

    email = customer.get("email", "").strip().lower()
    password = customer.get("password", "")

    connection = sqlite3.connect(database)
    connection.row_factory = sqlite3.Row

    user = connection.execute(
        "SELECT * FROM Customers WHERE email = ?",
        (email,)
    ).fetchone()

    connection.close()

    if user is None or not check_password_hash(user["password"], password):
        return jsonify({"message": "Incorrect email or password"}), 401

    session.clear()
    session["user_id"] = user["user_id"]
    session["name"] = user["name"]

    return jsonify({"message": "Login successful!"})

@app.route("/check-login")
def check_login():
    if "user_id" in session:
        return jsonify({
            "logged_in": True,
            "name": session["name"]
        })

        return jsonify({"logged_in": False})

@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"})

if __name__ == "__main__":
    app.run(debug=True)