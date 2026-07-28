// ======================================
// departure.js
// ATC Simulator Departure Engine
// ======================================

console.log("departure.js loaded");


let departures = [];

window.onload = function(){

    document.getElementById("createDeparture").onclick = function(){

        const runway =
        document.getElementById("depRunway").value;

        createDeparture(runway);

        document.getElementById("depcallsign").value="";
        document.getElementById("deplevel").value="";

    };

};
// ======================================
// Create Departure
// ======================================

function createDeparture(runway){

    const depCallsign =
    document.getElementById("depcallsign").value.trim();


    const depLevel =
    document.getElementById("deplevel").value.trim();



    let start;
    let heading;


    if(runway === "26"){

        // West of CCB
        start = bearingToXY(260,1);

        // RWY 26 departure towards west
        heading = 260;

    }
    else{

        // East of CCB
        start = bearingToXY(80,1);

        // RWY 08 departure towards east
        heading = 80;

    }



    departures.push({

        callsign:
        depCallsign || "DEP001",


        type:"A320",


        x:start.x,
        y:start.y,


        labelAngle:0,


        heading:heading,

        targetHeading:heading,


        turnDirection:"SHORTEST",


        level:0,

        targetLevel:
        depLevel !== ""
        ? Number(depLevel)
        : 100,


        verticalSpeed:0,


        speed:250,


        active:true

    });



    console.log(
        "Departure created:",
        depCallsign,
        "FL",
        depLevel
    );

}



// ======================================
// Buttons
// ======================================

document.getElementById("createDeparture").onclick = function(){


    const runway =
    document.getElementById("depRunway").value;


    createDeparture(runway);



    // Clear input after creating departure

    document.getElementById("depcallsign").value = "";

    document.getElementById("deplevel").value = "";


};




// ======================================
// Move Departures
// ======================================

function moveDepartures(){


    departures.forEach(ac=>{


        if(!ac.active)
            return;
console.log(
ac.callsign,
ac.heading,
ac.targetHeading
);
// ======================================
// Heading Turn
// ======================================

// ======================================
// Heading Turn with Direction Control
// ======================================
if(ac.heading !== ac.targetHeading){

    const turnRate = 3;

    let diff =
    (ac.targetHeading - ac.heading + 360) % 360;



    if(ac.turnDirection === "LEFT"){

        ac.heading -= turnRate;

        if(ac.heading < 0)
            ac.heading += 360;

    }


    else if(ac.turnDirection === "RIGHT"){

        ac.heading += turnRate;

        if(ac.heading >= 360)
            ac.heading -= 360;

    }


    else{

        // SHORTEST TURN

        if(diff > 180)
            diff -= 360;


        if(Math.abs(diff) <= turnRate){

            ac.heading = ac.targetHeading;

        }
        else{

            ac.heading += diff > 0
            ? turnRate
            : -turnRate;

        }


        if(ac.heading < 0)
            ac.heading += 360;


        if(ac.heading >= 360)
            ac.heading -= 360;

    }


}

        // 5 NM per minute

        const movement = 5 / 60;


        const pixels =
        movement * PIXELS_PER_NM;



        const angle =
        (ac.heading - 90) * Math.PI / 180;



        ac.x += Math.cos(angle) * pixels;

        ac.y += Math.sin(angle) * pixels;



        // Climb

        if(ac.level < ac.targetLevel){


            ac.level += 0.25;


            ac.verticalSpeed = 1500;



            if(ac.level >= ac.targetLevel){

                ac.level = ac.targetLevel;

                ac.verticalSpeed = 0;

            }

        }


    });

}
