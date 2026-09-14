let cart =[];

function addToCart(productName) {
    cart.push(productName);

    alert(productName + " added to your cart!");

    displayCart();
}

function displayCart() {
    let cartItems = document.getElementById("cartItems");

    cartItems.innerHTML = "";

    for (let i = 0; i < cart.length; i++) {
        let item = document.createElement("li");
        item.textContent = cart[i];

        cartItems.appendChild(item);
    }
}