import React from 'react'
import { Card, Page, Layout, LegacyCard, Text,EmptyState, Grid,ButtonGroup,Button } from "@shopify/polaris";
import { useTranslation } from "react-i18next";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import logoAdd from '../assets/VM3x.gif';
import logoDelete from '../assets/delete.gif';
import ViewIcon from '../assets/ViewIcon.svg';
import { useMutation } from 'react-query'
import { Currency,AssignProducts } from "../components";

export const AddonListing = () => {
   
    const fetch = useAuthenticatedFetch();
    
    const {data,isLoading,refetch: refetchAddons} = useAppQuery({
      url: "/api/storeAppData",
      reactQueryOptions: {
        onSuccess: (data) => {
          // setSelectedPid(data?.products[0].id)
          // console.log(data)
        },
      },
    });
  
  
    const mutationDelete = useMutation({
      mutationFn: async(id) => {
        return await fetch(`/api/storeAppData`,{
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({'id':id})
      })
      },
      onSuccess: async (data, variables, context) => {
         await refetchAddons()
        console.log(data.status)
        console.log("I'm first!")
  
      },
      onSettled: async () => {
         await refetchAddons()
        console.log("I'm second!")
      },
      onError: (error, variables, context) => {
        // I will fire first
      },
    })
  
    const addonEditf=(id)=>{
      console.log("addonEditf"+id)
    
    }
    const addonDeletef=(id)=>{
      console.log("addonDeletef"+id)
      mutationDelete.mutate(id)
    }
    if (mutationDelete.isLoading) {
      return (
        <>
        <div className='adding-processing-div' id='adding_processing_div' style={{ textAlign:"center"}}>
        <img src={ logoDelete } alt='data-processing'/>
        <div className='addon_adding'>Please wait Deleting is underprocess</div>  
        </div>
        </>
        ) 
      }
  
    if(isLoading) {
      return (
        <div id='adding_processing_divlist' style={{ textAlign:"center",
        minHeight:"250px",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <img src={ logoAdd } alt='data-processing' style={{ width:"100px"}} />
        </div>
      )
    }
  
    if(!isLoading && data.length == 0) {
      return (
        <LegacyCard sectioned>
        <EmptyState
          heading="No Data Available"
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        >
        </EmptyState>
      </LegacyCard>
      )
    }
  return (
    <Grid>
    { !isLoading && data?.map((datalist)=>{

      return(
        <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}} key={datalist.id}>
        <LegacyCard title={datalist.title} sectioned>
          <p><Currency Cprice={datalist.price}/></p>
          <div>
            <span>Product Assign</span>
            <div className="product-grid" style={{display:"flex",alignItems:"center",gap:"10px",paddingBottom:"10px"}}>
           <img src={datalist.pimage} alt={datalist.ptitle} style={{width:"55px"}}/>
           <h3>{datalist.ptitle}</h3>
      </div>
      <div className='preview_l'>
        <a href={`https://${datalist.shop}/products/${datalist.purl}`} target="_blank"><img src={ViewIcon} style={{ width:'30px'}}/></a>
      </div>
      </div>
        <ButtonGroup>
        <Button onClick={()=>addonEditf(datalist.id)}>Edit</Button>
        <Button onClick={()=>addonDeletef(datalist.id)}>Delete</Button>
      </ButtonGroup>
        </LegacyCard>
      </Grid.Cell>
      )
    })}
  </Grid>
  )
}
