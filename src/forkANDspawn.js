import {fork,spawn,cancelled,cancel,call,delay,put,take,join} from "redux-saga/effects"
//VAŽNO: ovdje ću opisati i join,cancel,cancelled uz fork i spawn jer oni koristi task objekt koji spawn i fork returnaju.

//fork(fn, ...args)
//fork([context, fn], ...args)
//fork({context, fn}, ...args)
//Creates an Effect description that instructs the middleware to perform a non-blocking call on fn(ovo znači da fork zove callback fn. koju ubacimo )
//Znači call() i fork su gotovo isti, jedino je call "blokirajući", a fork() nije te fork returna tzv. task objekt.
//https://redux-saga.js.org/docs/Glossary  (na ovom linku možemo vidjeti što je blokirajući, što nije kao i na mom primjeru doli)
//Fork i spawn su gotovu isti, jedina razlika je što kada koristiš spwan bude kao da su hendlao error sa try{}catch{} blockom unutar fork() callback fn.
//i onda se generator koji zove spawn() ne totalno blokira kada se dogodi error unutar spawn() callbacka kao što bi bio slučaj kada
//se koristi fork() bez da se uhvati i hendla error unutar callback fn. sa try{}catch{} blockom.
//Također ukoliko se dogodi error unutar generatora gdje je zapisan neki spawn() i fork() onda će se callback spawn izvršiti dok će se callback fork
//izvršiti jedino ako samo imali try{}catch{} block unutar toga generatora gdje je fork() i koji je uhvatio error.
//Znači da bi se vidjela razlika između swapn i fork treba se dogoditi error koji nije hendlan.
//VAŽNO:Zapravo postoji još jedna razlika između spawn i fork koju ću pokazati u video objašnjenju.

//VAŽNO: yield cancel() se koristi na način da ubacimo taskObj koji fork ili spawn returnaju unutar cancel() i onda će se ponšitit egezekucija
//te sage tj. generatora koji je bio callback forka ili spawna kada se returnao taj task objekt.
//VAŽNO: cancelled() metoda tj. efekt returna boolean i biti će true čak i ako se nije izravno zvao yield cancel(nekiTaskObj)
//nego i ako se dogodi error unutar parenta koji zove sa forkom() genrator gdje je zapisan cancelled() i taj error unutar parent NIJE HEDLAN try catch metodom pa saga middleware 
//automatki zove cancel(), ALI ako se dogodi error unutar samog genrator gdje je cancelled() i to bude uzrok prestanka egezkucije onda NEĆE biti return true.
//Ovo isto vrijedi za slučajve kada zovemo yield cancel(nekiTaskObj) i onda poništimo izvršavanje cijelog laanca ako postoji. Onda oni genrawtori koji
//nisu izravno ponošteni sa cancel() će biti ponišetni od redux-saga middleware pa zato će cancelled() biti true i za njih.
//Uglavnom, cancelled() će returna true ako mi samim poništimo neki generator ili redux-middleware.
//Sasvim logično, kada ponišimo jedna genetorat one ćemo poništiti i izvršavnje cijelog lanca ako on zove druge genratore, oni su od toga napravili cijelu
//filozifuju.

//join(task)
//join([...tasks])
//Creates an Effect description that instructs the middleware to wait for the result of a previously forked task.
//Prakitči join služi da ako u jednom trentuku kasnije u code trebamo sačekati doista neki callback koji smo ubacili u fork ili spawn da
//zaustavi egezkucijeu dok se taj callback ne izvrši ili više callbacka od različtih fork/spawn.
//Samo mi ovo nije jasno:
//There is another direction where the cancellation propagates to as well: the joiners of a task (those blocked on a yield join(task)) will also be cancelled if the joined task
 //is cancelled. Similarly, any potential callers of those joiners will be cancelled as well (because they are blocked on an operation that has been cancelled from outside).
 // yield join([taskObjThatWillBeCanceled,otherTaskObj]) (otherTaksObj neće biti ponišetn kada poništimo taskObjThatWillBeCanceled)



function* odgodiSaga222(){
    yield delay(4000)
    console.log("druga odgodiSaga222")
}

function* hoćuLiSePokrenuti(){
    yield console.log("hoću li se pokrenuti")
    return "Iz hoću li se pokrenuti"
}

function* odgodiSaga(){
 
    try{
        yield delay(5000)
        console.log("ovo je odgodiSaga nakon što je delay izvršen")
        // yield call(()=>{
        //     throw new Error("Ovo je moj Error")
        // })
       yield call(hoćuLiSePokrenuti)   
    }finally{ 
        if(yield cancelled()){
          console.log("ovo je finally unutar if stetmenta kad je cancelled truthy")  
        }
        // console.log("ovo je izvan if stemennt finnaly")
    }

  
}

function* throwErrorSaga(){

    try{
        yield delay(1000)
        yield call(()=>{
            throw new Error("Ovo je moj Error")
        })
    }catch(err){
        console.log(err)
    }
   
}
 

 function* pomoćnaSagaPrva(){
         yield put({type: "PRVI_KEY"})
}

 function* pomoćnaSagaDruga(){
    yield put({type:"DRUGI_KEY"})
}

export function* forkAndSpawnMainSaga(){
      while(true){
          yield take("BEZVEZE")
          yield call(pomoćnaSagaPrva)
          //Ovdje stavi spawn pa tesiraj razliku(doli ostavi fork gdje se zove throwErrorSaga i nemoj hendlat error sa try catch):
         let taskObjThatWillBeCanceled=yield fork(odgodiSaga)
         let otherTaskObj=yield fork(odgodiSaga222)
         yield cancel(taskObjThatWillBeCanceled)
         yield join([taskObjThatWillBeCanceled,otherTaskObj])
        console.log(taskObjThatWillBeCanceled)
        
        //Ovdje vidi što se dogodi kad imao try{}catch blok i kada nemamo i bude error dok sa fork zovemo neki callback.
    //     try{
    //         yield call(()=>{
    //         throw new Error("Ovo je moj Error")
    //     })
    // }catch(err){
    //        console.log(err)
    //     }
      
         //ovdje stavi spawn pa testiraj razliku(gori ostavi fork gdje se zove odgodiSaga i nemoj hendlat error sa try catch)
        // yield fork(throwErrorSaga)
         
console.log("clog IZA spawn()/fork() i biti ću prikazan prije nego što se izvrši callback fork/spawn KOJI IMA DELAY, a to se ne bi dogodilo da korisimo blokirajući call()")
         yield take("LUDILO")
          console.log("ovo je c.log ispod yield take LUDILO")
          yield call(pomoćnaSagaDruga)
      }
}


