import {useSelector,useDispatch} from 'react-redux';

function App() {

  let dispatch=useDispatch()

let pokreni=(obj)=>{
  dispatch(obj)
}

let pokreni2=(obj)=>{
  dispatch(obj)
}






  return (
    <div className="App">
     <input type="text"/>
     <button onClick={()=>pokreni({type: "BEZVEZE"})}>Pokreni BEZVEZE</button>
     <button onClick={()=>pokreni2({type: "LUDILO"})}>Pokreni LUDILO</button>
     <button onClick={()=>pokreni({type: "U_POZADINI"})}>U pozadini</button>
     <p>Uvijek stavi yield ispred nekog efekta tj. saga metode.Ako se nešto čudno događa onda je obično to uzrok. 
     </p>
    </div>
  );
}

export default App;
