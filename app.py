from flask import Flask, jsonify, send_from_directory, request, session, redirect
import sqlite3
from pathlib import Path
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

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

@app.route("/admin_page.html")
def admin_page():
    if "admin_id" not in session:
        return redirect("/admin_login.html")

    return send_from_directory(app.root_path, "admin_page.html")

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
        "admin_login.html",
        "login.html",
        "order_history.html",
        "script.js",
        "style.css"
    ]

    if filename in allowed_files:
        return send_from_directory(app.root_path, filename)

    return "File not found", 404

@app.route("/add-product", methods=["POST"])
def add_product():
    if "admin_id" not in session:
        return jsonify({"message": "Admin login required"}), 403
   
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
    if "admin_id" not in session:
        return jsonify({"message": "Admin login required"}), 403
    
    product = request.get_json()

    connection = sqlite3.connect(database)
    cursor = connection.execute("DELETE FROM products WHERE name = ?", (product["name"],))

    connection.commit()
    connection.close()

    if cursor.rowcount == 0: return jsonify({"message": "Product not found"}), 404

    return jsonify({"message": "Product removed successfully!"})

@app.route("/edit-product", methods=["POST"])
def edit_product():
    if "admin_id" not in session:
        return jsonify({"message": "Admin login required"}), 403
        
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

@app.route("/admin-login", methods=["POST"])
def admin_login():
    details = request.get_json()

    email = details.get("email", "").strip().lower()
    password = details.get("password", "")

    connection = sqlite3.connect(database)
    connection.row_factory = sqlite3.Row

    admin = connection.execute(
        "SELECT * FROM Admin WHERE email = ?", (email,)).fetchone()

    connection.close()

    if admin is None or not check_password_hash(admin["password"], password):
        return jsonify({"message": "Incorrect email or password"}), 401
    
    session.clear()
    session["admin_id"] = admin["admin_id"]
    session["admin_name"] = admin["name"]

    return jsonify({"message": "Admin login successful"})

@app.route("/admin-logout", methods=["POST"])
def admin_logout():
    session.clear()
    return jsonify({"message": "Admin logout successful"})


@app.route("/place-order", methods=["POST"])
def save_order():
    if "user_id" not in session:
        return jsonify({"message": "Please log in before placing an order"}), 401

    details = request.get_json()
    cart = details.get("cart", [])
    delivery = details.get("delivery")
    address = details.get("address", "").strip()
    discount_code = details.get("discount_code", "").strip()

    if not cart:
        return jsonify({"message": "Your cart is empty"}), 400

    if delivery not in ["delivery", "pickup"]:
        return jsonify({"message": "Please select a delivery method"}), 400

    if delivery == "delivery" and not address:
        return jsonify({"message": "Please enter your delivery address"}), 400

    connection = sqlite3.connect(database)
    connection.row_factory = sqlite3.Row

    try:
        order_items = []
        subtotal = 0

        for item in cart:
            product = connection.execute(
                "SELECT product_id, name, price FROM products WHERE name = ? AND status = 'active'",
                (item["name"],)
            ).fetchall()

            if len(product) != 1:
                return jsonify({
                    "message": "A product in your cart is unavailable or has a duplicate name"
                }), 400

            price = round(float(product[0]["price"]), 2)
            subtotal += price

            order_items.append({
                "product_id": product[0]["product_id"],
                "price": price
            })

        subtotal = round(subtotal, 2)
        discount_amount = round(subtotal * 0.10, 2) if discount_code == "ILOVELOOM" else 0
        total = round(subtotal - discount_amount, 2)

        cursor = connection.execute("""
            INSERT INTO orders (user_id, order_date, status, subtotal, shipping_cost, total_amount)VALUES (?, ?, ?, ?, ?, ?)""", (
            session["user_id"],
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "Pending",
            subtotal,
            0,
            total
        ))

        order_id = cursor.lastrowid

        for item in order_items:
            connection.execute("""
                INSERT INTO order_items
                (order_id, product_id, quantity, unit_price, subtotal)
                VALUES (?, ?, ?, ?, ?)
            """, (
                order_id,
                item["product_id"],
                1,
                item["price"],
                item["price"]
            ))

        connection.execute("""
            INSERT INTO shipping
            (order_id, shipping_method, shipping_status)
            VALUES (?, ?, ?)
        """, (
            order_id,
            delivery,
            "Not shipped" if delivery == "delivery" else "Awaiting pickup"
        ))

        connection.commit()

        return jsonify({
            "message": "Order placed successfully!",
            "order_id": order_id,
            "total": total
        })

    except (sqlite3.Error, KeyError, TypeError, ValueError):
        connection.rollback()
        return jsonify({"message": "Could not save the order"}), 400

    finally:
        connection.close()

@app.route("/my-orders")
def my_orders():
    if "user_id" not in session:
        return jsonify({"message": "Please log in first"}), 401

    connection = sqlite3.connect(database)
    connection.row_factory = sqlite3.Row

    orders = connection.execute("""
        SELECT order_id, order_date, status, total_amount
        FROM orders
        WHERE user_id = ?
        ORDER BY order_date DESC, order_id DESC
    """, (session["user_id"],)).fetchall()

    results = []

    for order in orders:
        items = connection.execute("""
            SELECT p.name, oi.quantity, oi.unit_price, oi.subtotal
            FROM order_items oi
            JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = ?
        """, (order["order_id"],)).fetchall()

        results.append({
            "order_id": order["order_id"],
            "date": order["order_date"],
            "status": order["status"],
            "total": order["total_amount"],
            "items": [dict(item) for item in items]
        })

    connection.close()

    return jsonify(results)

@app.route("/admin-orders")
def admin_orders():
    if "admin_id" not in session:
        return jsonify({"message": "Admin login required"}), 403

    connection = sqlite3.connect(database)
    connection.row_factory = sqlite3.Row

    orders = connection.execute("""
        SELECT
            o.order_id,
            o.order_date,
            o.status,
            o.total_amount,
            c.name AS customer_name,
            s.shipping_method
        FROM orders o
        JOIN Customers c ON o.user_id = c.user_id
        LEFT JOIN shipping s ON o.order_id = s.order_id
        ORDER BY o.order_date DESC, o.order_id DESC
    """).fetchall()

    connection.close()

    return jsonify([dict(order) for order in orders])


@app.route("/update-order-status", methods=["POST"])
def update_order_status():
    if "admin_id" not in session:
        return jsonify({"message": "Admin login required"}), 403

    details = request.get_json(silent=True) or {}
    order_id = details.get("order_id")
    status = details.get("status")

    if type(order_id) is not int or order_id <= 0:
        return jsonify({"message": "Invalid order number"}), 400

    connection = sqlite3.connect(database)

    order = connection.execute("""
        SELECT o.order_id, s.shipping_method
        FROM orders o
        LEFT JOIN shipping s ON o.order_id = s.order_id
        WHERE o.order_id = ?
        """, (order_id,)).fetchone()

    if order is None:
        connection.close()
        return jsonify({"message": "Order not found"}), 404

    delivery_method = order[1]

    if delivery_method == "pickup":
        allowed_statuses = ["Pending", "Processing", "Ready for Pickup", "Collected", "Cancelled"]
    else:
        allowed_statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]

    if status not in allowed_statuses:
        connection.close()
        return jsonify({"message": "Invalid order status"}), 400

    connection.execute(
        "UPDATE orders SET status = ? WHERE order_id = ?",
        (status, order_id)
    )

    connection.commit()
    connection.close()

    return jsonify({"message": "Order status updated successfully!"})

@app.route("/admin-customers")
def admin_customers():
    if "admin_id" not in session:
        return jsonify({"message": "Admin login required"}), 403

    connection = sqlite3.connect(database)
    connection.row_factory = sqlite3.Row

    customers = connection.execute("""
        SELECT user_id, name, email, phone
        FROM Customers
        ORDER BY user_id DESC
    """).fetchall()

    connection.close()

    return jsonify([dict(customer) for customer in customers])

if __name__ == "__main__":
    app.run(debug=True)
