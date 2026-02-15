import React, {useEffect, useState} from 'react'
import { Bar, Scatter, Pie } from 'react-chartjs-2'
import { Chart, LinearScale, CategoryScale, BarElement, PointElement, Tooltip, Legend, ArcElement, PieController, BarController, ScatterController } from 'chart.js'

// Register all controllers/elements we use (bar, pie, scatter)
Chart.register(LinearScale, CategoryScale, BarElement, BarController, PointElement, ScatterController, ArcElement, PieController, Tooltip, Legend)

export default function NutritionChart(){
  const [recipes, setRecipes] = useState([])
  useEffect(()=>{
    fetch('/recipes?limit=100').then(r=>r.json()).then(j=>setRecipes(j.recipes||[])).catch(()=>{})
  },[])

  const barData = {
    labels: recipes.map(r=>r.title?.slice(0,20)),
    datasets: [
      { label: 'Calories', data: recipes.map(r=>r.nutrition?.calories||0), backgroundColor: 'rgba(75,192,192,0.6)' },
      { label: 'Protein', data: recipes.map(r=>r.nutrition?.protein||0), backgroundColor: 'rgba(192,75,192,0.6)' }
    ]
  }

  const scatterData = {
    datasets: [{label:'cal vs prep', data: recipes.map(r=>({x: r.nutrition?.calories||0, y: (r.prep_time||0)})), backgroundColor:'rgba(100,150,255,0.6)'}]
  }

  // diet distribution
  const diets = {}
  recipes.forEach(r=>{
    const d = (r.diet && (Array.isArray(r.diet)? r.diet[0]: r.diet)) || 'unknown'
    diets[d] = (diets[d]||0)+1
  })
  const pieData = { labels: Object.keys(diets), datasets: [{ data: Object.values(diets), backgroundColor: ['#ff6384','#36a2eb','#ffcd56','#4bc0c0'] }] }

  return (
    <div>
      <h3>Nutrition Dashboard</h3>
      <div style={{height:240}}>
        <Bar data={barData} />
      </div>
      <div style={{height:240}}>
        <Scatter data={scatterData} />
      </div>
      <div style={{height:240,width:240}}>
        <Pie data={pieData} />
      </div>
    </div>
  )
}
