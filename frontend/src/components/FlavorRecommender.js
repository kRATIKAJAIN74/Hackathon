import React, {useState} from 'react'

export default function FlavorRecommender(){
  const [q,setQ] = useState('chickpeas')
  const [res,setRes] = useState(null)
  const run = ()=>{
    fetch('/flavorpairings?ingredient='+encodeURIComponent(q)).then(r=>r.json()).then(j=>setRes(j)).catch(()=>setRes(null))
  }
  return (
    <div style={{border:'1px solid #ddd',padding:12,marginTop:12}}>
      <h3>Flavor Recommender</h3>
      <div style={{display:'flex',gap:8}}>
        <input value={q} onChange={e=>setQ(e.target.value)} />
        <button onClick={run}>Suggest</button>
      </div>
      {res && (
        <div style={{marginTop:8}}>
          <div><strong>{res.ingredient}</strong> pairs with:</div>
          <div>{(res.pairings||[]).slice(0,10).join(', ')}</div>
        </div>
      )}
    </div>
  )
}
