import React, {useEffect, useState} from 'react'

export default function RecipeOfDay(){
  const [r, setR] = useState(null)
  useEffect(()=>{
    fetch('/recipeofday').then(r=>r.json()).then(j=>setR(j)).catch(()=>{})
  },[])
  if(!r) return <div>Loading recipe of the day...</div>
  return (
    <div style={{border:'1px solid #ddd',padding:12,marginBottom:12}}>
      <h3>Recipe of the Day</h3>
      <strong>{r.title}</strong>
      <div>Calories: {r.nutrition?.calories} | Region: {r.region}</div>
      <div>Ingredients: {(r.ingredients||[]).slice(0,6).join(', ')}</div>
    </div>
  )
}
