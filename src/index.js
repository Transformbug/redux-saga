import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {createStore,compose,applyMiddleware,combineReducers} from 'redux';
import {Provider} from 'react-redux';
import createSageMiddleware from 'redux-saga';
import PočetniReducer from './reducer.js';
import {takeBezLoopa,takeSaLoopom} from "./takeEffect"
import {callEfMain,syntaxCallTestSaga} from "./callEffect"
import {forkAndSpawnMainSaga} from "./forkANDspawn"
import {watchSomethingAndThrottle,watchInput,watchInputDrugaVerzija} from './throttleAndDebounce';
import {takeLatestClearOrNot} from './takeEveryLatestLeading';
import {testAllCombinators,testRaceCombinators,uPozadini} from "./effectCombinators"


const sagaMiddleware=createSageMiddleware()
const middlewares=[sagaMiddleware]

const rootReducer=PočetniReducer

//VAŽNO: prva i osnovna stvar je da sage NE blokiraju disptach() prema reduceru nego  "slušaju" jel se nešto aktiviraju se nakon što se reducer izvršio i returnao.
//Ako u reducre ne postoji taj case od toga disptach returnati će se default case i neće biti re-rendera i nakon toga će se pokrenuti worker
//sage koje su bile zaustvljne dok se ne dogodio neki disptahch koji se sluša u nekom takeEvery primjece.
//Također taj sistem watcher saga/worker saga se uopće ne treba koristitit. Možemo izravno ubaciti nego sagu unutar sagaMiddlware.run()
//i zaustaviti je sa take() efektom tj. metodom i ta će se saga nastaviti izvršavati kada se dogodti neki disptach tj. action koji take() sluša.
//Znači incijalno prilikom moutinga će se pokrenuti sve sage koje su unutar sagaMiddlware.run(). Ako je riječ o watcher sagi onda će se pokrenuti
//samo taj jedan put. Kasnije će se aktivirati neka worker saga kada se dogodit neki disptahc koji je watcher incijalno postavio da sluša.
//Ako je riječ o situaciji da ne koristimo watcher/worker nego izravno ubacuemo u sagaMiddlware.run() neku sagu koja ima take() onda će 
//se incijalno pokrenuti i zaustaviti na prvom take().
//Ako nam treba trenutno stanje redux store onda imamo select() efekt tj. redux metodu na rapolaganju.Jedino to od značajnih nisam obradio.
//Yild se treba staviti svaki put kada se zove neki efekt tj. saga metoda i svaki put kada želimo zaustaviti sagu dok se nešto async ne obavai
//Yiled ima efekt da poput async/awit izvuče vrijednost nekog promise kada je riječ o saga-redux middlware. Ova zadnja rečenica se odnosi
//na samostalni yield bez sage metoda, znači const nekaVar=yield fetch(url) recimo. Za svaki pojedini efekt tj. saga metodu vidi što returna. 


const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export const store = createStore(rootReducer, composeEnhancers(applyMiddleware(...middlewares)));

//Ovo neka bude uvijek uključeno, samo služi kao point da su sage neovisne tj. kada govorimo da je nešto blokirano ili nije misli se na pojedinu sagu tj.
//saga lanac jer svaki sagaMiddlware.run() je neovisan.
//VAŽNO:Ovi sagaMiddle.run() se treba uvijek napisati ispod createStore() i možemo imati koliko god hoćemo sagaMiddleware.run().
//Treba izbjegavati i biti oprazan sa root sagom tehnikom i jednim sagaMiddlware.run() pozivom  jer se može dogoditi da neki neuhuvćeni error sa try{}catch() iz
// neke sage blokira izvršenje svega.
sagaMiddleware.run(uPozadini)

//Neka od svih ovih doli samo jedan bude uključen jer svi slušaju ili BEZVEZE ILI LUDILO.
// sagaMiddleware.run(takeBezLoopa)
// sagaMiddleware.run(takeSaLoopom)

// sagaMiddleware.run(callEfMain)
// sagaMiddleware.run(syntaxCallTestSaga)

// sagaMiddleware.run(forkAndSpawnMainSaga)


// sagaMiddleware.run(watchInput)
// sagaMiddleware.run(watchInputDrugaVerzija)
// sagaMiddleware.run(watchSomethingAndThrottle)

// sagaMiddleware.run(takeLatestClearOrNot)

sagaMiddleware.run(testRaceCombinators)
// sagaMiddleware.run(testAllCombinators)





ReactDOM.render(
  <Provider store={store}>
       <App />
  </Provider>
   ,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
