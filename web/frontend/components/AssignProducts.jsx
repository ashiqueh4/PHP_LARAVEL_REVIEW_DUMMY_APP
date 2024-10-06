import { useAppQuery } from "../hooks";
import { useState ,useEffect} from "react";

export const AssignProducts = ({id}) => {
  const [sc,setSt]=useState()
  const {data,isLoading,refetch} = useAppQuery({
    url: `/api/products/${id}`,
    reactQueryOptions: {
      onSuccess: (data) => {
      },
    },
  });
  useEffect(() => {
    refetch();
  }, [refetch]);
 
// console.log(id)

  return (
    <>
    {!isLoading && <div><span>Product Assign</span><div className="product-grid" style={{display:"flex",alignItems:"center",gap:"10px",paddingBottom:"10px"}}>
    <img src={data.product.image.src} alt={data.product.title} style={{width:"55px"}}/>
    <h3>{data.product.title}</h3>
      </div>
      </div>}
  </>

  )
}

