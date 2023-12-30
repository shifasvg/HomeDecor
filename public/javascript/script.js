//display error messages on ejs
function printError(elemId, hintMsg){
  document.getElementById(elemId).innerHTML = hintMsg;
}

//signup form validation
function signupValidate() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const mobile = document.getElementById('mobile').value;
  const password = document.getElementById('password').value;
  const cpassword = document.getElementById('cpassword').value;
  const radiobtn1 = document.getElementById('inlineRadio1').checked;
  const radiobtn2 = document.getElementById('inlineRadio2').checked;

  let isValid = true; // Initialize a flag to track validation status
  
  //validate name field
  if(name == '') {
      printError('nameErr',"Please enter your name!");
      isValid = false;
  } else {
      const regex = /^[a-zA-Z\s]+$/;
      if(regex.test(name) === false){
          printError('nameErr','Please enter a valid name');
          isValid = false;
      }else{
          printError('nameErr', '');
      }
  }
  console.log('name validation done');

  //password validation
  if(password == ''){
      printError('passErr', 'Please enter your password');
      isValid = false;
  } else if(password.length<6){
          printError('passErr', 'Password must be longer than 6 characters!')
          isValid = false;
      }else{
          const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
          if (!regex.test(password)) {
              printError('passErr', 'Password must contain at least one letter, one digit, and one special character.');
              isValid = false;
          } else {
              printError('passErr', ''); // Clear password error if it was previously set
          }
      }
  //validating confirm password
  if (cpassword === '') {
      printError('cPassErr', 'Confirm Password should not be blank!');
      isValid = false;
    } else if (password !== '' && cpassword !== '' && password !== cpassword) {
      printError('cPassErr', 'Password does not match!');
      isValid = false;
    } else {
      printError('cPassErr', '');
    }
    console.log('password validation done');

    if (!document.getElementById('inlineRadio1').checked && !document.getElementById('inlineRadio2').checked) {
      printError('rbtnErr', 'Please select one to send OTP');
      isValid = false;
  } else {
      printError('rbtnErr', '');
  }
  
// validate email password

  if (email == '') {
      printError('emailErr', 'Please enter your email address!');
      isValid = false;
  } else {
      const regex = /^\S+@\S+\.\S+$/;
      if (regex.test(email) === false) {
      printError('emailErr', 'Please enter a valid email address!');
      isValid = false;
      } else {
      printError('emailErr', '');
      }
  }
  console.log('email validation done');

// validate mobile number
  if (mobile == '') {
      printError('mobileErr', 'Please enter your mobile number!');
      isValid = false;
  } else {
      const regex = /^[1-9]\d{9}$/;
      if (regex.test(mobile) === false) {
      printError('mobileErr', 'Please enter a valid 10 digit mobile number!');
      isValid = false;
      } else {
      printError('mobileErr', '');
      }
  }
  console.log('mobile validation done');

// If all validation checks pass, allow the form submission
if (isValid) {
  return true;
} else {
  // Validation failed, prevent the form submission
  return false;
}
}

//validate user Login form
function loginValidate() {
  const email = document.getElementById('lEmail').value;
  const password = document.getElementById('lPassword').value;

  let isValid = true;

  if (email == '') {
    printError('lEmailErr', 'Please enter your email address!');
    isValid = false;
  } else {
    const regex = /^\S+@\S+\.\S+$/;
    if (regex.test(email) === false) {
      printError('lEmailErr', 'Please enter a valid email address!');
      isValid = false;
    } else {
      printError('lEmailErr', '');
    }
  }

  if (password == '') {
    printError('lPassErr', 'Please enter your password!');
    isValid = false;
  } else {
    printError('lPassErr', '');
  }

  if (isValid) {
    return true;
  } else {
    // Validation failed, prevent the form submission
    return false;
  }
}

//validate user new address form
function addressValidate() {
  const name = document.getElementById('address-name').value;
  const mobile = document.getElementById('address-mobile').value;
  const pincode = document.getElementById('address-pincode').value;
  const address = document.getElementById('address-address').value;
  const district = document.getElementById('address-district').value;
  const state = document.getElementById('address-state').value;
  const landmark = document.getElementById('address-landmark').value;
  const altr_number = document.getElementById('address-alternativeNumber').value;
  let isValid = true;

  if (name == '') {
    printError('address-nameErr', 'Please enter your name!');
    isValid = false;
  } else {
      printError('address-nameErr', '');
  }

  if (mobile == '') {
    printError('address-mobileErr', 'Please enter your mobile number!');
    isValid = false;
  }else {
    const regex = /^[1-9]\d{9}$/;
    if (regex.test(mobile) === false) {
    printError('address-mobileErr', 'Please enter a valid 10 digit mobile number!');
    isValid = false;
    }  else {
      printError('address-mobileErr', '');
    }
}

  if (pincode == '') {
    printError('address-pincodeErr', 'Please enter your pincode!');
    isValid = false;
  } else {
    printError('address-pincodeErr', '');
  }

  if (address == '') {
    printError('address-addressErr', 'Please enter your address!');
    isValid = false;
  } else {
    printError('address-addressErr', '');
  }

  if (district == '') {
    printError('address-districtErr', 'Please enter your district!');
    isValid = false;
  } else {
    printError('address-districtErr', '');
  }

  if (state == '') {
    printError('address-stateErr', 'Please enter your state!');
    isValid = false;
  } else {
    printError('address-stateErr', '');
  }

  if (landmark == '') {
    printError('address-landmarkErr', 'Please enter your landmark!');
    isValid = false;
  } else {
    printError('address-landmarkErr', '');
  }

  if (altr_number == '') {
    printError('address-alternativeNumberErr', 'Please enter your alternative number!');
    isValid = false;
  } else {
    const regex = /^[1-9]\d{9}$/;
    if (regex.test(altr_number) === false) {
      printError('address-alternativeNumberErr', 'Please enter a valid 10 digit alternative number!');
      isValid = false;
    } else {
      printError('address-alternativeNumberErr', '');
    }
  }
  

  if (isValid) {
    return true;
  } else {
    // Validation failed, prevent the form submission
    return false;
  }
}

//admin login validation
function adminloginValidate() {
console.log('Validation function triggered');
const email = document.getElementById('adminEmail').value;
const password = document.getElementById('adminPassword').value;

let isValid = true;

if (email == '') {
  printError('adminEmailErr', 'Please enter your email address!');
  isValid = false;
} else {
  const regex = /^\S+@\S+\.\S+$/;
  if (regex.test(email) === false) {
    printError('adminEmailErr', 'Please enter a valid email address!');
    isValid = false;
  } else {
    printError('adminEmailErr', '');
  }
}

if (password == '') {
  printError('adminPassErr', 'Please enter your password!');
  isValid = false;
} else {
  printError('adminPassErr', '');
}

if (isValid) {
  return true;
} else {
  // Validation failed, prevent the form submission
  return false;
}
}

//for admin to search users 
function searchUser() {
const query = document.getElementById("search").value
window.location.href = `/admin/users-management?search=${query}`
}


//add products form validation


// function addProductValidate(){
//   const productName = document.getElementById('product_name').value;
//   const price = document.getElementById('product_price').value;
//   const mrp = document.getElementById('product_mrp').value;
//   const discount = document.getElementById('product_discount').value
//   const stock = document.getElementById('product_stock').value;
//   const description = document.getElementById('product_desc').value;

//   let isValid = true;

//   if(productName.trim()===''){
//     printError('productNameErr','Please enter a name for product!')
//     isValid = false;
//   }
// }

//add product discount calculation
const priceInput = document.getElementById('product_price');
const mrpInput = document.getElementById('product_mrp');
const discountInput = document.getElementById('product_discount');

document.addEventListener("DOMContentLoaded", function() {
  if(addNewProduct || editProduct){
    priceInput.addEventListener('input', updateDiscount);
    mrpInput.addEventListener('input', updateDiscount);
    
    function updateDiscount() {
    const price = parseFloat(priceInput.value) || 0;
    const mrp = parseFloat(mrpInput.value) || 0;
    
    // Calculate discount percentage
    const discountPercentage = Math.round(((mrp - price) / mrp) * 100);
    
    // Update discount input field with the calculated percentage
    discountInput.value = discountPercentage + '%';
    }
  }

});

// ---------------add product form inputs and image sent to controller start ---------------//

//image upload

let files = [],
form = document.querySelector('.boxcard'),
container = document.querySelector('.boxcontainer'),
text = document.querySelector('.inner'),
browse = document.querySelector('.select'),
input = document.querySelector('.dragbox input');

const addNewProduct = document.getElementById('addNewProduct');
const editProduct = document.getElementById('editProduct');

const showImages = () => {
  let images = '';
  console.log("Array images:");
  //console.log(JSON.stringify( files, null, 2));
  console.log(files)
  files.forEach((e, i) => {
    // If it's a Blob, use createObjectURL, else use the filename from the server
    const imageUrl = e instanceof Blob ? URL.createObjectURL(e) : `/images/${e.filename}`;

    images += `<div class="image">
      <img src="${imageUrl}" alt="image">
      <span onclick="delImage(${i})">&times;</span>
      <span class="span2" ><i class="fas fa-crop"></i></span>
    </div>`;
  });

  container.innerHTML = images;
}



const delImage = index =>{
  files.splice(index,1)
  showImages()
}

if(addNewProduct || editProduct){

browse.addEventListener('click', ()=> input.click());

//input change event 

input.addEventListener('change', () => {
  let file = input.files;

  
  for(let i =0; i< 5; i++){
    if(file[i] &&files.every(e => e.name !== file[i].name))
    files.push(file[i])
  }
 
  input.value='';



  showImages();
 
})



//drag and drop
form.addEventListener('dragover', e =>{
  e.preventDefault();
  
  form.classList.add('dragover')
  text.innerHTML = 'Drop images here'
})

form.addEventListener('dragleave', e =>{
  e.preventDefault();
  
  form.classList.remove('dragover')
  text.innerHTML = 'Drag & drop image here or <span class="select">Browse</span>'
})

form.addEventListener('drop', e=> {
  e.preventDefault();

  form.classList.remove('dragover')
  text.innerHTML = 'Drag & drop image here or <span class="select">Browse</span>'

  let file = e.dataTransfer.files;
  for(let i =0; i< 5; i++){
    if(file[i] &&files.every(e => e.name !== file[i].name))
    files.push(file[i])
  }
  showImages()
})

//sending form inputs and image to controller to save in db
document.addEventListener("DOMContentLoaded", function() {
if(addNewProduct){
  const addProductsForm2 = document.getElementById('addProductsForm');

addProductsForm2.addEventListener('submit', async function(event){
  event.preventDefault();

  // Call the form validation function
  const isValid = addProductsFormValidate();

  // If validation fails, do not submit the form
  if (!isValid) {
    return false;
  }
    
    // Create a FormData object
    const formData = new FormData(addProductsForm2);

    // Append the files to the FormData object
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i], files[i].name); // Use 'images' as the field name for files
    }

    try {
      // Perform the form submission with the FormData object using fetch
      const response = await fetch('/admin/products-management/add-new-product', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        console.log(jsonResponse);
        console.log(jsonResponse.message);
      window.location.href = '/admin/products-management?message=added';
    } else {
      console.error('Product adding Server error:', response.status);
      console.log('product not added')
      window.location.href = '/admin/products-management?message=Product not added';
    }
  } catch (error) {
    console.error('Fetch error:', error);
    window.location.href = '/admin/products-management?message=error';
  }
  // }
});


}

});
console.log("after updateDiscount()");

function addProductsFormValidate() {
  const productNameInput = document.getElementById('product_name');
  const productnamesData = productNameInput.getAttribute('data-productNames').split(',')
  const productPriceInput = document.getElementById('product_price');
  const productMrpInput = document.getElementById('product_mrp');
  const productCategoryInput = document.getElementById('product_category');
  const productDesInput = document.getElementById('product_desc');
  const productStockInput = document.getElementById('product_stock');

  const productName = productNameInput.value;
  const productPrice = productPriceInput.value;
  const productMrp = productMrpInput.value;
  const productCategory = productCategoryInput.value;
  const productDes = productDesInput.value;
  const productStock = productStockInput.value;

  let isValid = true;

  // Reset errors
  printError('addPrdNameErr', '');
  printError('addPrdPriceErr', '');
  printError('addPrdMrpErr', '');
  printError('addPrdCatErr', '');
  printError('addPrdDescErr', '');
  printError('addPrdStockErr', '');
  printError('addPrdImgErr', '');

  // Validate product name
  if (productName.trim() === '') {
    printError('addPrdNameErr', 'Please enter product name!');
    isValid = false;
  }else{
    if(addNewProduct){
productnamesData.forEach((itemName)=>{
      if(productName == itemName){
        printError('addPrdNameErr',"Product name already exists, Please try other name!")
        isValid = false;
      }
    })
    }else if(editproduct){
      const originalProductName = productNameInput.getAttribute('data-originalName');

      // Check if the product name has been changed when editing a product
      if (productName !== originalProductName) {
        productnamesData.forEach((itemName) => {
          if (productName === itemName) {
            printError('addPrdNameErr', 'Product name already exists, please try another name!');
            isValid = false;
          }
        });
      }
    }
  }

  // Validate product price
  if (productPrice.trim() === '') {
    printError('addPrdPriceErr', 'Please enter price of the product');
    isValid = false;
  } else if (isNaN(productPrice) || parseFloat(productPrice) <= 0) {
    printError('addPrdPriceErr', 'Enter a valid price greater than 0');
    isValid = false;
  }else if (parseFloat(productPrice) > parseFloat(productMrp)) {
    printError('addPrdPriceErr', 'Price shouldn\'t be higher than MRP');
    isValid = false;
  }

  // Validate product MRP
  if (productMrp.trim() === '') {
    printError('addPrdMrpErr', 'Please enter MRP of the product');
    isValid = false;
  } else if (isNaN(productMrp) || parseFloat(productMrp) <= 0) {
    printError('addPrdMrpErr', 'Enter a valid MRP greater than 0');
    isValid = false;
  } 


  // Validate product category
  if (productCategory === '' || productCategory === 'choose the category') {
    printError('addPrdCatErr', 'Please select a valid category!');
    isValid = false;
  }

  // Validate product description
  if (productDes.trim() === '') {
    printError('addPrdDescErr', 'Please enter product description');
    isValid = false;
  }

  // Validate product stock
  if (productStock.trim() === '') {
    printError('addPrdStockErr', 'Please enter product stock');
    isValid = false;
  } else if (isNaN(productStock) || parseInt(productStock) < 0) {
    printError('addPrdStockErr', 'Enter a valid stock quantity');
    isValid = false;
  }

  // Validate product images
  if (files.length < 2) {
    printError('addPrdImgErr', 'Please select at least two images');
    isValid = false;
  }

  // If all validation checks pass, allow the form submission
  return isValid;
}

 // ---------------add product form inputs and image sent to controller end ---------------//
 
// ---------------Edit product form inputs and image sent to controller start ---------------//

const editProductDataDiv = document.getElementById('editProductData');
const editproduct = JSON.parse(editProductDataDiv.getAttribute('data-product'));

let file2 = editproduct.images;


for (let i = 0; i < file2.length; i++) {
   if (file2[i] && !files.some(e => e.filename === file2[i].filename)) {
       files.push(file2[i]);
   }
}


console.log(files)


 showImages();

//sending form inputs and image to controller to save in db
document.addEventListener("DOMContentLoaded", function() {

  if(editproduct){
    const editProductsForm = document.getElementById('editProductsForm');

const productId = editproduct._id;


editProductsForm.addEventListener('submit', async function(event){
  event.preventDefault();

   // Call the form validation function
   const isValid = addProductsFormValidate();

   // If validation fails, do not submit the form
   if (!isValid) {
     return false;
   }

    // Create a FormData object
    const formData2 = new FormData(editProductsForm);

  formData2.append('productId', productId);



  //  Append the files to the FormData object
    for (let i = 0; i < files.length; i++) {
      if(files[i] instanceof Blob){
        formData2.append('images', files[i], files[i].name);
      }else{
        console.log("itssss"+files[i].filename)
        formData2.append('images0',files[i].filename)
      }
      
    }

    try {
      // Perform the form submission with the FormData object using fetch
      const response = await fetch('/admin/products-management/edit-product', {
        method: 'POST',
        body: formData2
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        console.log(jsonResponse);
        console.log(jsonResponse.message);
      window.location.href = '/admin/products-management?message=edited';
    } else {
      console.error('Product adding Server error:', response.status);
      console.log('product not added')
      window.location.href = '/admin/products-management?message=Product not edited';
    }
  } catch (error) {
    console.error('Fetch error:', error);
    window.location.href = '/admin/products-management?message=error';
  }
  // }
});
  }

});
// ---------Edit product form inputs and image sent to controller end -----------//

}
//image input end


//add new product form validation



// ---------------confirm box before deleting, deactivating,activating category-----------------//


//confirm box for deleting category
function confirmDelete(categoryId) {
  var modal = document.getElementById('custom-modal');
  var confirmBtn = document.getElementById('confirm-delete');
  var cancelBtn = document.getElementById('cancel-delete');

  modal.style.display = 'block';

  confirmBtn.onclick = function() {
    // If user confirms deletion, navigate to the delete URL with the category ID
    window.location.href = '/admin/category-management/delete?id=' + categoryId;
    modal.style.display = 'none';
  }

  cancelBtn.onclick = function() {
    // If user cancels deletion, do nothing
    modal.style.display = 'none';
    window.location.href = '/admin/category-management?message=Deletion cancelled!'
  }
}


function confirmDeactivate(categoryId) {
  Swal.fire({
    title: "Are you sure?",
    text: "Do you want to deactivate this category!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonText: 'No',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes'
  }).then((result) => {
    if (result.isConfirmed) {
      // If the user confirms deletion, navigate to the delete URL with the category ID
      window.location.href = '/admin/category-management/deactivate?id=' + categoryId;
    }else {
      // If user cancels deletion, do nothing
      window.location.href = '/admin/category-management?message=Dectivation cancelled!'
    }
  });
}


function confirmActivate(categoryId){

Swal.fire({
  title: "Are you sure?",
  text: "Do you want to activate this category!",
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: '#d33',
  cancelButtonText: 'No',
  cancelButtonColor: '#3085d6',
  confirmButtonText: 'Yes'
}).then((result) => {
  if (result.isConfirmed) {
    // If the user confirms deletion, navigate to the delete URL with the category ID
    window.location.href = '/admin/category-management/activate?id=' + categoryId;
  } else {
    // If user cancels deletion, do nothing
    window.location.href = '/admin/category-management?message=Activation cancelled!'
  }
});
}
// ---------------confirm box before deleting, deactivating,activating category ends here-----------------//

function confirmProductDelete(idofproduct) {

Swal.fire({
  title: "Are you sure?",
  text: "Do you want to activate this category!",
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: '#d33',
  cancelButtonText: 'No',
  cancelButtonColor: '#3085d6',
  confirmButtonText: 'Yes'
}).then((result) => {
  if (result.isConfirmed) {
    // If user confirms deletion, navigate to the delete URL with the category ID
    window.location.href = '/admin/products-management/delete?id=' + idofproduct;
  } else {
     // If user cancels deletion, do nothing
     window.location.href = '/admin/products-management?message=Deletion cancelled!'
  }
});
}

//for expanding add new address in account address and checkout page
const address = document.getElementById('address'),
checkout = document.getElementById('checkout');

if(address || checkout){
  document.addEventListener("DOMContentLoaded", function () {
    const addAddressButton = document.getElementById('add-address-btn');
    const newAddressForm = document.getElementById('new-address-form');
    const saveAddressButton = document.getElementById('save-address-btn');
    const cancelAddressButton = document.getElementById('cancel-address-btn');
    const addNewAddressContainer = document.getElementById('add-new-address-container')
    const addressInputFields = document.querySelectorAll(".new-address-form input");
    // Initially hide the new address form
    newAddressForm.style.display = 'none';

    // Event listener for Add New Address button click
    addAddressButton.addEventListener('click', function (event) {
        // Hide Add New Address button and show the new address form
        addAddressButton.style.display = 'none';
        newAddressForm.style.display = 'block';
        addNewAddressContainer.style.backgroundColor = "#ededed"
        event.preventDefault();
    });

    // Event listener for Cancel button click in the new address form
    cancelAddressButton.addEventListener('click', function (event) {
        // Show Add New Address button and hide the new address form
        addAddressButton.style.display = 'inline-block';
        newAddressForm.style.display = 'none';
        // Clear the input field when cancel is clicked
        addressInputFields.forEach((input) => {
            input.value = "";
        });
        addNewAddressContainer.style.backgroundColor = ""

         // Scroll back to the top of the page
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // You can change this to 'auto' for instant scrolling
  });
        
        event.preventDefault();
    });

if(address){
  //edit form
const addressBoxs = document.getElementById('adress-box2')
document.querySelectorAll('.address-box .dropdown .dropdown-content a[href="#"]').forEach(function(editLink) {
        editLink.addEventListener('click', function(event) {
            // Get the parent address box element
            const addressBox = editLink.closest('.address-box');
            // Show the edit address form inside the clicked address box
            const editAddressForm = addressBox.querySelector('#edit-address-form');
            if (editAddressForm) {
              editAddressForm.style.display = 'block';
              addressBoxs.style.display = 'none';
          
              // Hide the other edit address forms (if any) on other address boxes
              document.querySelectorAll('.address-box #edit-address-form').forEach(function(form) {
                  if (form !== editAddressForm) {
                      form.style.display = 'none';
                  }
              });
          }else{console.log("nop")}

            // Handle other logic related to edit functionality if needed

            event.preventDefault();
        });
    });

 // Event listener for Cancel button click in the edit address form
 const cancelEditAddressButton = document.getElementById('cancel-address-btn2');
    cancelEditAddressButton.addEventListener('click', function (event) {
        // Get the parent address box element
        const addressBox = document.querySelector('.address-box');
        // Hide the edit address form and show the address box content
        const editAddressForm = addressBox.querySelector('#edit-address-form');
        editAddressForm.style.display = 'none';
        addressBox.querySelector('#adress-box2').style.display = 'block';

        // Clear the input fields in the edit address form
        const editAddressInputFields = editAddressForm.querySelectorAll('input');
        editAddressInputFields.forEach((input) => {
            input.value = '';
        });

   // Scroll back to the top of the page
   window.scrollTo({
    top: 0,
    behavior: 'smooth' // You can change this to 'auto' for instant scrolling
});

        event.preventDefault();
    });
}

});
if(checkout){
  document.addEventListener("DOMContentLoaded", function () {
    // Event listener for Edit link click
    document.querySelectorAll('.address-box .dropdown .dropdown-content a[href="#"]').forEach(function (editLink) {
        editLink.addEventListener('click', function (event) {
            // Get the parent address box element
            const addressBox = editLink.closest('.address-box');
            // Show the edit address form inside the clicked address box
            const editAddressForm = addressBox.querySelector('#edit-address-form');
            const originalAddressContent = addressBox.querySelector('#adress-box2');

            if (editAddressForm && originalAddressContent) {
                // Toggle visibility of address and edit form
                editAddressForm.style.display = 'block';
                originalAddressContent.style.display = 'none';

                // Hide the other edit address forms (if any) on other address boxes
                document.querySelectorAll('.address-box #edit-address-form').forEach(function (form) {
                    if (form !== editAddressForm) {
                        form.style.display = 'none';
                    }
                });
            }

            // Handle other logic related to edit functionality if needed

            event.preventDefault();
        });
    });

    // Event listener for Cancel button click in the edit address form
    document.querySelectorAll('.address-box #cancel-address-btn2').forEach(function (cancelBtn) {
        cancelBtn.addEventListener('click', function (event) {
            // Get the parent address box element
            const addressBox = cancelBtn.closest('.address-box');
            // Hide the edit address form and show the address box content
            const editAddressForm = addressBox.querySelector('#edit-address-form');
            const originalAddressContent = addressBox.querySelector('#adress-box2');

            if (editAddressForm && originalAddressContent) {
                // Toggle visibility of address and edit form
                editAddressForm.style.display = 'none';
                originalAddressContent.style.display = 'block';
            }

            // Clear the input fields in the edit address form
            const editAddressInputFields = editAddressForm.querySelectorAll('input');
            editAddressInputFields.forEach((input) => {
                input.value = '';
            });

   // Scroll back to the top of the page
   window.scrollTo({
    top: 0,
    behavior: 'smooth' // You can change this to 'auto' for instant scrolling
});

            event.preventDefault();
        });
    });
});


// form validation to check address and payment mode selected
document.addEventListener("DOMContentLoaded", function () {
    const addressInputElems = document.getElementsByClassName("js-radioInput");
    const paymentInputElems = document.querySelectorAll('[name="paymentMethod"]');
    const myButton = document.getElementById("my_button");
    const messageContainer = document.getElementById("message_container");

    function handleRadioChange() {
        let isAddressSelected = false;
        for (let i = 0; i < addressInputElems.length; i++) {

            if (addressInputElems[i].checked) {
                isAddressSelected = true;
                break;
            }

        }

        let isPaymentSelected = false;
        for (let i = 0; i < paymentInputElems.length; i++) {
            if (paymentInputElems[i].checked) {
                isPaymentSelected = true;
                break;
            }
        }

        const isDisabled = !(isAddressSelected && isPaymentSelected);
        myButton.disabled = isDisabled;

        // Show/hide messages based on button state
        messageContainer.style.display = isDisabled ? 'inline' : 'none';

        if (!isAddressSelected && !isPaymentSelected) {
            messageContainer.innerHTML = 'Please select an address and a payment method';
        } else if (!isAddressSelected) {
            messageContainer.innerHTML = 'Please select an address';
        } else if (!isPaymentSelected) {
            messageContainer.innerHTML = 'Please select a payment method';
        } else {
            messageContainer.innerHTML = ''; // Clear the message if both are selected
        }
    }

    for (let i = 0; i < addressInputElems.length; i++) {
        const elem = addressInputElems[i];
        elem.addEventListener("change", handleRadioChange);
    }

    for (let i = 0; i < paymentInputElems.length; i++) {
        const elem = paymentInputElems[i];
        elem.addEventListener("change", handleRadioChange);
    }

    // Initial check to disable/enable button and show/hide message on page load
    handleRadioChange();
});



}
}


console.log("hai testing end of js")