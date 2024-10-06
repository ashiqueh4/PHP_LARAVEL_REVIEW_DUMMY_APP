const currentURL = window.location.href;

if (currentURL.includes('/cart')) {

const cartprice= async()=>{
    const url = `${location.origin}/cart.json`;
    let extraprice=[]
    await fetch(url)
    .then(response => response.json())
    .then(cartitems => {
      cartitems.items.map((citem)=>{
        if(Object.keys(citem.properties).length){
        values = Object.keys(citem.properties)?.map(function (key) {
          const str =citem.properties[key];
          const regex = /^(.*?) \[(.*?)?(\d+(?:\.\d+)?)\]$/;
          const match = str.match(regex);
          
          if (match) {
            const text = match[1]; 
            const currency = match[2]; 
            const number = parseFloat(match[3]);
            return number;
          } else {
            return 0;
          }
            
        });
          extraprice.push(parseFloat(values.reduce((a, b) => a + b, 0)))
        }
        // console.log(citem.line_price)
        const item_price =parseFloat(citem.presentment_price * citem.quantity);
        extraprice.push(item_price)
        
      })
    })
  return extraprice;
}

const cartsub=async()=>{
  let final_price=await cartprice();
   const sub_t_p=final_price.reduce((a, b) => a + b, 0);
   const st_value= document.querySelector(".totals__total-value").innerHTML;
       const str_c = st_value;
        const regex = /^([^\d]+)([\d,]+(?:\.\d+)?)$/;
        const match = str_c.match(regex);
        if (match) {
          const currency = match[1]; 
          const subt_price=`${currency}${parseFloat(sub_t_p).toFixed(2)}`;
          const nodeList = document.querySelectorAll(".totals__total-value");
            for (let i = 0; i < nodeList.length; i++) {
              nodeList[i].innerHTML = subt_price;
            }
    } 

}

window.onload = async () => {
await cartsub();

};


const parentElement = document.querySelector("#cart");
parentElement.addEventListener("click", async function(event) {
    if (event.target.matches(".quantity__button")) {
        setTimeout(async() => {
        console.log("Delayed for 1 second.");
          await cartsub();
      },2000);

    }
});

const cartinfo= async()=>{
  const url = `${location.origin}/cart.json`;
  let cartinfoa=[]
  let custompd,extrap;
  await fetch(url)
  .then(response => response.json())
  .then(cartitems => {
    cartitems.items.map((citem)=>{
      if(Object.keys(citem.properties).length){
      values = Object.keys(citem.properties)?.map(function (key) {
        const str =citem.properties[key];
        const regex = /^(.*?) \[(.*?)?(\d+(?:\.\d+)?)\]$/;
        const match = str.match(regex);
        
        if (match) {
          const text = match[1]; 
          const currency = match[2]; 
          const number = parseFloat(match[3]);
          return number;
        } else {
          return 0;
        }
          
      });
        extrap= parseFloat(values.reduce((a, b) => a + b, 0));
        custompd={
          "custompId":citem.variant_id,
          "custompQn":citem.quantity,
          "custompPro":citem.properties,
          "custompPri":extrap,
          "custompTit":citem.title,
        }
  
        cartinfoa.push(custompd);
      }else{

         custompd={
          "custompId":citem.variant_id,
          "custompQn":citem.quantity,
          "custompPro":citem.properties,
          "custompPri":'',
          "custompTit":citem.title,
        }
  
        cartinfoa.push(custompd);

      }
      
    })
  })
return cartinfoa;
}


document.querySelector('#checkout').addEventListener("click", async function(event) {
  event.preventDefault(); 
  this.style.pointerEvents = "none";

  let cart_details = await cartinfo()
  let data = {
    'cartv': cart_details,
    'shop': Shopify.shop,
    // Add more key-value pairs as needed
};
  // console.log(data)
  var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) 
    };

    var url =`${location.origin}/apps/inter/draft_orders`;

    await fetch(url, options)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {  
        // Handle the response data here
        console.log('Success:', data.checkout_url);
        window.location.replace(data.checkout_url);

    })
    .catch(error => {
        this.style.pointerEvents = "block";
    });
  

});



}




