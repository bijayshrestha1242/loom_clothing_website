import sqlite3
from pathlib import Path

database = Path(__file__).with_name("Loom.db")
connection = sqlite3.connect(database)
cursor = connection.cursor()

categories = {
    "Mens": [
        ("Classic Shirt", 49.99),
        ("Baggy Jeans", 79.99),
        ("Cozy Jumper", 99.99)
    ],

    "Womens": [
        ("Staple Shirt", 49.99),
        ("Classic Jeans", 79.99),
        ("Casual Jumper", 99.99)
    ]
}

for category_name, products in categories.items():

    cursor.execute(
        "SELECT category_id FROM categories WHERE name = ?",
        (category_name,)
    )

    category = cursor.fetchone()

    if category:
        category_id = category[0]
    else:
        cursor.execute(
            "INSERT INTO categories (name) VALUES (?)",
            (category_name,)
        )
        category_id = cursor.lastrowid

    for name, price in products:
        cursor.execute(
            "SELECT product_id FROM products WHERE name = ? AND category_id = ?",
            (name, category_id)
        )

        if cursor.fetchone() is None:
            cursor.execute(
                """
                INSERT INTO products (category_id, name, price, status)
                VALUES (?, ?, ?, ?)
                """,
                (category_id, name, price, "active")
            )

connection.commit()
connection.close()

print("Products added successfully!")