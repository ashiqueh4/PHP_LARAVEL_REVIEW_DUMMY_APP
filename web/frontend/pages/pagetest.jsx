import React from 'react'
import { Testpagec } from '../components'
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
const pagetest = () => {
  const fetch = useAuthenticatedFetch();
  const {
    data,
    isLoading,
  } = useAppQuery({
    url: "/api/orders",
  });
  if(!isLoading)console.log(data)

  return (
    <div>
    <Testpagec/>
   </div>
  )
}

export default pagetest