let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(productName) {
    cart.push(productName);

    localStorage.setItem("cart", JSON.stringify(cart));

    alert(productName + " added to your cart!");

    displayCart();
}

function displayCart() {
    let cartItems = document.getElementById("cartItems");

    if (cartItems === null) {
        return;
    }

    cartItems.innerHTML = "";

    for (let i = 0; i < cart.length; i++) {
        let item = document.createElement("li");
        item.textContent = cart[i];

        cartItems.appendChild(item);
    }
}

displayCart();