import { takeEvery, takeLatest,take,delay, put,fork, join,call, all,race } from "redux-saga/effects";



function* generatorSaLoopomFn(){
    while(true){
 yield "Ovo je prvi yield"
 yield "Ovo je drugi yield"
 yield "Ovo je treci yield"
}

}

function* workerSaga111(){
    yield "ret iz worker saga111"
    console.log("workerSaga111")
}




function* workerSaga222(){
    yield "ret iz worker saga222"
    console.log("workerSaga222")
}

  function* rootSaga(){
    yield all([
        takeEvery("LUDILO", workerSaga111),
        takeEvery("BEZVEZE",workerSaga222)
    ])
}

let rootSagaGeneratorObj=rootSaga()

// console.log("prvi rootSagaGenrator.next():",rootSagaGeneratorObj.next())
// console.log("drugi rootSagaGenrator.next():",rootSagaGeneratorObj.next())




function* odgodiSagaDruga222(){
    //Za all test vrijedonost delyya,pa uključi i isključi.
    // yield delay(4000)
    //Za race test vrijednost deley()
    yield delay(2000)
    
    console.log("druga odgodiSagaDruga222")
   
    // try{
         
    // yield call(()=>{
    //     throw new Error("Ovo je moj Error")
    // })
    // }catch(err){
    //    console.log(err)
    // }

    return "Return iz odgadiSagaDruga222"
}

function* odgodiSagaPrva(){
    yield delay(4000)
    console.log("prva odgodiSagaPrva")
    return "Return iz odgadiSagaPrva111"
}

export function* testRaceCombinators(){
    yield take("BEZVEZE")
    //VAŽNO: ako recimo stavimo fork unutar race ili neki ne-blokirajući oni ću uvijek pobjediti
    //u utrci sa blokirajućim efektima pa je obično riječ o bugu kada to vidimo.
    //Race će returnati array, oni efekti koji nisu pobjedili u utrci će biti undefined.
    //Ako se hendla error unutar nekog calla koji je u race i normalno returna, do kraja će se izvrđitit i saga gdje je race zapisan
    //međutim ako se error ne hedla onda će se zaustavit i ova testRaceCobinartors saga.
 const raceReturnArray= yield race([
    call(odgodiSagaPrva),
    call(odgodiSagaDruga222)
  ])
  console.log("raceRetrun:",raceReturnArray)
}

export function* testAllCombinators(){
    //Ovo sam stavio sam da blokiram sagu incijalnos dok ne kliknem na bezveze.
    yield take("BEZVEZE")
   
    //Kada ne koristimo all onda će se prvo pokrenuti jedna pa tek onda druga kada prva završi, pa ćemo ukupno čekati 8 sekundi da se sve završi. 
    //   yield call(odgodiSagaPrva)
    //   yield call(odgodiSagaDruga222)
     
    //Kada korismo all i ubacimo call onda će se sve pokrenuti sve odjednom bez da se čeka kraj nekog call-a prije pokretanje drugog
    // i ujedno all će returanti array sa tek rezultatima kada se svi izvrše. Znači o najdužem ovisi koliko vremena treba da all returna.
    //U odnosu na gornju situaciju sada će se sve izvršitit za 4 sekunde. Gornja verzija bez all bi se trebala koristiti jedino
    //ako u drugom call() treba return iz prvoga call().
    //Kada se dogodi error u nekoj od callback fn. unutar call/fork koje korismo u all efektu onda ukoliko smo uhvatili error sa try catch
    //će se all normalno završiti i returnati(treba uvijek pripremitit u finnaly što želimo returnt tamo gdje je error).
    //Ako ne uhvatimo error sve će se blokirati i all se neće returnati i genrator gdje je all se više neće nastaviti izvršavati.
    //Zato preporučuju koristiti spawn unutar all kada se radi root saga( a možemo više puta zavati sagaMiddlware.run() i ne treba nam root saga).
    //U videu ću puno više elaboriati situacija oko root sage patterna i all-a.
    
    //   let allReturnArray=yield all([
    //       call(odgodiSagaPrva),
    //       call(odgodiSagaDruga222)
    //   ])

    // console.log("allReturnArray:", allReturnArray)


    // yield all([
    //       fork(odgodiSagaPrva),
    //       fork(odgodiSagaDruga222)
    //   ])
      
    //VAŽNO: kada imamo fork unutar all umjesto call tj. neke ne-blokirajuće efekte ISKLJUČIVO onda će se code ispod all
    //izvršiti bez da se mora čekati return all. Ako imamo kobinaciju blokirajući i ne-blokirajućij code ispod
    //all se neće pokrenuti dok all ne returna.
    //Koja je smisao onda stvavlja nekoliko fork() efekata unutar all, koja je razlika toga i stavljanja nekoliko fork efektat jedan ispod drugoga.
    //Jedina razlika je što kada stavimo unutar all svi fork efekti callback fn. se započnu doslovno u isto vrijeme, ne koju milisekundu nakon. Kažu
    //da se stave fork unutar all jer all returna odjenom array svih task objekta, pa sa destructring se to skupi.
     console.log("Kada ubacimo fork(odnosno isljučivo ne-blokirajuće) umjesto call unutar all onda će se code ispod izvršiti bez da čeka return all")
     
     //Naravno, ukoliko kliknemo na LUDILO dok se izvršava neki od blokirajućih efekta unutar all neće se aktivirati code ispod.
     //Kada imamo isključivo ne-blokirajuću unutar all onda hoće.
      yield take("LUDILO")
     console.log("ovo je c.log ispod yield take LUDILO")
     yield call(pomoćnaSagaDruga)
}


export function* uPozadini(){
    yield take("U_POZADINI") 
    console.log("ovo je U_POZADINI LOG")
}



function* pomoćnaSagaDruga(){
    yield put({type:"DRUGI_KEY"})
}


