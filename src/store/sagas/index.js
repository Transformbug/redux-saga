import { takeEvery, all, takeLatest } from "redux-saga/effects";
//takeEvery,listen samo actions and do something when they occur,navodno.

import * as actionTypes from "../actions/actionTypes";
import {
  logoutSaga,
  checkAuthTimeoutSaga,
  authUserSaga,
  authCheckStateSaga
} from "./auth";
import { initIngredientsSaga } from "./burgerBuilder";
import { purchaseBurgerSaga, fetchOrdersSaga } from "./order";


//Ovo je odvojio sve na watchAuth,watchBurgerBuilder, watchOrder samo zato jer u sagama imamo tri file auth.js,burgerBuilder i order.js uz ovaj index.
//Mogao je on sve skupa ovo teoretski staviti i onda u index.js u src samo pozvaiti jedan put sagaMiddleware.run(), ali je odličio ovako odvojiti...
//Zovu se watcher sagas...

//VAŽNO:takeEvery i takeLatest razlika. takeevery pokreće worker sagu svaki put kad put() ili disptach() aktiviraju action creator koji taj takeEvery tj. saga u kojoj se nalazi takeEvery
//nadzire. takeLatest pokreće samo jedan put i uzima zadnji. Testiraj jel vremenski razmak bitan, recimo zove disptah() svaki put kad se klikne botun. Testiraj jel kako se ponaša
//kad je veći vremenski razmak. 
//VAŽNO: postoji još i take(), treba saznati što on radi i kako se razlikuje u odnosu na ova dva.

//VAŽNO:Ovdje nam all za to nije trebao, ali glavna korisnost mu je da može concurrently pozvati više async akcija.Znači možemo ga koristii sa axiosom.
//Čini mi se da je taj all sličan Promise all jer postoji i race() u saga reduxu koji je sličan promise race.

//VAŽNO: saznaj čemu služi i što radi fork metoda u redux saga.


//VAŽNO: posao ovih takeEvery i takeLates je da nadziru aktivacuju nekog put() ili disptach() čiji action kreator returna objekt action objekt čije je type naveden u prvom
//argumentu. Kad se to dogodi onda ono što ubacimo u drugi argument će pokrenuti umjesto reducera tj. pokrenuti će se worker saga. 
//Znači ovo blokira put do reducera i aktivira worker sagu čiji će put() pokrenuti reducer ili čiji će put() biti blokiran od nekog drugoga saga watchera ovdje i onda će se
//pokrenuti nova worker saga.
//VAŽNO: ako se u drugi argument ubaci worker saga i onda se u toj worker sagi pozove put() koji unutar kojeg se nalazi action creator koji returna isti objekt kao i onaj
//action kreator koji zbog kojeg se uopće pokrenula worker saga o kojoj govorimo, dogodit će se infinti loop jer će se opet blokirati taj put() i opet će se pokrenuti taj 
//worker saga() koja će opet pozviati isti put() koji će biti blokiran itd.
//Iz toga razloga nikada ovaj AUTH_CHECK_TIMEOUT ili neki od actio typsa koji se ovdje prate neće biti zapisani kao neka swich case opcija u reduceru jer to nema smisla
//radi infine loop-a.
//VAŽNO: ovaj actioTypes.AUTH_USER recimo kojeg uvozimo je samo objekt pristupanje koje returna vrijednost tj. onaj string.Mogli smo imporatit action kreatore pozvati ih,
//i onda pritupimit njhovm objekut kojeg su returnali sa type i opet bi dobili istu stvar. Uvozimi iz onog file čisto radi jednostavnosti.

export function* watchAuth() {
  yield all([
    takeEvery(actionTypes.AUTH_CHECK_TIMEOUT, checkAuthTimeoutSaga),
    takeEvery(actionTypes.AUTH_INITIATE_LOGOUT, logoutSaga),
    takeEvery(actionTypes.AUTH_USER, authUserSaga),
    takeEvery(actionTypes.AUTH_CHECK_STATE, authCheckStateSaga)
  ]);
}

export function* watchBurgerBuilder() {
  yield takeEvery(actionTypes.INIT_INGREDIENTS, initIngredientsSaga);
}

export function* watchOrder() {
  yield takeLatest(actionTypes.PURCHASE_BURGER, purchaseBurgerSaga);
  yield takeEvery(actionTypes.FETCH_ORDERS, fetchOrdersSaga);
}
