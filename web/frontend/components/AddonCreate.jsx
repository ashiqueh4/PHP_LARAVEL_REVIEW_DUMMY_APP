import React,{useState,useCallback,useEffect} from 'react'
import {FormLayout, TextField,Button,Select ,Form} from '@shopify/polaris';
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import {useMutation} from 'react-query'
// import '../assets/addon.css';
import logoAdd from '../assets/VM3x.gif';


export const AddonCreate = () => {
  let fetch = useAuthenticatedFetch();

  const [selected, setSelected] = useState();
  const [selectedp, setSelectedp] = useState('text');
  const [pidselected, setSelectedPid] = useState();
  const [price, setPrice] = useState('0.0');
  const [title, setTitle] = useState();
  const [ptitle, setPtitle] = useState();
  const [phandle, setPhandle] = useState();
  const [pimage, setPimage] = useState();
  const [addonAdded, setAddonAdded] = useState(false);
  const [addonError, setAddonError] = useState(false);
  const [addonInputr, setAddonInputr] = useState(false);
  


  const addonAddedf=()=>{
    setAddonAdded(false);
  }
  const addonErrorf=()=>{
    setAddonError(false);
  }
  const addoninputrf=()=>{
    setAddonInputr(false);
  }
    const {data,isLoading,refetch } = useAppQuery({
        url: "/api/products",
        reactQueryOptions: {
          onSuccess: (data) => {
            // console.log(data)
            setSelectedPid(data?.products[0].id)
            setPtitle(data?.products[0].title)
            setPimage(data?.products[0].image.src)
            setPhandle(data?.products[0].handle)
          },
        },
      });

      useEffect(() => {
        refetch();
      }, [refetch]);
    
      const mutationData = useMutation({
        mutationFn: async(FormData) => {
          return await fetch(`/api/storeAppData`,{
            method: 'POST',
            body:JSON.stringify(FormData)
        })
        },
        onSuccess: async () => {
          // await refetchProductCount()
          console.log("I'm first!");
          setPrice();
          setTitle();
          setTimeout(function() { addonAddedf(); }, 5000);
          
        },
        onSettled: async () => {
          // await refetchProductCount()
          console.log("I'm second!");
        },
        onError: (error) => {
          // Remove optimistic todo from the todos list
          setTimeout(function() { addonErrorf(); }, 5000);
        },
      })

      const result = data?.products.map((item, index) => ({label: item.title,value:item.title+':'+item.id+':'+`image:${item.image?.src}`+':handle-'+item.handle}));
      
      const options = result;
          //SELECT options
          const optionsp = [
            {label: 'text', value: 'text'},
            {label: 'dropdown', value: 'dropdown'},
            {label: 'radio', value: 'radio'},
            {label: 'product addon', value: 'productaddon'},
          ];
     

      const handleSelectChange = useCallback(
        (value) => {
            setSelected(value);
            value.split(':')[1]
            setSelectedPid(Number(value.split(':')[1]))
            setPtitle(value.split(':')[0])
            setPimage(value.split('image')[1].slice(1))
            setPhandle(value.split(':handle-')[1])

  
        },
        [],
      );
   
      //price

      const handleChange = useCallback(
        (newValue) => setPrice(newValue),
        [],
      );
      const handleChangeTitle = useCallback(
        (title) => setTitle(title),
        [],
      );
      const handleSelectChangep = useCallback(
        (value) => setSelectedp(value),
        [],
      );
      const handleSubmit =() => {
        // console.log(phandle)
      // console.log({title,price,pidselected,selectedp})
      if (title && price > 0){
      
      const formData ={title:title,price:price,pidselected:pidselected,selectedp:selectedp,ptitle:ptitle,pimage:pimage,phandle:phandle};
      mutationData.mutate(formData)
      }else{
        setAddonInputr(true)
        setTimeout(function() { addoninputrf(); }, 5000);
      }

      };
 
  if (mutationData.isLoading) {
    return (
      <>
      <div className='adding-processing-div' id='adding_processing_div' style={{textAlign:'center'}}>
      <img src={ logoAdd } alt='data-processing'/>
      <div className='addon_adding'>Please wait insertion is underprocess</div>  
      </div>
      </>
      ) 
    }

    if(isLoading){
      return(
      <div id='adding_processing_divlist' style={{ textAlign:"center",
      minHeight:"250px",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <img src={ logoAdd } alt='data-processing' style={{ width:"100px"}} />
      </div>
      )
    }

  return (
      <>
      <Form onSubmit={handleSubmit}>
         <FormLayout >
                <div>
                <TextField label="Enter Option Title"  autoComplete="off"
                 value={title}
                 onChange={handleChangeTitle}
                 required
                />
                </div>
                <div>
                <Select
                    label="Select Option"
                    options={optionsp}
                    onChange={handleSelectChangep}
                    value={selectedp}
                    required
                    />
                </div>
                <div>
                <TextField
                    label="Price"
                    type="number"
                    value={price}
                    onChange={handleChange}
                    autoComplete="off"
                    required
                    />
                </div>
                <div>
                 <Select
                    label="Select Product"
                    options={options}
                    onChange={handleSelectChange}
                    value={selected}
                    required
                    />
                </div>
                <Button submit>Submit</Button>
          </FormLayout>
       </Form>
     { addonAdded && <div className='addonAdded-success' style={{ color:"green"}}>Addon is added!</div>}
     { addonError && <div className='addonAdded-error' style={{ color:"red"}}>Addon is not complited! due to network issue</div>}
     { addonInputr && <div className='addonAdded-inputs' style={{ color:"red"}}>You must have to fill all inputs</div>}
      </>
  )
}

