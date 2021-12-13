/*
 ============================================================================
 Name        : client.js
 Author      : Connor Beleznay
 Version     : 3
 Description : A client side implmentation of web page that allows a user to 
			   browse menus for several restaurants, add items from a 
			   restaurant to an order, and simulate placing an order
 ============================================================================
 */

/*************************************************************/






// holds the list of restraunts, however there is ever
// only 1 element in this list, I found this implementation easier as it
// re-uses as much code as possible with only minor changes.
let restaurants = [];

//Holds the list of restaurant names to populate the options menu
let restNames = [];


/***********************************************************************************************/
//Constants holding document elemnts
const restaurantSelection = document.getElementById("restaurant-selection");
const menuContainer = document.getElementById("menuContainer");
const cartContainer = document.getElementById("orderContainer");
const quickSelectMenu = document.getElementById("QuickLinks");
const restName = document.getElementById("rest-name");
const restInfo = document.getElementById("rest-info");

/***********************************************************************************************/


/***********************************************************************************************/
//global variables
var currSelection = 0; //holds the index of the currenlty selected option from the select element. set by the get getCurrentSelection() function.
let cart = new Map();
let total = 0;
var previousSelection =0; // holds the prviously selected option from the select element. set by the get getPreviousSelection() function
/***********************************************************************************************/



/*********************************************************************
Function: clear()
Description: clears the menu and the quick select menu by setting 
			thier innerHtml to an empty string

// Return: void
*/

function clear() {
    menuContainer.innerHTML = '';
	quickSelectMenu.innerHTML = '';
}


/*********************************************************************
Function: clearC()
Description: clears the cart summary by setting 
			thier innerHtml to an empty string

// Return: void
*/

function clearC() {
	cartContainer.innerHTML ='';
}



/*********************************************************************
Function: submitButtonClick()
Description: Event handler for the event generated when clicking the submit order button. 
			Iterates over each item in the cart map, creating an object with each items name
			and information(quantity, price) and adds each object to an arry, then generates
			another object holding the array, and the total for the order which is then sent
			via an Ajax POST request to the server. Finally it creates an alert, clears the 
			cart and renders the page with updated info, 
			
			
Local Variables: None
Return: void
*/

function submitButtonClick(event) {
	alert("Order Submitted! Thank you!");
	let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if (req.readyState=== 4 && this.status === 200){
			cart.clear();
			render();
		}
	}
	req.open("POST","http://127.0.0.1:3000/checkout");
	req.setRequestHeader("Content-Type", "application/json");

	let cartlist = [];

	for (const [item, info] of cart.entries()){
		let cartItem = {
			item:info,
			name:item
		}
		cartlist.push(cartItem);
	}
	let cartObj = {
		total:total,
		orders:cartlist,
	}
	let data = JSON.stringify(cartObj);
	console.log("CARTDATA:",cartObj);
	console.log("CART:",cartObj);
	req.send(data);

	cart.clear();
	render();
}








/*********************************************************************
Function: getPreviousSelection(event)
Description: used to store the index of the current item in the select 
			element. This triggers before on change, allowing us to 
			manually switch the select element later in the code back 
			to the value obtained by this function
Global Variables: 
	previousSelection = index of the current option selected in the selection element

Return: void
*/

function getPreviousSelection(event){
	previousSelection = restaurantSelection.value;
}

/*********************************************************************
Function: getCurrentSelection(event)
Description: Creates and send a PUT request to the server with the selected index from the drop
down menu and the matching restaurant name, it then takes the response, parses it and sets
the currently active restaurant (restraurants[0]) to the restraunt object recieved from 
the server response. It then calls the render function with the restraunt object from the server response.
Local Variables: 
	currSelection = index of the current option selected in the selection element
	newRest = an object holding the name and index of the currently selected restaurant from 
	the dropdown menu. 
	data = a stringified version of the above newRest

Return: void
*/

function getCurrentSelection(event){
	let curIndex = event.target.value; 
	currSelection = curIndex;
	let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if(req.readyState=== 4 && this.status === 200){

			restaurants[0] = JSON.parse(req.responseText);
			render(JSON.parse(req.responseText))
		}
	}
	req.open("PUT","http://127.0.0.1:3000/order");
	req.setRequestHeader("Content-Type", "application/json");
	let newRest = {
		name:restNames[currSelection],
		selection: parseInt(curIndex),
	}
	let data = JSON.stringify(newRest);
	console.log("+======DATA TO SEND TO SERVER:=========",data);
	req.send(data);

}

/*********************************************************************
Function: loadDefault()
Description: Sends an XMLHttpRequest idential getCurrentSelection, except
that it always requests the first restraunt in the restraunts array. 
This allows for a default restraunt to be displayed upon page load

Local Variables: 
	req - Holds the XMLHttpRequest
	restraurants - holds the list of restraunts, however there is ever
	only 1 element in this list, I found this implementation easier as it
	re-uses as much code as possible with only minor changes. 
	index - holds the next index to add an option to.

Return: void
*/


function loadDefault(){

	let req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if(req.readyState=== 4 && this.status === 200){
			restaurants[0] = JSON.parse(req.responseText);
			render(JSON.parse(req.responseText))
		}
	}
	req.open("PUT","http://127.0.0.1:3000/order");
	req.setRequestHeader("Content-Type", "application/json");
	let newName = {
		name:restNames[0],
		selection: 0,
	}
	let data = JSON.stringify(newName);
	req.send(data);

}





/*********************************************************************
Function: getRList()
Description: gets a list of restraunt names via an Ajax request to the srever,
	then Generate and render the select options with the restraunts available 
	using the elements constructor to do so.

Local Variables: 
	restNames - Holds a list of restraunt names
	index - holds the next index to add an option to.

Return: void
*/

function getRList(){
    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (req.readyState === 4 && this.status === 200){
            console.log("GOT RESPONSE!");

			restNames = JSON.parse(req.responseText);

			let index = document.getElementById("restaurant-selection").options.length;
			restNames.forEach(restaurantS => {
				console.log("For Each:",restaurantS);
				document.getElementById("restaurant-selection").options[index++] = new Option(restaurantS,restNames.indexOf(restaurantS));
			});
			// getCurrentSelection();
			// render();
        }
    }
    req.open('GET', 'http://127.0.0.1:3000/list');
    req.send()
}



/*********************************************************************
Function: populateQuickSelect()
Description:Generate and render the category bookmarks
Local Variables: 
	curRest - Holds the index of the current selected option in the selection element
	curRestObj - Holds the restaurant object at the index of curRest
	newQuickLink - creates the link element for the current section.
	key - loop variable that holds the current menu section for the current restraunt

Return: void
*/

//Generate and render the category bookmarks
function populateQuickSelect(rest){

	let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(req.readyState===4 && this.status===200){
			console.log("Got response for quickselect");

		}
	}
	// let curRest = restaurantSelection.value;
	let curRestObj = restaurants[0];
	for (key in curRestObj.menu) {
		console.log("quickSelect:",key);
		let newQuickLink = document.createElement('a');
		let newLineBreak = document.createElement('br');
		newQuickLink.textContent = key;
		newQuickLink.href = `#${key}`;
		quickSelectMenu.appendChild(newQuickLink);
		quickSelectMenu.appendChild(newLineBreak);
	}
}


/*********************************************************************
Function: renderRestInfo()
Description:renders the restraunt information
Local Variables: 
	curRestObj - Holds the active restaurant object
	newMinOrder - element to display the restraunts min order
	newDeliveryCost - Element to show the current restraunts delivery cost
Return: void
*/

function renderRestInfo(rest){
	restInfo.innerHTML = '';


	let curRestObj = restaurants[0];

	restName.innerHTML = curRestObj.name;
	let newMinOrder = document.createElement('h5');
	let newDeliveryCost = document.createElement('h5');



	restName.innerHTML = curRestObj.name;
	newMinOrder.innerHTML = `Minimum Order: $${curRestObj.min_order.toFixed(2)}`;
	newDeliveryCost.innerHTML = `Deliver Cost: $${curRestObj.delivery_fee.toFixed(2)}`;
	restInfo.appendChild(newMinOrder);
	restInfo.appendChild(newDeliveryCost);
}




/*********************************************************************
Function: removeFromCart()
Description: Event handler for the event generated when clicking the submit order button. 
			Creates an alert, clears the cart and renders the page with updated info.
Local Variables: None
Return: void
*/
function removeFromCart(event){
	cart.get(event.target.id).quantity -=1;
	if (cart.get(event.target.id).quantity<1){
		cart.delete(event.target.id);
	}
	renderCart();
}


/*********************************************************************
Function: renderCart()
Description:Renders the cart, including items, totals and submit button. Accomplished this with nested for loops.
Local Variables: 
	curRest - Holds the index of the current selected option in the selection element
	total - Holds the total running cost
	remaining - amount remaining before min order reached
	tax - tax rate
	delivery_charge - holds the current restraunts delivery charge
	dCharge - Element for displaying Deliver charge
	totalE - element for displayin the total
	subTotal- element for displaying the current subtotal
	buyButton - element for the submit purchase buyButton
	amountRemaining - element to display the difference between the total and min order aount
	newCartItem - div element to hold display the text info describing the cart item and holds the button to remove it from the cart

Return: void
*/


function renderCart(){
	clearC();
	if(cart.size<1){
		cartContainer.innerHTML= 'Cart Empty'
	}
	total = 0; //total running cost
	let remaining = 0; 
	let tax = 0.1; 
	let delivery_charge = restaurants[0].delivery_fee;
	let dCharge = document.createElement('p'); 
	let totalE = document.createElement('p'); // element for total 
	let totalTax = document.createElement('p'); //element for tax
	let subTotal = document.createElement('p'); // element for the subtotal
	let buyButton = document.createElement('button'); //element for the submit purchase button
	let amountRemaining = document.createElement('p'); //element for the amount remaining.

	//Set up buy button
	buyButton.disabled='true';
	buyButton.value = 'Submit Order';
	buyButton.textContent='Submit Order';
	buyButton.className='myBtn';
	buyButton.addEventListener('click', submitButtonClick);

	//loop through an iteratble object of entries from the cart Map, item = key, info = value
	for (const [item, info] of cart.entries()) {
		total += info.price*info.quantity;
		let newCartItem = document.createElement('div');
		let newSubButton = document.createElement('input');
		
		newCartItem.textContent = `${item} x ${info.quantity} ($${(info.quantity*info.price).toFixed(2)})`;
		newCartItem.style = 'font-weight:500';

		//set up the remove button
		newSubButton.type = 'image';
		newSubButton.src = 'images/remove.png';
		newSubButton.style = 'min-width:5px;min-height:5px;max-width:25px;max-height:25px;margin-left:5px';
		newSubButton.id = item;
		newSubButton.name = 'remove';
		newSubButton.addEventListener('click', removeFromCart);

		//append the button to the section representing an item in the cart
		newCartItem.appendChild(newSubButton);
		//append the newSection 
		cartContainer.appendChild(newCartItem);

	  }

	  //Check if theres at least one item in the cart if so then change the relevant values
	  if(cart.size>0){
		remaining = restaurants[0].min_order - total;
		subTotal.innerHTML = `Subtotal:$${total.toFixed(2)}`;
		amountRemaining.innerHTML = `You must add:$${remaining.toFixed(2)} more to your order before submitting`;
		totalTax.innerHTML = `Tax: $${(total*tax).toFixed(2)}`;
		total += delivery_charge;
		total += total*tax;
	  }

	  //Display the charges/cost summary
	  dCharge.innerHTML = `Delivery Charge: $${delivery_charge}`;
	  totalE.innerHTML = `Total: $${total.toFixed(2)}`;
	  cartContainer.appendChild(subTotal);
	  cartContainer.appendChild(dCharge);
	  cartContainer.appendChild(totalTax);
	  cartContainer.appendChild(totalE);

	  //check if the total has reached the minimum order maount, if not then show the amount remaining. 
	  if(remaining <= 0){
		  buyButton.disabled=0;
	  }else{
		  cartContainer.appendChild(amountRemaining);
	  };
	  //only show the submit button if theres at least one item in the cart. 
	  if(cart.size>0){
	  cartContainer.appendChild(buyButton);
	  };

}


/*********************************************************************
Function: renderMenu()
Description:Renders the cart, including items, totals and submit button. Accomplished this with nested for loops.
Local Variables: 
	curRest - Holds the index of the current selected option in the selection element
	curRestObj - Holds the restaurant object at the index of curRest
	remaining - amount remaining before min order reached
	tax - tax rate
	delivery_charge - holds the current restraunts delivery charge
	dCharge - Element for displaying Deliver charge
	totalE - element for displayin the total
	subTotal- element for displaying the current subtotal
	buyButton - element for the submit purchase buyButton
	amountRemaining - element to display the difference between the total and min order aount
	newCartItem - div element to hold display the text info describing the cart item and holds the button to remove it from the cart


Return: void
*/


//renders the menu
function renderMenu(rest) {

	clear()
	let curRestObj = restaurants[0]; //gets and stores the restaurant object at the index of the currently selected restaurant.
	//loop variable mSect is short for menu section. 
	for (const mSect in curRestObj.menu) {
		let newSection = document.createElement('div');
		let newHeader = document.createElement('h2');
		let newItemList = document.createElement('dl');
		//The newHeader will be the Menu Section, and will serve as a header for individual menu items
		newHeader.textContent = mSect;
		newHeader.id = mSect;

		//Menu Section is the menu section header and all items included in the menu section
		newSection.className = 'menu-section';
		//Item list stores the individual items
		newItemList.className = 'menu-section-items'
		newSection.appendChild(newHeader);
		newSection.appendChild(newItemList);


		for(const item in curRestObj.menu[mSect]){
			//curItem stores the object associated with the current key, (item). Represents a discreate menu item
			let curItem = curRestObj.menu[mSect][item];
			let newItem = document.createElement('dt');
			let newDescription = document.createElement('dd');
			//Set up the button to add to cart
			let newAddButton = document.createElement('input');
			newAddButton.type = 'image';
			newAddButton.src = 'images/add.png';
			newAddButton.style = 'min-width:5px;min-height:5px;max-width:25px;max-height:25px;margin-left:5px'
			newAddButton.name = 'Add';
			newAddButton.id = curItem.name;
			newAddButton.value = curItem.name; // maybe chang this to .name
			
			//event handler for newAddButton
			function addToCart(event){
				let itemClicked = event.target.id;

				if(cart.has(itemClicked)){
					cart.get(itemClicked).quantity +=1;
				}else{
					//if the item doesnt exist in the cart, construct a new object and add it to the map
					let newCartItem = {
						quantity:1,
						price:curItem.price
					};
					cart.set(itemClicked, newCartItem);
				}
				renderCart();
			}

			newAddButton.addEventListener('click',addToCart)

			//set up and add the elements to the 
			newDescription.textContent = `-${curItem.description} $${curItem.price.toFixed(2)}`;
			newItem.textContent = curItem.name;
			newItem.style = 'padding:8px; font-size:110%'
			newItem.appendChild(newAddButton);
			newItem.appendChild(newDescription);
			newItemList.appendChild(newItem);
		}

		menuContainer.appendChild(newSection);

	}


}





/*********************************************************************
Function: checkCart()
Description:Checks the cart for items, to determine if confirmation 
			message should be shown, also renders the page with updated 
			values to reflect the new restaurant. If the user cancels, 
			the option selected in the selection element is manually 
			changed to the option that was selected before the onchange event
			If the user continues the fuction clears the cart, and renders 
			the page with the updated model.
Local Variables: 

Return: void
*/
//Checks the cart for items, to determine if confirmation message should be shown, also 
//renders the page with updated values to reflect the new restaurant.
function checkCart(event){


	if(cart.size > 0){
		let r = confirm("Changing restaurants will clear your cart. Continue?");
		if(r === true){
			currSelection = event.target.value;
			cart.clear();
			getCurrentSelection(event);
			render();
		}else{
			restaurantSelection.selectedIndex = previousSelection;
			currSelection = previousSelection;
			render();
		}
	}else{
		currSelection = event.target.value;
		getCurrentSelection(event);
		render();
	}
}

//renders all elements in the page. At times certain elements need to be rendered individually, so
//The render function was split up into individual function.
function render(rest){
	renderMenu(rest);
	populateQuickSelect(rest);
	renderRestInfo(rest);
	renderCart(rest);
}

function onLoad(){
	loadDefault();
	getRList();

	// populateRList();
	document.getElementById("restaurant-selection").addEventListener('onclick',getPreviousSelection);
	document.getElementById("restaurant-selection").addEventListener('change',checkCart);
	// document.getElementById("restaurant-selection").addEventListener('change',getCurrentSelection);

	// render();

}



function logout(){
    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if(req.readyState=== 4 && this.status === 200){
            alert("Logged out successfully");
            window.location.href = "http://127.0.0.1:3000/"
        }
    }
    req.open("GET",'/logout');
    req.send();
}