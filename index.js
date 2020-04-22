let fMain=function() {
    
    testSubject();
    testBehaviorSubject();
    testReplaySubject();
    
    testFromEvent();

    //-------------

    testRxObservable(); //ATTENTION ! fonction Asynchrone ici ! (car j'y ai mis des setTimeout()).
}

//---------------------------------------

const testRxObservable=function() {
    console.log("\n\n", "******************** Rx.Observable ********************", "\n\n");

    let fObserver1 = (pReceivedData) => {
        console.log("fObserver1(), received data:", pReceivedData);
    }
    let fObserver2 = (pReceivedData) => {
        console.log("fObserver2(), received data:", pReceivedData);
    }    

    let fObservable = (poObserver)=>{
        const aData = [10,20,30,40,50];
        window.setTimeout(()=>{
            aData.forEach((piData)=>{ //Data emitting
                poObserver.next(piData); //<<< Comme un appel à la méthode update d'un observer (selon le design pattern).
                //poObserver.complete(); //Stop la transmission à l'observer => ne recevrait qu'une data, soit ici : 10
            });
            console.log("\n");
        }, 1000);
        
    }
    let oObservable = new Rx.Observable(fObservable);
    
    const oSubscriptionA = oObservable.subscribe(fObserver1); 
    const oSubscriptionB = oObservable.subscribe(fObserver2);
    const oSubscriptionC = oObservable.subscribe(fObserver1); 

    console.log("\n");
    console.log("Rx.Subscription instance: ",oSubscriptionA);
    console.log(oSubscriptionA instanceof Rx.Subscription); //TRUE
    console.log("\n");

    window.setTimeout(()=>{
        oSubscriptionC.unsubscribe(); //fObserve1(2ème souscription) n'observe donc plus.
        console.log("Unsubscription for oSubscriptionC done !");
        console.log("\n");    
    },500);    //<<< 500ms => Du coup, oSubscriptionC n'aura pas le temps de servir, car la ntotification ci-dessus n'opère qu'au bout de 1000ms !!

    window.setTimeout(()=>{
        oSubscriptionA.unsubscribe(); //fObserve1(1ère souscription) n'observe donc plus.
        oSubscriptionB.unsubscribe(); //fObserve2 n'observe donc plus.
        console.log("All Unsubscriptions done !");
        console.log("\n");    
    },2000);

}


//Contrairement à un Observable, un Subject ne notifie pas les observers au moment de leur souscription,
//il les notifiera, lorsqu'on appelera sa méthode next(valeurATransmettreAuxObservers).
const testSubject=function() {

    console.log("\n\n", "******************** Rx.Subject ********************", "\n\n");    
console.log("Contrairement à un Observable, un Subject ne notifie pas les observers au moment de leur souscription, "+
 "il les notifiera, lorsqu'on appelera sa méthode next(valeurATransmettreAuxObservers).\n\n");

    let fObserver1 = (pReceivedData) => {
        console.log("fObserver1(), received data:", pReceivedData);
    }
    let fObserver2 = (pReceivedData) => {
        console.log("fObserver2(), received data:", pReceivedData);
    }    

    let oSubject = new Rx.Subject();

    const oSubscriptionA = oSubject.subscribe(fObserver1); 
    oSubject.next("sent dataX to all observers (fObserver1 only for the moment)");
    console.log("\n");

    const oSubscriptionB = oSubject.subscribe(fObserver2); 
    oSubject.next("sent dataY to all observers (fObserver1 et fObserver2)");    
    console.log("\n");

    console.log("Rx.Subscription instance: ",oSubscriptionA);
    console.log(oSubscriptionA instanceof Rx.Subscription); //TRUE    
    console.log("\n");

    oSubscriptionA.unsubscribe(); //fObserve1 n'observe donc plus.
    oSubject.next("sent data to all observers (fObserver2 only)");
    console.log("\n");

    oSubscriptionB.unsubscribe(); //fObserve2 n'observe donc plus non plus.
    oSubject.next("sent data to all observers (AUCUN)"); //<< sera donc sans effet !!
    console.log("\n");    

    //

    console.log("\n\n", "******************** Rx.Subject as Observable ********************", "\n\n");
    const oSubjectAsObservable = oSubject.asObservable(); //Devient tout simplement un Observable (donc pas de méthode next !)
    oSubjectAsObservable.subscribe(fObserver1); //Ne déclenche pas de notification pour autant !!!
    oSubjectAsObservable.subscribe(fObserver2); //Ne déclenche pas de notification pour autant !!!
    // Donc asObservable sur un Subject, n'a pour seul intérêt que de : NE pas exposer aux souscrivants, la méthode next du Subject en question !
    //  ainsi les souscrivants, ne pourront que s'abonner auprès de l'Observable obtenu.
    oSubject.next("emitted Data !"); //<<< Là oui, la notification aux souscrivants est déclenchée !

    console.log("\n");
    console.log("\n\n", "************************************************************************************", "\n");    
    console.log( " ************************************************************************************", "\n\n");   

}



//La différence entre un Subject et un BehaviorSubject, est que lors de la souscription d'un observer à un BehaviorSubject :
// l'observer est immédiatement notifié de la dernière valeur ayant été "nextée" par le BehaviorSubject, aux observers pré-existants.
// Si aucune valeur n'avait encore été "nextée" par le BehaviorSubject, alors celle transmise à l'observer au moment de sa souscription,
// sera celle qui, a été passée en paramètre du constructeur du BehaviorSubject (valant alors éventuellement undefined si 
// elle n'avait pas été précisée).
const testBehaviorSubject=function() {

    console.log("\n\n", "******************** Rx.BehaviorSubject ********************", "\n\n");    
console.log("La différence entre un Subject et un BehaviorSubject, est que lors de la souscription d'un observer à un BehaviorSubject : "+
"l'observer est immédiatement notifié de la dernière valeur ayant été 'nextée' par le BehaviorSubject, aux observers pré-existants. "+
"Si aucune valeur n'avait encore été 'nextée' par le BehaviorSubject, alors celle transmise à l'observer au moment de sa souscription, "+
"sera celle qui, a été passée en paramètre du constructeur du BehaviorSubject (valant alors éventuellement undefined si elle n'avait pas été précisée).\n\n"
);

    let fObserver1 = (pReceivedData) => {
        console.log("fObserver1(), received data:", pReceivedData);
    }
    let fObserver2 = (pReceivedData) => {
        console.log("fObserver2(), received data:", pReceivedData);
    }    

    let oBehaviorSubject = new Rx.BehaviorSubject("Initial data (facultative)");

    const oSubscriptionA = oBehaviorSubject.subscribe(fObserver1); 
    oBehaviorSubject.next("sent dataX to all observers (fObserver1 only for the moment)");
    oBehaviorSubject.next("sent dataZZZZ");
    console.log("\n");

    const oSubscriptionB = oBehaviorSubject.subscribe(fObserver2); //<< fObserver2 souscrit, donc il est automatiquement notifié avec 
                                                                   // la dernière data pushée (next) par le BehaviorSubject, 
                                                                   // à savoir ici: "sent dataZZZZ"
    oBehaviorSubject.next("sent dataY to all observers (fObserver1 et fObserver2)");    
    console.log("\n");

    console.log("Rx.Subscription instance: ",oSubscriptionA);
    console.log(oSubscriptionA instanceof Rx.Subscription); //TRUE    
    console.log("\n");

    oSubscriptionA.unsubscribe(); //fObserve1 n'observe donc plus.
    oBehaviorSubject.next("sent data to all observers (fObserver2 only)");
    console.log("\n");

    oSubscriptionB.unsubscribe(); //fObserve2 n'observe donc plus non plus.
    oBehaviorSubject.next("sent data to all observers (AUCUN)"); //<< sera donc sans effet !!
    console.log("\n");    

    //
    oBehaviorSubject.next("Data (qui sera) sent au(x) prochain(s) subscribers");

    console.log("\n\n", "******************** Rx.BehaviorSubject as Observable ********************", "\n\n");
    const oBehaviorSubjectAsObservable = oBehaviorSubject.asObservable(); //Devient tout simplement un Observable (donc pas de méthode next !)
    oBehaviorSubjectAsObservable.subscribe(fObserver1); //A le même effet qu'un oBehaviorSubject.subscribe(fObserver1)
                                                        //donc fObserver1 recevra immédiatement la dernière data pushée par oBehaviorSubject.  
    oBehaviorSubjectAsObservable.subscribe(fObserver2); //A le même effet qu'un oBehaviorSubject.subscribe(fObserver2)
                                                        //donc fObserver2 recevra immédiatement la dernière data pushée par oBehaviorSubject.  
    
    console.log("\n");                                                        
    // Donc asObservable sur un BehaviorSubject, n'a pour seul intérêt que de : NE pas exposer aux souscrivants, la méthode next 
    //du BehaviorSubject en question ! ainsi les souscrivants, ne pourront que s'abonner auprès de l'Observable obtenu.
    oBehaviorSubject.next("last emitted Data !");

    console.log("\n");
    console.log("\n\n", "************************************************************************************", "\n");    
    console.log( " ************************************************************************************", "\n\n");    

}


//La différence entre un BehaviorSubject et un ReplaySubject, est que lors de la souscription d'un observer à un ReplaySubject :
// l'observer est immédiatement notifié des N dernières valeurs ayant été "nextées" par le ReplaySubject, aux observers pré-existants.
// Si n'ont été pécédemment "nextées" que moins de N valeurs, soit X ce nombre, alors le ReplaySubject, notifiera à tout prochain souscrivant,
// ces X notifications. X pouvant valoir 0 bien sûr. N étant un nombre à passer au constructeur du ReplaySubject.
const testReplaySubject=function() {

    console.log("\n\n", "******************** Rx.ReplaySubject ********************", "\n\n");    
console.log("La différence entre un BehaviorSubject et un ReplaySubject, est que lors de la souscription d'un observer à un ReplaySubject : "+
"l'observer est immédiatement notifié des N dernières valeurs ayant été 'nextées' par le ReplaySubject, aux observers pré-existants. "+
"Si n'ont été pécédemment 'nextées' que moins de N valeurs, soit X ce nombre, alors le ReplaySubject, notifiera à tout prochain souscrivant, "+
"ces X notifications. X pouvant valoir 0 bien sûr. N étant un nombre à passer au constructeur du ReplaySubject.\n\n");    

    let fObserver1 = (pReceivedData) => {
        console.log("fObserver1(), received data:", pReceivedData);
    }
    let fObserver2 = (pReceivedData) => {
        console.log("fObserver2(), received data :", pReceivedData);
    }    
    let fObserverW = (pReceivedData) => {
        console.log("fObserverW(), received data:", pReceivedData);
    }    

    let oReplaySubject = new Rx.ReplaySubject(3);

    const oSubscriptionA = oReplaySubject.subscribe(fObserver1); 
    //Pas de notification au nouveau souscrivant (fObserver1), car rien n'a été nexté précédemment 
    //(et pas de notion de valeur initiale, contrairmeent au BehaviorSubject).

    oReplaySubject.next("pour fObserver1 du coup, mais aussi pour le prochain souscrivant( lors de son inscription), à savoir ici : fOserver2 !");
    console.log("\n");
    
 
    const oSubscriptionB = oReplaySubject.subscribe(fObserver2); //<< fObserver2 souscrit, donc il est automatiquement notifié...
                                                                 // avec tout plus, les 3 pus précédents. 
    console.log("\n");                                                                 

    oReplaySubject.next("Data push 2"); console.log("\n");
    oReplaySubject.next("Data push 3"); console.log("\n");
    oReplaySubject.next("Data push 4"); console.log("\n");
    oReplaySubject.next("Data push 5"); console.log("\n\n");
    

    console.log("fObserverW reçoit, de part sa souscription, les 3 derniers push (next) effectués, et dans l'ordre.");
    const oSubscriptionC = oReplaySubject.subscribe(fObserverW); //<< fObserverW souscrit, donc il est automatiquement notifié...
                                                                 // avec tout au plus, les 3 pushes précédents.  



    console.log("\n\n\n Rx.Subscription instance: ",oSubscriptionA);
    console.log(oSubscriptionA instanceof Rx.Subscription); //TRUE    
    console.log("\n");

    oSubscriptionA.unsubscribe(); //fObserve1 n'observe donc plus.
    oReplaySubject.next("6- only for fObserver2 et fObserverW, car fObserver1 à présent désinscrit !");
    console.log("\n");

    

    console.log("\n\n", "******************** Rx.ReplaySubject as Observable ********************", "\n\n");
    const oReplaySubjectAsObservable = oReplaySubject.asObservable(); //Devient tout simplement un Observable (donc pas de méthode next !)
    oReplaySubjectAsObservable.subscribe(fObserver1); //A le même effet qu'un oReplaySubject.subscribe(fObserver1)
                                                        //donc fObserver1 sera notifié selon les modalités évoquées ci-dessus.  
    
    console.log("\n");                                                        
    // Donc asObservable sur un ReplaySubject, n'a pour seul intérêt que de : NE pas exposer aux souscrivants, la méthode next 
    //du ReplaySubject en question ! ainsi les souscrivants, ne pourront que s'abonner auprès de l'Observable obtenu.
    oReplaySubject.next("last emitted Data !");

    console.log("\n");
    console.log("\n\n", "************************************************************************************", "\n");    
    console.log( " ************************************************************************************", "\n\n"); 

}



const testFromEvent=function() {

    const oDOMEventableObject = window.document.querySelector("#myDOMEventableObject");
    //
    const oMyFromClickObservable = Rx.Observable.fromEvent(oDOMEventableObject, "click");
    oMyFromClickObservable.subscribe((poObservable)=>{
        console.log("\n\n", "******************** Rx.Observable.fromEvent ********************", "\n\n");            
        let oDOMObject = poObservable.target; //<<<<
        console.log("\n", poObservable);
        console.log("THANKS for clicking me !");
        console.log("oDOMObject.id = "+oDOMObject.id);
        console.log("oDOMObject.tagName = "+oDOMObject.tagName);
        console.log("oDOMObject.outerHTML = "+oDOMObject.outerHTML);
        console.log("\n");
    });
    
    const oMyFromMouseOutObservable = Rx.Observable.fromEvent(oDOMEventableObject, "mouseout");
    oMyFromMouseOutObservable.subscribe((poObservable)=>{
        console.log("\n\n", "******************** Rx.Observable.fromEvent ********************", "\n\n");            
        let oDOMObject = poObservable.target; //<<<<<<<<<<
        console.log("\n", poObservable);
        console.log("So you quitted me !");
        console.log("oDOMObject.id = "+oDOMObject.id);
        console.log("oDOMObject.tagName = "+oDOMObject.tagName);
        console.log("oDOMObject.outerHTML = "+oDOMObject.outerHTML);
        console.log("\n");
    });    
}