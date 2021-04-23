import {throttle,call,fork,cancel,take,delay,takeLatest} from 'redux-saga/effects';

//throttle,ima posebni efekt
function* izvršiSaga(){
   yield console.log("izvršiSaga")
}

//Praktički default postavke throttle od underscore su ovdje prijenjene na throttle efekt. Znači leading:true i trailing:true.
export function* watchSomethingAndThrottle(){
    yield throttle(10000,"BEZVEZE",izvršiSaga)
}

//--------------------------------------------------------------------------------

//deboucing sa sagama, nema poseban effect nego se radi na ova dva načina, u oba slučaja radi se o stanadarnom "immidiate":false kako je default u undersocre:

//1:
  function* handleInput(input) {
    yield delay(5000)
    yield console.log("ovo je handleInput")
  }
  
  
  export function* watchInput() {
    let task
    while (true) {
      const { input } = yield take('BEZVEZE')
      if (task) {
        yield cancel(task)
      }
      task = yield fork(handleInput, input)
    }
  }
  
  //2:
  function* handleInputDrugaVerzija({ input }) {
    yield delay(5000)
    yield console.log("ovo je handleInputDrugaVerzija")
    
  }
  
  export function* watchInputDrugaVerzija() {
    yield takeLatest('BEZVEZE', handleInputDrugaVerzija);
  }

