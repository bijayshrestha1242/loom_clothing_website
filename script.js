let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(productName, productPrice) {
    let product = {
        name: productName,
        price: productPrice
    };
    
    cart.push(product);

    localStorage.setItem("cart", JSON.stringify(cart));

    alert(productName + " added to your cart!");

    displayCart();
}

function displayCart() {
    let cartItems = document.getElementById("cartItems");
    let cartTotal = document.getElementById("cartTotal");

    if (cartItems === null || cartTotal === null) {
        return;
    }

    cartItems.innerHTML = "";

    let total = 0;

    for (let i = 0; i < cart.length; i++) {
        let item = document.createElement("li");
        
        let price = Number(cart[i].price);

        item.textContent = cart[i].name + " - $" + cart[i].price.toFixed(2) + " ";
        
        let removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.onclick = function() {
            removeFromCart(i);
        };

        item.appendChild(removeButton);
        cartItems.appendChild(item);

        total = total + price;
    }

    cartTotal.textContent = "Total: $" + total.toFixed(2);
}
function removeFromCart(index) {
    cart.splice(index, 1);

    localStorage.setItem("cart", JSON.stringify(cart));

    displayCart();
}