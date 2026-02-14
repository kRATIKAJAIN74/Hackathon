import React from 'react'
import RecipeList from './components/RecipeList'
import RecipeOfDay from './components/RecipeOfDay'
import NutritionChart from './components/NutritionChart'
import FlavorRecommender from './components/FlavorRecommender'

export default function App(){
  return (
    <div style={{padding:20,fontFamily:'Arial'}}>
      <h1>Foodoscope — Recipe + Flavor Intelligence Engine</h1>
      <div style={{display:'flex',gap:20}}>
        <div style={{flex:1}}>
          <RecipeOfDay />
          <RecipeList />
        </div>
        <div style={{width:520}}>
          <NutritionChart />
          <FlavorRecommender />
        </div>
      </div>
    </div>
  )
}
