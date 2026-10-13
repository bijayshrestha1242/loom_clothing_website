let cart = JSON.parse(localStorage.getItem("cart")) || [];
let products = JSON.parse(localStorage.getItem("products")) || [];
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

        let minusButton = document.createElement("button");
        minusButton.textContent = "-";
        minusButton.onclick = function() {
            changeQuantity(i, -1);
        };

        let plusButton = document.createElement("button");
        plusButton.textContent = "+";
        plusButton.onclick = function() {
            changeQuantity(i, 1);
        };
        
        let removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.onclick = function() {
            removeFromCart(i);
        };

        item.appendChild(minusButton);
        item.appendChild(plusButton);
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

function changeQuantity(index, amount) {
    if (amount === 1) {
        cart.push({...cart[index]});
    }

    else if (amount === -1) {
        cart.splice(index, 1);
    }

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

function showAddProduct() {
    document.getElementById("addProductSection").style.display = "block";
}

function showEditProduct() {
    document.getElementById("editProductSection").style.display = "block";
}

function showRemoveProduct() {
    document.getElementById("removeProductSection").style.display = "block";
}

function showOrders() {
    document.getElementById("ordersSection").style.display = "block";

    displayAdminOrders();
}


let addProductForm = document.getElementById("addProductForm");

if (addProductForm != null) {
    addProductForm.addEventListener("submit", function(event) {
        event.preventDefault();

        let productName = document.getElementById("productName").value;
        let productDescription = document.getElementById("productDescription").value;
        let productPrice = document.getElementById("productPrice").value;
        let productCategory = document.getElementById("productCategory").value === "mens" ? "Mens" : "Womens";
        let productImage = document.getElementById("productImage").value;

        let product = {
            name: productName,
            description: productDescription,
            price: Number(productPrice),
            category: productCategory,
            image: productImage
        };

        fetch("/add-product", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(product)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Couldn't add product. Please try again.");
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
            addProductForm.reset();
        })
        .catch(error => {
            alert("Error adding product");
            console.error(error);
        });
    });
}

let editProductForm = document.getElementById("editProductForm");

if (editProductForm != null) {
    editProductForm.addEventListener("submit", function(event) {
        event.preventDefault();

        let productName = document.getElementById("editProductName").value;
        let newProductDescription = document.getElementById("editProductDescription").value;
        let newProductPrice = document.getElementById("editProductPrice").value;

        for (let i = 0; i < products.length; i++) {
            if (products[i].name === productName) {
                products[i].description = newProductDescription;
                products[i].price = Number(newProductPrice);
                localStorage.setItem("products", JSON.stringify(products));
                alert("Product updated successfully!");
                editProductForm.reset();
                return;
            }
        }
        alert("Product not found.");

    });
}

let removeProductForm = document.getElementById("removeProductForm");

if (removeProductForm != null) {
    removeProductForm.addEventListener("submit", function(event) {
        event.preventDefault();

        let productName = document.getElementById("removeProductName").value;

        for (let i = 0; i < products.length; i++) {
            if (products[i].name === productName) {
                products.splice(i, 1);
                localStorage.setItem("products", JSON.stringify(products));
                alert("Product removed successfully!");
                removeProductForm.reset();
                return;
            }
        }
        alert("Product not found.");
    });
}

function displayAdminOrders() {
    let adminOrderItems = document.getElementById("adminOrderItems");
    let adminOrderTotal = document.getElementById("adminOrderTotal");
    let lastOrder = JSON.parse(localStorage.getItem("lastOrder")) || [];
    let lastTotal = Number(localStorage.getItem("finalTotal"));

    adminOrderItems.innerHTML = "";

    if (lastOrder.length === 0) {
        adminOrderItems.innerHTML = "<li>No orders found.</li>";
        adminOrderTotal.textContent = "";
        return;
    }

    for (let i = 0; i < lastOrder.length; i++){
        let item = document.createElement("li");
        let price = Number(lastOrder[i].price);

        item.textContent = lastOrder[i].name + " - $" + price.toFixed(2);

        adminOrderItems.appendChild(item);
    }
    adminOrderTotal.textContent = "Order Total: $" + lastTotal.toFixed(2);
}

displayCart();
displayOrder();

function showFilterOptions() {
    let filterType = document.getElementById("filterType").value;
    let filterOption = document.getElementById("filterOption");

    filterOption.innerHTML = "";

    if (filterType === "none") {
        filterOption.style.display = "none";
    }

    else {
        filterOption.style.display = "inline";

        if (filterType === "price") {
            filterOption.innerHTML = `
            <option value="default">Default Order</option>
            <option value="ascending">Price: Low to High</option>
            <option value="descending">Price: High to Low</option>
            `;
        }
    
    
        else if (filterType === "size") {
        filterOption.innerHTML = `
        <option value="default">All Sizes</option>
        <option value="S">Size: Small</option>
        <option value="M">Size: Medium</option>
        <option value="L">Size: Large</option>
        <option value="XL">Size: Extra Large</option>
        `;
    }

        else if (filterType === "colour") {
        filterOption.innerHTML = `
        <option value="default">All Colours</option>
        <option value="white">White</option>
        <option value="black">Black</option>
        <option value="blue">Blue</option>
        `;
    }

    else if (filterType === "availability") {
        filterOption.innerHTML = `
        <option value="all">All Products</option>
        <option value="in">In Stock</option>
        <option value="out">Out of Stock</option>
        `;
    }
}

    filterProducts();
}

function filterProducts() {
    let filterType = document.getElementById("filterType").value;
    let filterValue = document.getElementById("filterOption").value;
    let productList = document.getElementById("productList");
    let products = Array.from(productList.children);

    for (let i = 0; i < products.length; i++) {
        products[i].style.display = "block";
    }

    products.sort(function(a, b) {
        return Number(a.dataset.order) - Number(b.dataset.order);
    });

    if (filterType === "price") {
        if (filterValue === "ascending") {
            products.sort(function(a, b) {
                return Number(a.dataset.price) - Number(b.dataset.price);
            });
        }

        else if (filterValue === "descending") {
            products.sort(function(a, b) {
                return Number(b.dataset.price) - Number(a.dataset.price);
            });
        }
    }

    for (let i = 0; i < products.length; i++) {
        if (filterValue !== "all" && filterType !== "price") {
            if (filterType === "size" &&
            products [i].dataset.size !== filterValue) {
            products [i].style.display = "none";
            }

        else if (filterType === "colour" &&
            products[i].dataset.colour !== filterValue) {
            products[i].style.display = "none";
            }

        else if (filterType === "availability" &&
            products[i].dataset.stock !== filterValue) {
            products[i].style.display = "none";
            }
        }
        
        productList.appendChild(products[i]);
    }
}

function changeQuantity(index, amount) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (amount === 1) {
        cart.push(cart[index]);
    }

    else if (amount === -1) {
        cart.splice(index, 1);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
}

function loadProducts() {
    let productList = document.getElementById("productList");

    if (productList == null) {
        return;
    }

    fetch("/products")
    .then(response => response.json())
    .then(products => {
        productList.innerHTML = "";

        let order = 1;

        for (let i = 0; i < products.length; i++) {
            let product = products[i];

            if (product.category_name === productList.dataset.category && product.status === "active") {
                let item = document.createElement("div");
                item.className = "product";
                
                item.dataset.price = product.price;
                item.dataset.order = order;

                if (product.name === "Classic Shirt") {
                    item.dataset.size = "M";
                    item.dataset.colour = "white";
                    item.dataset.stock = "in";
                }

                else if (product.name === "Baggy Jeans") {
                    item.dataset.size = "L";
                    item.dataset.colour = "blue";
                    item.dataset.stock = "in";
                }

                else if (product.name === "Cozy Jumper") {
                    item.dataset.size = "XL";
                    item.dataset.colour = "black";
                    item.dataset.stock = "out";
                }

                else if (product.name === "Staple Shirt") {
                    item.dataset.size = "M"
                    item.dataset.colour = "white";
                    item.dataset.stock = "in";
                }

                else if (product.name === "Classic Jeans") {
                    item.dataset.size = "L";
                    item.dataset.colour = "blue";
                    item.dataset.stock = "in";
                }

                else if (product.name === "Casual Jumper") {
                    item.dataset.size = "XL";
                    item.dataset.colour = "black";
                    item.dataset.stock = "out";
                }

                let name = document.createElement("h3");
                name.textContent = product.name;

                let price = document.createElement("p");
                price.textContent = "$" + Number(product.price).toFixed(2);

                let button = document.createElement("button");
                button.textContent = "Add to Cart";
                button.onclick = function() {
                    addToCart(product.name, Number(product.price));
                };

                item.appendChild(name);
                item.appendChild(price);
                item.appendChild(button);

                productList.appendChild(item);

                order++;
            }
        }
    })
    .catch(error => {console.error("Error loading products:", error);});
}

loadProducts();