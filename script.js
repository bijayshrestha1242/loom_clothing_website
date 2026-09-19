let cart = JSON.parse(localStorage.getItem("cart")) || [];
let discount = 0;
let finalTotal = 0;

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

    if (cartItems == null || cartTotal == null) {
        return;
    }

    cartItems.innerHTML = "";

    let total = 0;

    for (let i = 0; i < cart.length; i++) {
        let item = document.createElement("li");
        let price = Number(cart[i].price);

        item.textContent = cart[i].name + " - $" + price.toFixed(2) + " ";
        
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
    finalTotal = total - discountAmount;

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

function showCardDetails() {
    document.getElementById("cardDetails").style.display = "block";
}

function hideCardDetails() {
    document.getElementById("cardDetails").style.display = "none";
}

function placeOrder() {
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let address = document.getElementById("address").value;
    let cardNumber = document.getElementById("cardNumber").value;
    let expiryDate = document.getElementById("expiryDate").value;
    let cvv = document.getElementById("cvv").value;

    if (cart.length === 0) {
        alert("Your cart is empty. Start filling it now!.");
        return;
    }

    else if (name === "" || email === "") {
        alert("Please fill in all required fields.");
        return;
    }

    else if (document.getElementById("delivery").checked == false &&
        document.getElementById("clickCollect").checked == false) {
        alert("Please select a delivery method.");
        return;
    }

    else if (document.getElementById("delivery").checked && address === "") {
        alert("Please provide a delivery address.");
        return;
    }

    else if (document.getElementById("card").checked == false &&
        document.getElementById("paypal").checked == false &&
        document.getElementById("afterpay").checked == false) {
        alert("Please select a payment method.");
        return;
    }

    else if (document.getElementById("card").checked && (cardNumber == "" || expiryDate == "" || cvv =="")) {
        alert("Please fill in all card details.");
        return;
    }

    else {
        localStorage.setItem("lastOrder", JSON.stringify(cart));
        localStorage.setItem("finalTotal", finalTotal);
        localStorage.removeItem("cart");

        window.location.href = "confirmation.html";
    }
}

function displayOrder(){
    let orderItems = document.getElementById("orderItems");
    let orderTotal = document.getElementById("orderTotal");

    if (orderItems == null || orderTotal == null) {
        return;
    }

    let lastOrder = JSON.parse(localStorage.getItem("lastOrder")) || [];
    let lastTotal = Number(localStorage.getItem("finalTotal"));

    for (let i = 0; i < lastOrder.length; i++) {
        let item = document.createElement("li");
        let price = Number(lastOrder[i].price);

        item.textContent = lastOrder[i].name + " - $" + price.toFixed(2);
        orderItems.appendChild(item);
    }

    orderTotal.textContent = "Total: $" + lastTotal.toFixed(2);
}

displayCart();
displayOrder();
