import {takeLatest,takeEvery,put, delay,cancelled, takeLeading} from 'redux-saga/effects';
import axios from 'axios';


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function* workerSaga(){
    const cancelTokenSource=axios.CancelToken.source();
    let randomPlanetNumber=getRandomInt(1,20)

    try{
        //VAŽNO: da bi testirali razliku između takeLatest i takeEvery treba nam neki delay jer se code prebrzo izvrši, pa i ajax requests.
        //Tako i yt autori pokazuju razliku. Ovdje imamo debounce, saga way kada stavimo takeLatest i ovaj delay.
        //Pošto je jako mali delay(150ms) treba jako brzo uzastopno pritisaki tipku da se vidi razlika.
        //Za takeLeading stavi veći delay da vidiš što se događa.
        yield delay(150)
        const retObj= yield axios.request({
            method:"GET",
            url:`https://swapi.dev/api/planets/${randomPlanetNumber}`,
            cancelToken: cancelTokenSource.token
        })
      
        console.log("retObj:",retObj)
        yield put({type: "ST_PLANET_NAME",payload: retObj.data.name})
    }catch(err){
        console.log(err)
    }finally{
       if(yield cancelled())
       console.log("unutar if u finally")
       //VAŽNO: bitno je poništiti zahtjeve prema serveru ovdje unutar finally jer će takeLatest zaustaviti trenutnu sagu, ali ako smo već uputili
       //zahtjev prema serveru to je onda prekasno i zato moramo uvijek poništiti zahtjev unutar finnaly. U network chrome dev tools tabu se vidi razlika
       //kad ovdje zovemo .cancel() i kad iskomtiramo ovu liniju doli.
       cancelTokenSource.cancel();
    }
}    
     

export function* takeLatestClearOrNot(){
    yield takeEvery("BEZVEZE",workerSaga) 
}


