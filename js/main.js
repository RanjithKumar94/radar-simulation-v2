// ======================================
// main.js
// ATC Simulator Engine
// ======================================
let simulatorPaused = false;


const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");


pauseBtn.onclick = function(){

    simulatorPaused = true;

    console.log("PAUSED =", simulatorPaused);

};


resumeBtn.onclick = function(){

    simulatorPaused = false;

    console.log("RESUMED =", simulatorPaused);

};
let selectedAircraft = null;
let unknownBlips = [];
document.getElementById("rwy26Blip").onclick = function(){

    const start = bearingToXY(35, 60);   // R035 at 60 NM

    unknownBlips.push({

        x: start.x,
        y: start.y,

        heading: 180,      // South
        speed: 550,

        active: true

    });

};
// Simulation Time
let simHour = 5;
let simMinute = 0;
let simSecond = 0;
//--------------------------------------
// Time Functions
//--------------------------------------

function currentMinutes() {
    return simHour * 60 + simMinute;
}

function timeToMinutes(time) {
    const t = time.split(":");
    return parseInt(t[0]) * 60 + parseInt(t[1]);
}

function entryOffset(type) {

    switch(type){

        case "ATR72":
        case "DO228":
            return 18;

        default:
            return 14;
    }

}
document.getElementById("applyBtn").onclick = function(){

    if(selectedAircraft == null){
        alert("Select an aircraft first.");
        return;
    }

    const hdg = document.getElementById("heading").value;
    const lvl = document.getElementById("level").value;

    if(hdg !== "")
        selectedAircraft.targetHeading = parseInt(hdg);

    if(lvl !== "")
        selectedAircraft.targetLevel = parseInt(lvl);
    const turn =
document.querySelector('input[name="turnDir"]:checked').value;


selectedAircraft.turnDirection = turn;
    console.log(
    "TURN SELECTED:",
    document.querySelector('input[name="turnDir"]:checked').value
);
    console.log(
    "AIRCRAFT TURN:",
    selectedAircraft.callsign,
    selectedAircraft.turnDirection
);
console.log(
    "COMMAND GIVEN:",
    selectedAircraft.callsign,
    selectedAircraft.targetHeading
);
};
//--------------------------------------
// Clock
//--------------------------------------

function updateClock(){

    simSecond++;

    if(simSecond>=60){

        simSecond=0;
        simMinute++;

    }

    if(simMinute>=60){

        simMinute=0;
        simHour++;

    }

    document.getElementById("clock").innerHTML =
        String(simHour).padStart(2,"0")+":"+
        String(simMinute).padStart(2,"0")+":"+
        String(simSecond).padStart(2,"0");

}

//--------------------------------------
// Spawn Aircraft
//--------------------------------------
function spawnRWY26Unknown() {

    const start = bearingToXY(35, 60);

    unknownBlips.push({
        x: start.x,
        y: start.y,
        heading: 180,
        speed: 550,
        active: true
    });

}
function spawnAircraft(){

    aircraft.forEach(ac=>{

        if(ac.spawned) return;

        const spawnTime =
            timeToMinutes(ac.ccbETA) -
            entryOffset(ac.type);

        if(currentMinutes()>=spawnTime){

            const start = bearingToXY(ac.entryRadial,60);

            ac.x = start.x;
            ac.y = start.y;

            ac.spawned = true;
            ac.active = true;

            console.log(ac.callsign+" entered");

        }

    });

}
// =====================================
// Arrival Descent Logic
// =====================================


//--------------------------------------
// Move Aircraft
//--------------------------------------
function moveUnknownBlips(){

    unknownBlips.forEach(blip => {

        if(!blip.active) return;

        const movement = blip.speed / 3600;

        const pixels = movement * PIXELS_PER_NM;

        const angle = (blip.heading - 90) * Math.PI / 180;

        blip.x += Math.cos(angle) * pixels;
        blip.y += Math.sin(angle) * pixels;

        const dx = blip.x - CCB.x;
        const dy = blip.y - CCB.y;

        const distance = Math.sqrt(dx * dx + dy * dy) / PIXELS_PER_NM;

        if(distance > 65){

            blip.active = false;

        }

    });

}

function moveAircraft(){

    aircraft.forEach(ac=>{

        if(!ac.active) return;


        // ===============================
        // Speed (NM per second)
        // ===============================

        let movement;

        switch(ac.type){

            case "B777":
                movement = 5.5 / 60;
                break;

            case "B737":
            case "A320":
                movement = 5.0 / 60;
                break;

            case "ATR72":
                movement = 4 / 60;
                break;

            case "DO228":
                movement = 3.5 / 60;
                break;

            default:
                movement = 5.0 / 60;

        }


        // ===============================
        // Heading turn
        // ===============================
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


        // ===============================
// Arrival phase at 8.5 NM
// ===============================

if(ac.distance <= 8.5){

    ac.arrivalPhase = true;

}


// ===============================
// Controller selected descent
// ===============================

if(ac.level > ac.targetLevel){

    const descentRate = 0.25;   // FL/sec (~1500 ft/min)

    ac.level -= descentRate;

    ac.verticalSpeed = -1500;


    if(ac.level <= ac.targetLevel){

        ac.level = ac.targetLevel;

        ac.verticalSpeed = 0;

    }

}


else if(ac.level < ac.targetLevel){

    const climbRate = 0.25;

    ac.level += climbRate;

    ac.verticalSpeed = 1500;


    if(ac.level >= ac.targetLevel){

        ac.level = ac.targetLevel;

        ac.verticalSpeed = 0;

    }

}


else{

    ac.verticalSpeed = 0;

}

        // =====================================
// Final Approach Descent
// =====================================

if(ac.distance <= 8.5 && ac.targetLevel === 0){

    ac.approach = true;

}


if(ac.approach){

    // Descend based on distance remaining

    let requiredLevel = ac.distance * 2.35;

    if(requiredLevel < 0)
        requiredLevel = 0;


    if(ac.level > requiredLevel){

        ac.level -= 0.25;

        ac.verticalSpeed = -1500;


        if(ac.level <= requiredLevel){

            ac.level = requiredLevel;

        }

    }

}

        // ===============================
        // Move aircraft
        // ===============================

        const pixels =
        movement * PIXELS_PER_NM;


        const angle =
        (ac.heading - 90) * Math.PI / 180;


        ac.x += Math.cos(angle) * pixels;
        ac.y += Math.sin(angle) * pixels;


        ac.distance -= movement;


        if(ac.distance < 0)
            ac.distance = 0;



        // ===============================
        // Landing
        // ===============================

        if(ac.distance <= 0.1 && ac.level <= 0){

            ac.landed = true;

        }



        // ===============================
        // Remove after 3 seconds
        // ===============================

        if(ac.landed){

            ac.removeTimer =
            (ac.removeTimer || 0) + 1;


            if(ac.removeTimer >= 3){

                ac.active = false;

                console.log(
                    ac.callsign + " removed"
                );

            }

        }


    });

}
//--------------------------------------
// Start Simulator
//--------------------------------------


setInterval(function(){

    console.log("Timer:", simulatorPaused);

    if(simulatorPaused === true){
        return;
    }

    updateClock();

    spawnAircraft();

    moveAircraft();

    if(typeof moveDepartures === "function"){
    moveDepartures();
}

    moveUnknownBlips();

},1000);
