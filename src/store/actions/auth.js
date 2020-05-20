import * as actionTypes from "./actionTypes";

//VAŽNO:svaki action cretaor ovdje koji NEMA 'Ovo je novostvorne akcija za redux saga' ima svoj case u auth.js u reducers folderu i ne prati ga saga watcher u index.js saga folderu.
//Znači action creatori ovdje se ugrubo mogu podjeliti na one koje saga watcher(u index.js saga folder) 'nadgleda' tj. blokira ako se aktiviraju i kada se dispatch ili put aktivira
//te action creatore onda se automstki nakon blokade pokreće worker saga koja je navedena kao worker saga koja se pokreće nakon što je blokiran put ili disptach toga action creatora
//koji se nadgleda, dok su ostali action creatori koji nemaju saga watcher u index.js sagas folderu i oni imaju svoj case u reducer folderu.
//VAŽNO: može se dogoditi da neka dispatch() ili put() se pozove sa nekim action creatorom kojeg saga watcher nadzire i onda se kao uvijek pokrene worker saga, ali može se dogoditi
//da neki put() u toj worker sagi pozove neki action creator koji se također nadgleda u index.js u sagas folderu i onda će se aktivirati neka druga worker saga.
//VAŽNO: možemo primjeiti to osobinu redux sage, da kreiramo action types ne samo da ih disptachamo i provjeravamo u reduceru(to još uvijek možemo raditi i radimo i kad je redux saga
//instlirana), nego da kreiramo action types koji nikada neće dospjeti do reducera nego će biti blokirani od strane watcher sage i onda će se pokrenuti worker saga gdje ćemo obično
//obaviti neke side-effects i onda obično(vidi gore, ne nužno) se s put() pozvati neki action kreator koji neće biti blokriran, otiči će do reducera i update-a će se redux state. 
//VAŽNO: ja sam krivo mislio da svaki action creator kojeg saga watcher ne nadzire će imati disptach(), ali dosta ovih action kreatora koje se ne nadziru se aktivraju sa put() tj.
//u nekoj worker sagi.
//VAŽNO: doli sam se malo glupo izražavo, jasno je da su action kreatori obične fn. koje returna objekt i da kada se nazalzi unutar nekog drugo fn. pozivi bilo put() ili disptach()
// da su samo unutarji fn. call i da se onda put() i disapcth() samo zovu sa returnom unutarašnjih fn. call-ova tj. action creatora. Čudno sam se izražavo oko toga.

//Ovaj action creator nema dispatch() nego ima put() unutar auth.js sagas foldera. Nema saga watcher pa znači kad ga taj put() aktivira pozove se reducer(auth.js u reducer folderu) gdje
//postoji case za AUTH_START
export const authStart = () => {
  return {
    type: actionTypes.AUTH_START
  };
};

//Ovaj action creator nema dispatch() nego ima put() unutar dvije sagae koje su unutar auth.js u sagas folderu.Ovaj action creator nema saga watchera u index.js u sagas folderu što
//znači kad neki od tih put() koji aktiviraju ovo se aktivira da će se aktivirati reducer gdje naravno postoji case za AUTH_SUCCESS
export const authSuccess = (token, userId) => {
  return {
    type: actionTypes.AUTH_SUCCESS,
    idToken: token,
    userId: userId
  };
};

//Ovaj action creator nema dispatch() nego ima put() unutar auth.js. Index.js u saga folder tj. watchsagas ne prate ovaj action pa to znači kad put() aktivira ovo da će se aktivirati reducer.
export const authFail = error => {
  return {
    type: actionTypes.AUTH_FAIL,
    error: error
  };
};

//Ova action creator ima dispatch() u Logout.js, te ima čak tri put() unutar auth.js.Prati ga saga watcher index.js sagas folderu pa stoga svaki put kad se ovo pozove sa disptach() ili
//put() će se aktivirati logoutSaga u auth.js sagas folderu.
export const logout = () => {
  // localStorage.removeItem('token');
  // localStorage.removeItem('expirationDate');
  // localStorage.removeItem('userId');
  return {
    //Ovo je novostvorena akcija za redux saga.
    type: actionTypes.AUTH_INITIATE_LOGOUT
  };
};

//Ova action creator nema disptach nego ima put() unutar logoutSaga u auth.js u saga folderu, a ta logoutSaga se pokreće kada se u index.js u saga folderu detektira AUTH_INITIATE_LOGOUT
// tj. ovaj return logout fn. iznad.
//VAŽNO: ali pošto se u index.js u saga folderu ne prati ovaj action creator onda kada put() pozove ovu fn. to bude kao da je disptach() pozovo ovu fn. i nema saga watchera u index.js saga
//tj. reducer se aktivira.
export const logoutSucceed = () => {
  return {
    type: actionTypes.AUTH_LOGOUT
  };
};

//Ovaj action creator nema disptach() nego put() fn. u authCheckStateSaga, u auth.js sagas folderu aktivira watcher sagu u index.js sagas folderu što aktivira checkAuthTimoutSaga u auth.js
//također u sagas folderu.
//Ta saga nakon što bude delay() pozove put() sa actions.logout() unutar, a pošto index.js u sagas folderu prati actions.logout() onda to aktivira još jednu sagu tj. logoutSaga se aktivira
// te nakon što se maknu one stvari iz local storagea pozove se put() sa actions.logoutSucceed, a pošto to nema watchera u index.js sagas aktivira se auth.js u reducer folderu gdje
//postoji case za actions.logoutSuceed tj. postoji AUTH_LOGOUT case.
//upiši actions.checkAuthTimeout u generalnu tražilicu vs code.
export const checkAuthTimeout = expirationTime => {
  return {
     //Ovo je novostvorena akcija za redux saga.
    type: actionTypes.AUTH_CHECK_TIMEOUT,
    expirationTime: expirationTime
  };
};

//U Auth.js traži actions.auth da nađeš dispatch od ovog action kreatora.Samo to aktivira actions.auth().
//VAŽNO:Nakon što taj disptach() aktivira actions.auth() ne dolazi se do reducera nego se actionTypes.AUTH_USER 'nadgleda' u index.js sagas folderu tj. prati taj action type saga
//watcher onda se aktivira authUserSaga u auth.js sagas folderu. Tamo niti jedan put() tj. action creator unutar toga put-a se ne prati u index.js sagas folderu i onda neki od tih
//put() dođe to reducera(ovisno jel sve u redu ili je error tj. ovisi o internoj logici). 
export const auth = (email, password, isSignup) => {
  return {
    //Ovo je novostvorena akcija za redux saga.
    type: actionTypes.AUTH_USER,
    email: email,
    password: password,
    isSignup: isSignup
  };
};

//U Auth.js i BurgerBuilder.js traži actions.setAuthRedirectPath da nađeš dispatch od ovog action kreatora. Samo to dvoje aktivira ovaj action kreator.
//Saga watcher ne gleda ovaj action creator pa kada ovo bude dispatc-ano automatski se ide do reducera gdje naravno postoji case za SET_AUTH_REDIRECT_PATH
export const setAuthRedirectPath = path => {
  return {
    type: actionTypes.SET_AUTH_REDIRECT_PATH,
    path: path
  };
};

//U App.js ćeš naći dispatch koji korisiti ovaj authCheckState.Samo taj disptach() zove ovaj action creator.Međutim postoji saga watcher koji nadgleda ovaj actionTypes.AUTH_CHECK_STATE
//pa će se nakon toga disptach() aktivirat authCheckStateSaga.Pa ovisno o logici tamo biti će još put() poziva, ali nema smisla pisati sve opcije.
export const authCheckState = () => {
  return {
    //Ovo je nova akcija koja je dodana u redux saga lekcijama
    type: actionTypes.AUTH_CHECK_STATE
  };
};
