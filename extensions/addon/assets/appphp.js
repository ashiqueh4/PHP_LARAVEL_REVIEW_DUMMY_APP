 async function fetchdata() {
  const url = `${location.origin}/apps/inter/getdata/`;
  let response = await fetch(url)
  .then(response => response.json())
  return response;
   
}


let loginForm = document.getElementById("app_ext_form_inner");
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("app js working")
    let formData = new FormData(loginForm);
    var name = formData.get('name');
    var email = formData.get('email');
    var description = formData.get('description');

    let data_for=JSON.stringify({"name":name,"email":email,"description":description,"shop":Shopify.shop});
 
    // handle submit
    //   e.target.reset();

    var http = new XMLHttpRequest();
    var url = `${location.origin}/apps/inter/postdata/`;
    var params =data_for;
    http.open('POST', url, true);
    
    //Send the proper header information along with the request
    http.setRequestHeader('Content-type', 'application/json');
    
    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            console.log(http.responseText);
            e.target.reset();
        }
    }
    http.send(params);


  });


  fetchdata().then(

    function(value) {
      if(value.data.length >0){

        value.data.map((item)=>{
          const htmld = `<div class="phpapp_b">
          <h3>${item.name}</h3>
          <h3>${item.email}</h3>
          <p>${item.description}</p>
          </div>`;
          const htmldd = document.getElementById('store_feedback');
          htmldd.innerHTML += htmld;

        })
        console.log(value.data)
      }else{

      }
    },
    function(error) {
      console.log(error)
      }
  );

  // window.onload("load", (event) => {

  //   console.log("page is fully loaded");
   
  // });
