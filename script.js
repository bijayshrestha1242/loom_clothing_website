let cart = JSON.parse(localStorage.getItem("cart")) || [];
let discount = 0;

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

    let discountAmount = total * discount;
    let finalTotal = total - discountAmount;

    cartTotal.textContent = "Total: $" + finalTotal.toFixed(2);
}
function removeFromCart(index) {
    cart.splice(index, 1);

    localStorage.setItem("cart", JSON.stringify(cart));

    displayCart();
}
function goToCheckout() {
    window.location.href = "checkout.html";
}

function showDelivery() {
    document.getElementById("addressSection").style.display = "block";
    document.getElementById("pickupLocation").style.display = "none";
}

function showPickup() {
    document.getElementById("addressSection").style.display = "none";
    document.getElementById("pickupLocation").style.display = "block";
}

function applyDiscount() {
    let discountCode = document.getElementById("discountCode").value;
    let discountMessage = document.getElementById("discountMessage");

    if (discountCode === "ILOVELOOM") {
        discount = 0.10; // 10% discount
        discountMessage.textContent = "Discount code applied! Enjoy 10% off.";
    } else {
        discount = 0;
        discountMessage.textContent = "Invalid Code. Please try again.";
    }

    displayCart();
}