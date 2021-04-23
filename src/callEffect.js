import {call,take,fork,put,delay,apply} from "redux-saga/effects"
//VAŽNO:Ovdje dolje ćemo spomentu i apply koji je verzija call().

//Ovo je prva syntax opcija, koju bi trebalo izbjegavati ako je fn objekt metoda, vidi doli syntaxCallTest.
//call(fn, ...args)
//fn can be either a normal or a Generator function.
//The middleware invokes the function and examines its result.
// If the result is an Iterator object, the middleware will run that Generator function, just like it did with the startup Generators (passed to the middleware on startup). 
// The parent Generator will be suspended until the child Generator terminates normally, in which case the parent Generator is resumed with the value returned by the child Generator.
//  Or until the child aborts with some error, in which case an error will be thrown inside the parent Generator.

//Što su ovdje htjeli reći. Call će pozvati genrator fn. koju ubacimo. Generator funckije returnaju specijalni tip iteratora generator objekt kad ih se pozove. Govore
//da će pozvati neki generator fn. koji ubacimo u call() i da će nakon toga automaatski pozvati generator  genratorObjekt.next() sve dok se cijeli sadržaj generator fn.
//ne izvrši. Govore isto da će ona saga tj. generator gdje smo zapisali call() biti pauzirana dok se ne izvrši taj genrator koji smo ubacili u call.
//Erorr situaciju ću kometirati nakon ovoga:

//When an error is thrown inside the Generator, if it has a try/catch block surrounding the current yield instruction, the control will be passed to the catch block. 
//Otherwise, the Generator aborts with the raised error, and if this Generator was called by another Generator, the error will propagate to the calling Generator.
//Znači ako imamo try catch block error će biti hendlan unutar generator fukkcije koju smo ubacili u call(), a ako ne uhvatimo taj error onda će se totalno
//prekinuti izvršenje i parent genertorat tj. onogog generator gdje je bio call(), znači ne privremeno zaustvljenje dok se call() ne izvrši nego
//ništa nakon toga call() i error se neće izvršiti.
//Note: dosta je i try{}finnaly{} da se hendla error, ali u stavarnosti uvijek želimo znati koji je bio error pa ćemo staviti doslovno catch(err){}

// If fn is a normal function and returns a Promise, the middleware will suspend the Generator until the Promise is settled. 
// After the promise is resolved the Generator is resumed with the resolved value, or if the Promise is rejected an error is thrown inside the Generator.
//Znači yield ima efekt kao await da sačeka i "izvče" vrijednost. 
//OPREZ: ovo jedino ne vrijedi kada je neki generator ubačen kao fn. tj. callback unutar call()
//i taj generator returna(sa return naravno iza zadnjeg yielda, inače je return undefined)neki promise objekt onda iz nekog razloga
//neće biti izvalačenja tj. vrijednost cijelog call returna će biti ukupno Promise objekt ne [PromiseValue]. Znači nema izvlačenja.
//Dobro, treba reći da su oni stavili "If fn is a normal funaction", samo nisu eksplicitno opisali kao ja što se događa kad je fn. generator. 


//If the result is not an Iterator object nor a Promise, the middleware will immediately return that value back to the saga, so that it can resume its execution synchronously.
//Znači ako pozovemo normlanlu funckciju koja ne returna promise pozvait će je kao normalni callback call().

//VAŽNO: call je blokirajući znači ako se izvršava neka fn. koju smo ubacili kao callback unutar call onda ako se dogodi neki dispatch koji take sluša unutar
//sage gdje je call zapisan neće se nastaviti code ispod yield take kada se call() callback izvrši OSIM ako se ne ponovi opet disptach gdje
// smo trenutno blokirani tj. disptach koji take() sluša.
//Ako ne želimo blokirati onda umjesto call možemo koristit fork, ali samo ako nam ne treba return iz callback fn. koju ubacujemo u fork() jer
//fork returna tzv. task objekt, ne vreća return iz callback fn. tj. ono što returna call inače kad ima generator, običnu fn. i običnu fn. koja returna promise.

//Ostale syntax mogućnosti su navedene ovdje dolje u syntaxCallTestSaga:


export function* syntaxCallTestSaga(){
        yield take("BEZVEZE")
        //Ovo je za testirati različite syntax mogućnosti:

        //VAŽNO: ovaj syntax neće zadržati značnje keyworda this. Treba ga samo koristi kada nam ne treba keyword this ili radi navike
        //možda je odmah bolje koristit druge opcije i kada ne zovemo metodu nekog objekta.
        //call(fn, ...args)
        yield call(nekiObj.metodaNekogObj,"Ante-prviArg", "Mate-drugiArg")
        
        //Ovdje context predstvlja neki objekt i sa ovim syntaxom ćemo zadržati značenje keyworda this.
        //call([context, fn], ...args)
        // yield call([nekiObj,nekiObj.metodaNekogObj],"Ivan-prviArg","Luka-drugiArg")
        
        //Note: primjeti na ovoj doli syntax opciji da ubacujemo string umjesto stanardnog navođenja imana varijable, a iako zovemo
        //metodu objekta nismo je ni morali vezati na nekiObj.metodaNekogObj sa ovim syntaxom.
        //Također zadržavo značenje keyworda this.
        //call([context, fnName], ...args)
        // yield call([nekiObj, "metodaNekogObj"], "Suzana-prviArg","Andrija-drugiArg")
        
        //Najgora i najbesmislenija syntax opcija gdje ubacujemo objekt.Također zadržava značenje keyworda this.
        //call({context, fn}, ...args)
        // yield call({ context: nekiObj, fn:nekiObj.metodaNekogObj},"Marina-prviArg", "Vlado-drugiARg")

        //VAŽNO: ovo je apply. Ovdje nam doista treba sprad operator ako želimo sa call() simulirati apply().Također zadržava značenje keyworda this.   
        // apply(context, fn, [args])
        // Alias for call([context, fn], ...args).
        // yield apply(nekiObj,nekiObj.metodaNekogObj,["Lucijan-prviArg","Mateo-drugiArg"])
        // yield call([nekiObj, nekiObj.metodaNekogObj],...["Lucijan-prviArg","Mateo-drugiArg"])

}

const nekiObj={
    metodaNekogObj: function(prviParametar,drugiParameter){
          console.log("ovo je this unutar metodaNekogObj:",this)
          console.log("prviParametar:", prviParametar)
          console.log("drugiParametar:", drugiParameter)
    }
}


function* odgodiSagaHelper(){
 
    try{
        yield delay(5000)
        console.log("ovo je odgodiSagaHelper nakon što je delay izvršen")
    
     
        //  throw new Error("Ovo je moj Error")
      }catch(err){
     console.log(err)
    }finally{ 
        // return Promise.resolve("novi resolve")
        return "Return iz odgodi saga"
    }

  
}


 function* pomoćnaSagaPrva(){
    yield put({type: "PRVI_KEY"})
}



 function* pomoćnaSagaDruga(){
    yield put({type:"DRUGI_KEY"})
}


export function* callEfMain(){
    while(true){
        yield take("BEZVEZE")
        yield call(pomoćnaSagaPrva)
       
        //Klikni na botun "BEZVEZE" odmah nakon toga dok nije prošlo 5 sekundi "LUDILO". Vidjeti ćeš da call blokira i neće se vidjeti ova clog linija ispod take("LUDILO")
        //Osim ako se ne klikne još jedan put na LUDILO dipstach botun nakon se call izvršio. Stavi fork umjesto call da vidiš kako fork ne blokira.
        //Ovdje se zove i fn. gdje se mogu vidjeti situacije koje sam spomenuo gore u komentarima. 
        let callRet=yield call(odgodiSagaHelper)
        console.log("callRet:",callRet)


       yield take("LUDILO")
        console.log("ovo je c.log ispod yield take LUDILO")
        yield call(pomoćnaSagaDruga)
    }
}





