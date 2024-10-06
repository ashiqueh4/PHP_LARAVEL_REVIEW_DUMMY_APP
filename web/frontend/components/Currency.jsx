import { useAppQuery } from "../hooks";
import { useState,useEffect } from "react";

export const Currency = ({Cprice}) => {
  const [sc,setSt]=useState()
  const [price,setPrice]=useState(Cprice)
  const {data,isLoading,refetch} = useAppQuery({
    url: "/api/shop",
    reactQueryOptions: {
      onSuccess: (data) => {
        const amountString = data.shop.money_format;
        const currencySymbol = amountString.substring(0, 1);
        const fp=`${currencySymbol}${price}`
        setSt(fp)
      },
    },
  });
  useEffect(() => {
    refetch();
  }, [refetch]);



  return (
    <span>{!isLoading && sc}</span>
  )
}

