
window.onload = async () => {
    const seleted_d=document.getElementById('AppProduct_inner_box');
    const moneyf = seleted_d.getAttribute("dstorec").replace('{{amount}}','');
    const pid = seleted_d.getAttribute("pid");
  
    const url = `${location.origin}/apps/inter/getproductaddon?shop=${Shopify.shop}&pidselected=${pid}`;
    await fetch(url)
    .then(response => response.json())
    .then(pdata => {
          if(pdata.length >0){
            pdata.map((item)=>{
              let htmld;
               if(item.selectedoption=="text"){
                 htmld = `<div class="phpapp_pa">
                <h3 id="app_addon_t">${item.title}</h3>
                <h3>${moneyf}${item.price}</h3>
                <input type="checkbox" id="app_pd_sl"
                 data-display-val="${item.title} (+${moneyf}${item.price})" 
                 data-price="${item.price}"
                 data-variant-id="${item.id}" 
                 value="${item.title} [${moneyf}${item.price}]"
                 >
                <label for=${item.title}>Add to cart</label>
                </div>`;
              }
              if(item.selectedoption=="dropdown"){
                 htmld = `<div class="phpapp_pa">
                <h3 id="app_addon_t">${item.title}</h3>
                <h3>${moneyf}${item.price}</h3>
                <input type="checkbox" id="app_pd_sl"
                 data-display-val="${item.title} (+${moneyf}${item.price})" 
                 data-price="${item.price}"
                 data-variant-id="${item.id}" 
                 value="${item.title} [${moneyf}${item.price}]"
                 >
                <label for=${item.title}>Add to cart</label>
                </div>`;
              }
              if(item.selectedoption=="radio"){
                 htmld = `<div class="phpapp_pa">
                <h3 id="app_addon_t">${item.title}</h3>
                <h3>${moneyf}${item.price}</h3>
                <input type="checkbox" id="app_pd_sl"
                 data-display-val="${item.title} (+${moneyf}${item.price})" 
                 data-price="${item.price}"
                 data-variant-id="${item.id}" 
                 value="${item.title} [${moneyf}${item.price}]"
                 >
                <label for=${item.title}>Add to cart</label>
                </div>`;
              }
              if(item.selectedoption=="productaddon"){
                 htmld = `<div class="phpapp_pa">
                <h3 id="app_addon_t">${item.title}</h3>
                <h3>${moneyf}${item.price}</h3>
                <input type="checkbox" id="app_pd_sl"
                 data-display-val="${item.title} (+${moneyf}${item.price})" 
                 data-price="${item.price}"
                 data-variant-id="${item.id}" 
                 value="${item.title} [${moneyf}${item.price}]"
                 >
                <label for=${item.title}>Add to cart</label>
                </div>`;
              }

                const htmldd = document.getElementById('AppProduct_inner_box');
                htmldd.innerHTML += htmld;
        
              })
              document.getElementById('productAddon_app_Ex_wrapper').style.display = "block";
            }else{
              document.getElementById('productAddon_app_Ex_wrapper').style.display = "none";
            }

    })
    // new to add selected data into the array
      var a = [],
      e = document.querySelectorAll("#app_pd_sl");
      e.forEach(function(t) {
      t.addEventListener("change", t => {
          a = [], 
          e.forEach(function(t) {
              var i = !!t.options && t.options[t.options.selectedIndex].selected;
            (t.checked || i) && a.push(t.value)
          })
  
      })
      })
    //end new

    const elementbtnapp = document.querySelector(".product-form__submit");
    elementbtnapp.addEventListener("click", function(event) {
      if(a.length > 0) {
        event.preventDefault();
        this.classList.add("dactive");
        const selectedapp_pid = document.querySelector('.product-variant-id').value;
        let qn;
        if(document.querySelector('.quantity__input')){
          qn= document.querySelector('.quantity__input').value;
        }else{
          qn=1
        }
    
              let properties_obj = {};  
              for (i = 0; i < a.length; i++) {
                properties_obj[`addon_${i}`] = a[i];
              }
              let formData = {
                'items': [{
                'id':selectedapp_pid,
                'quantity':qn,
                  properties: properties_obj
                }]
              };
              fetch(window.Shopify.routes.root + 'cart/add.js', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
              })
              .then(response => {
                //  return response.json();
                location.href = '/cart';
              })
              .catch((error) => {
                console.error('Error:', error);
              });
              
          }

    });

};


