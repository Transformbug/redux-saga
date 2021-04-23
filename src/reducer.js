let intialState={
    prviKey: "originalna vrijednost",
    drugiKey:"originalna vrijednost",
    stPlanetName: ""
}

 function reducer(state=intialState,action){
  //  console.log("ovo je reducer")
  //  console.log("action:",action)
    switch(action.type){
      case "PRVI_KEY":
       return {...state, prviKey:"NOVA VRIJEDNOST"};
       case "DRUGI_KEY":
        return {...state, drugiKey:"NOVA VRIJEDNOST"};
      case "ST_PLANET_NAME":
        // console.log("action.payload", action.payload)
       return {...state, stPlanetName: action.payload}  
      default: 
      return state    
    }
}

export default reducer