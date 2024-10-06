import React from 'react'

export  const ItemAction = ({onclickbtn,index}) => {

  return (
    <div>
        <button onClick={()=>onclickbtn(index)}>Delete</button>
    </div>
  )
}

