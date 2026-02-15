import React, {useEffect, useState} from 'react'

export default function RecipeList(){
  const [recipes, setRecipes] = useState([])
  useEffect(()=>{
    fetch('/recipes').then(r=>r.json()).then(j=>setRecipes(j.recipes||[])).catch(()=>{})
  },[])
  return (
    <div>
      <h2>Recipes</h2>
      <div style={{maxHeight:400,overflow:'auto',border:'1px solid #ddd',padding:10}}>
        {recipes.map(r=> (
          <div key={r.recipe_id||r._id} style={{borderBottom:'1px solid #eee',padding:8}}>
            <strong>{r.title}</strong>
            <div>Region: {r.region} | Calories: {r.nutrition?.calories}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
