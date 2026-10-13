import sqlite3
from pathlib import Path

database = Path(__file__).with_name("Loom.db")
connection = sqlite3.connect(database)
cursor = connection.cursor()

cursor.execute("INSERT INTO categories (name, description) VALUES (?, ?)", ("Mens", "Mens Clothing"))

category_id = cursor.lastrowid

products = [
    (category_id, "Classic Shirt", 49.99),
    (category_id, "Baggy Jeans", 79.99),
    (category_id, "Cozy Jumper", 99.99)
]

for product in products:
    cursor.execute("INSERT INTO products (category_id, name, price, status) VALUES (?, ?, ?, ?)", (product[0], product[1], product[2], "active"))

connection.commit()
connection.close()

print("Products added successfully!")