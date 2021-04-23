import {take,put,call,delay} from 'redux-saga/effects'
import {END} from "redux-saga"

//Take saga efekt tj. metoda blokira izvršavanje neke saga sve dok se ne disptacha neki od actionTypes koji neki take nadzire
//Note: možemo imati više ovih take() poziva koji prate različite actionTypes unutar neke generator funckije.
//Kada koristmo ovaj take efeket ne trebamo imati posebnu watcher sagu, slušamo i čekamo disptach izravno u tzv. worker sagi.
//VAŽNO: ako se dogodi neki disptach koji take efekt čeka i neka saga se ne nastavi izvršavati onda se dogodila siutacija
//da je ta saga bila blokirana čekujući izvršavanja nekog efekta poput call() koji blokira u trentuku kada se dogodio disptach.
//Ako se ponovno aktivira dipstach koji take() sluša dok nema egzekucije neke blokirajućeg efekta onda će se nastaviti normalno egezekucija sage.
//Vidi callEffect.js gdje se ovo situacije također opisuje i može se vidjeti na stvarnom primjeru.
//Note: take() blokira onu sagu gdje je zapisan. Nema veze sa drugim sagama koje su navedene u drugim sagaMiddleware.run() pa će
//se one normlano izvršavati. Zato imamo ovaj "u pozadini" botun da to bude jasno.
export function* takeBezLoopa(){
    console.log("čisto da vidin što se događa")
     let takeRet=yield take("BEZVEZE")
     console.log("unutar takeBezLoopa ispod yield take koJI čeka BEZVEZE disptach")
    //Returna dispatcan objekt take effekt
    console.log(takeRet)

}

export function* takeSaLoopom(){
//VAŽNO: ako NE stavimo ovaj loop, onda će se ovo pokrenti samo jedan put kada dipstachamo "BEZVEZE", kada disptach drugi put neće.
    while(true){
        console.log("čisto da vidin što se događa")
        let takeRet= yield take("BEZVEZE")
        console.log("takeRet:",takeRet)
       }
}

//POGLEDAJ OVO OVDJE:Gore sam ostavio čišću verziju, ovdje sam dodao komentari i još neke opcije pokazao:
// export function* takeSaLoopom(){
//     //VAŽNO: ako NE stavimo ovaj loop, onda će se ovo pokrenti samo jedan put kada dipstachamo "BEZVEZE", kada disptach drugi put neće.
//         while(true){
//             console.log("čisto da vidin što se događa")
//             let takeRet= yield take("BEZVEZE")
//             //let takeRet=yield take() ili yild take(*) će rezultirati da za bilo koji disptach take će se aktivirati.
           
//             //Ova verzija sa array i string unutar array će rezultirati da ako bilo od ovih se disptatch
//             //onda će se nastaviti egzekucija tj. take više neće blokirati.  
//             // let takeRet=yield take(["BEZVEZE","LUDILO"]) 
//             console.log("takeRet:",takeRet)
           
//             //Kada ovdje sa put disptchamo ovaj "END" onda prekidamo sve take nastavke izvršavanja i sve će blokirati
//             //i kada se dogodi neki disptach koji take prati 
//             yield put(END) 
//             yield take("LUDILO")
//          }
//     }