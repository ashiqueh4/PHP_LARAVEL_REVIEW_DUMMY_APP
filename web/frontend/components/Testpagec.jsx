import React, { useState } from 'react'
import { Card, Page, Layout, TextContainer, Text } from "@shopify/polaris";
import { TitleBar,useAuthenticatedFetch } from "@shopify/app-bridge-react";
import loading from '../assets/Loading_2.gif';
import {ItemAction} from "./ItemAction"
import { useMutation,useQuery } from 'react-query'
import axios from "axios";


export const Testpagec = () => {
  const [isbtnclick,setIsbtnclcik]=useState(false)
  const fetch = useAuthenticatedFetch();

  const { isLoading, isError, data, error,refetch: refetchProductCount} = useQuery({
    queryFn: async () => {
      const response = await fetch('/api/getdata')
      return response.json()
    },
  })

  const mutationDelete = useMutation({
    mutationFn: async(id) => {
      return await fetch(`/api/deletedata`,{
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'id':id})
    })
    },
    onSuccess: async (data, variables, context) => {
       await refetchProductCount()
      console.log(data.status)
      console.log("I'm first!")
      setIsbtnclcik(false)

    },
    onSettled: async () => {
       await refetchProductCount()
      console.log("I'm second!")
      setIsbtnclcik(false)
    },
    onError: (error, variables, context) => {
      // I will fire first
    },
  })

  const onclickbtn=(id)=>{
    console.log(id)
    mutationDelete.mutate(id)
    setIsbtnclcik(true)
  }

  if (isLoading) return  <div className='cl_loading' style={{display:"flex",alignItems:"center",justifyContent:"center"}}><img src={loading} alt="Logo" /></div>
console.log(data)
const arrayDataItems = data.data.map((item,index) => {
  return (
      <div className='testwrapper' key={item.id} style={{background:"#c1c1c1",minWidth:"280px",padding:"10px"}}>
      <h1>{item.name}</h1>
      <p>{item.email}</p>
      <p>{item.description}</p>
      <ItemAction onclickbtn={onclickbtn} index={item.id}/>
      </div>
  )

});
  return (
    <Page>
      <TitleBar title='Test page'/>
      {!isbtnclick && 
            <div className='all_shop_feedback' style={{ display:'flex',alignItems:"center",justifyContent:'flex-start',flexWrap:"wrap",gap:"25px"}}>
            {arrayDataItems}
            </div>
      }
      {isbtnclick && 
    <div className='cl_loading' style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
      <img src={loading} alt="Logo" />
      <div className='dlev'>please wait delating is under process</div>
      </div>
       }
     
    </Page>
   
  )
}

