import { delay } from "redux-saga";
import { put, call,select } from "redux-saga/effects";
import axios from "axios";

import * as actions from "../actions/index";

//Ovo je saga alternativa logout iz orignala
//VAŽNO: još postoje sve te fn. koje su dobile saga alternativu u actions folderu u auth.js,samo imaju drugačiji sadržaja
export function* logoutSaga(action) {
  //VAŽNO: karakterstika naših saga u auth.js ovdje je da je jedino ova izravno event driven tj. kad kliknemo na Logout onda će se u Logout.js aktivirati dispatch().Također ova se aktivira
  // i bez korisničkog inputa u određenim sluačjavima,ali ostatak saga uopće nema niti.
  console.log('auth.js sagas folder,logoutSaga aktivirana');
  //Ovo je incijalno bilo bez ovoga call() samo je pozvao normlno local storage kraj yielda.
  yield call([localStorage, "removeItem"], "token");
  //VAŽNO: call() se može korisiti i za axios tj. async pozive. U prvi argument call-a ubacimo array i onda je prvi item toga array objekt kojeg želimo pozvati, drugi item metoda na tome
  //objektu. U drugi argumet call-a se ubaci vrijednost koja bi se ubacila u obični method call.Prednost call() je da lakše korisiti one testove, jer se ne zove izravno metoda nega
  //na ovaj način redux saga pozove za nas metodu.
  yield call([localStorage, "removeItem"], "expirationDate");
  yield call([localStorage, "removeItem"], "userId");
  //Ova fn. logoutSucceed samo returna:  return {
  //   type: actionTypes.AUTH_LOGOUT
  // };
  //Kreirao je taj action creator umjesto da smo ubaci action objekt.
  yield put(actions.logoutSucceed());
}

//Ovo je saga alternativa checkAuthTimout iz orignala
export function* checkAuthTimeoutSaga(action) {
  //Delay kao što ime govori odgađa egzekuciju.Ovo je umjesto onoga setTimouta koji je bio u checkAuthTimeout.
  //Zanimljiv je ovaj refactor jer je ova saga dobija action paramtar ne dobije expirationTime. Onda sada u checkAuthTimeout više nema onu staru logiku nego returna action objekt
  //gdje na taj objekt postavi expirationTime i onda ova ovdje saga ima pristup putem ovoga action paramtera tome što se ubaci kao expiratonTiime u checkAuthTimeut.
  //checkAuthTimeoutSage i checkAuthTimeout su povezana u index.js u sagas folderu u onome takeEvery na način da se u prvi argument ubaci akcija, a u drugi saga koja se treža izvršiti
  //kad je ta akcija aktivirana 
  yield delay(action.expirationTime * 1000);
  //VAŽNO:Put je alternativa za disptach()
  yield put(actions.logout());
}

//Ova saga je altrnativa auth, action kreatoru iz auth.js iz originala.
export function* authUserSaga(action) {
  //VAŽNO: action parametar predstvlja onaj action objekt koji auth.js koji je u actions folderu returna
  //VAŽNO: pazi da se actions(import) ne pobrka sa parametrom action.
  yield put(actions.authStart());
  const authData = {
    email: action.email,
    password: action.password,
    returnSecureToken: true
  };
  let url =
  'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=upišiNoviKeyINemojZaboravitiPromjeniNoviPathTamoGdjeSEŠaljuNardužbe';
  if (!action.isSignup) {
    url =
    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=upišiNoviKeyINemojZaboravitiPromjeniNoviPathTamoGdjeSEŠaljuNardužbe';
  }
  try {
    //VAŽNO: ovdje korismo yield da sačekamo da se promise reslova ili rejectda. 
    const response = yield axios.post(url, authData);
    //JAKO VAŽNO: on je rekao da je postvljanje u localStorage synronus actions i da nije potrebano stvljati yield kraj toga, te je tada ujedno dodao ovaj yield kraj new Date.
    //Kaže, eto stavit ćemo jer smo već negdi tako stavili.
    //VAŽNO: treba paziti, za pozive prema ovim saga metodama poput put() delay() itd. možda stvarno treba uvijek yield, neman pojma jel to syronous ili async.
    //U svakom slučaju postvljanje yield keyword nema neće naškoditi.btw lekcija 450
    const expirationDate = yield new Date(
      new Date().getTime() + response.data.expiresIn * 1000
    );
    yield localStorage.setItem("token", response.data.idToken);
    yield localStorage.setItem("expirationDate", expirationDate);
    yield localStorage.setItem("userId", response.data.localId);
    yield put(
      actions.authSuccess(response.data.idToken, response.data.localId)
    );
    //Ovdje se zove i pokreće checkAuthTimeout, znači ovo nije checkAuthTimeoutSaga
    yield put(actions.checkAuthTimeout(response.data.expiresIn));
  } catch (error) {
    yield put(actions.authFail(error.response.data.error));
  }
}

//Ova fn se ubaci u select fn. redux saga.
const dajMiState=(state)=>{
  return state
}

//Naravno ovo je saga alternativa authCheckStateSaga,action kreatora iz auth.js iz originala.
export function* authCheckStateSaga(action) {
  //VAŽNO: action parametar neke worker sage omogućuje pristup onom action objekut koji je action kreator returna i to action objekt action kreatora koji čiji je return u put() ili
  //disptahc() blokiran u saga watcher i radi kojeg je pokrenuta worker saga koja radi toga action prametara ima pristup tome objekut koji je bio u blokiranom dipstach() ili put().
  //To nam osobito služi kada imamo neki dispach recimo koji čiji unutrašnji fn. call, tj. fn. call koji zove action creator traži neki argument kojeg dobijemo iz parmetra one
  // metode koji se nalazi na mapDispthToProps objekut. Tako prebacimo te podatke do worker sage. 
  
  //Vidimo jasno da je action objekt koji predstvlja return authCheckState action kreatora unutar actions foldera tj. auth.js file. Upravo one što je blokirano do u watcher sagi
  //da bi se pokrenula ova worker saga 
  console.log('authCheckStateSaga action parameter',action);
  //VAŽNO: ubacimo ovu fn. koju smo definirali gori koje returna state parametar unutar select() i onda dobijemo trenutni state u generatoru.
  //btw. ovo Max nije pokazao, ovo sam ja dodao...
  let state=yield select(dajMiState)
  console.log('authCheckStateSaga returnSelectCall',state);
  
  const token = yield localStorage.getItem("token");
  if (!token) {
    yield put(actions.logout());
  } else {
    const expirationDate = yield new Date(
      localStorage.getItem("expirationDate")
    );
    if (expirationDate <= new Date()) {
      yield put(actions.logout());
    } else {
      const userId = yield localStorage.getItem("userId");
      yield put(actions.authSuccess(token, userId));
      yield put(
         //Ovdje se također zove i pokreće checkAuthTimeout, znači ovo nije checkAuthTimeoutSaga
         //VAŽNO: praktički zovemo tu fn. na istim mjesima kao i u originalu.
        actions.checkAuthTimeout(
          (expirationDate.getTime() - new Date().getTime()) / 1000
        )
      );
    }
  }
}
