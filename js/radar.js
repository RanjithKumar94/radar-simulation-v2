// ======================================
// ATC RADAR SIMULATOR
// radar.js - PART 1
// ======================================

// Canvas
const canvas = document.getElementById("radar");
const ctx = canvas.getContext("2d");

// Radar Size
const RADAR_RADIUS = 380;
const MAX_RANGE = 60;
const PIXELS_PER_NM = RADAR_RADIUS / MAX_RANGE;

function nm(value){
    return value * PIXELS_PER_NM;
}

// Radar Centre
const CENTER_X = canvas.width / 2;
const CENTER_Y = canvas.height / 2;

// CCB VOR
const CCB = {
    x: CENTER_X,
    y: CENTER_Y + 3
};

// Colours
const BG_COLOR = "#001100";
const RING_COLOR = "#00aa44";
const ROUTE_COLOR = "#00ff66";
const TEXT_COLOR = "#00ff66";

// ATS Routes
// ======================================
// ATC RADAR SIMULATOR
// radar.js - PART 1
// ======================================

// Canvas
const canvas = document.getElementById("radar");
const ctx = canvas.getContext("2d");

// Radar Size
const RADAR_RADIUS = 380;
const MAX_RANGE = 60;
const PIXELS_PER_NM = RADAR_RADIUS / MAX_RANGE;

function nm(value){
    return value * PIXELS_PER_NM;
}

// Radar Centre
const CENTER_X = canvas.width / 2;
const CENTER_Y = canvas.height / 2;

// CCB VOR
const CCB = {
    x: CENTER_X,
    y: CENTER_Y + 3
};
const NDBS = [

    {
        id:"PJ",
        radial:190,
        distance:30
    },

    {
        id:"BR",
        radial:252,
        distance:35
    },

    {
        id:"NT",
        radial:15,
        distance:20
    }

];
// Colours
const BG_COLOR = "#001100";
const RING_COLOR = "#00aa44";
const ROUTE_COLOR = "#00ff66";
const TEXT_COLOR = "#00ff66";

// ATS Routes
const ROUTES = [

    {name:"B425", bearing:190},
    {name:"W14", bearing:350},
    {name:"R416", bearing:70},
    {name:"Q1", bearing:252},
    {name:"Q2", bearing:270},
    {name:"G473 NW", bearing:300},
    {name:"G473 SE", bearing:120},

    // NEW
    {name:"PJ", bearing:190},
    {name:"088", bearing:88}

];

// ======================================
// Convert Bearing & Distance to X,Y
// ======================================

function bearingToXY(bearing, distance){

    const angle = (bearing - 90) * Math.PI / 180;

    const scale = RADAR_RADIUS / MAX_RANGE;

    return {

        x: CCB.x + Math.cos(angle) * distance * scale,

        y: CCB.y + Math.sin(angle) * distance * scale

    };

}

// ======================================
// Radar Background
// ======================================

function drawBackground(){

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle = RING_COLOR;
    ctx.lineWidth = 1;

    for(let i=10;i<=60;i+=10){

        ctx.beginPath();

        ctx.arc(
            CCB.x,
            CCB.y,
            i * RADAR_RADIUS / MAX_RANGE,
            0,
            Math.PI * 2
        );

        ctx.stroke();

    }
}
  // ======================================
// PART 2
// Draw Runway
// ======================================

function drawRunway(){

    const p1 = bearingToXY(260,10);
    const p2 = bearingToXY(80,10);

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(p1.x,p1.y);
    ctx.lineTo(p2.x,p2.y);
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "16px Arial";

    ctx.fillText("08",p1.x-22,p1.y+8);
    ctx.fillText("26",p2.x+8,p2.y+8);

}

// ======================================
// Draw Extended Runway Centreline
// ======================================

function drawCentreline(){

    const start = bearingToXY(260,15);
    const end   = bearingToXY(80,15);

    ctx.save();

    ctx.strokeStyle="#FFFF00";
    ctx.lineWidth=2;
    ctx.setLineDash([10,6]);

    ctx.beginPath();
    ctx.moveTo(start.x,start.y);
    ctx.lineTo(end.x,end.y);
    ctx.stroke();

    ctx.restore();

}
// ======================================
// Draw Traffic Circuit RWY 08/26
// ======================================

function drawTrafficCircuit(){
    const end08 = bearingToXY(260,12);
    const end26 = bearingToXY(80,12);
    const dx = end26.x - end08.x;
    const dy = end26.y - end08.y;
    const len = Math.sqrt(dx*dx + dy*dy);

    const px = -dy / len;
    const py = dx / len;

    const offset = nm(5);

    const top08 = {
        x:end08.x + px*offset,
        y:end08.y + py*offset
    };

    const top26 = {
        x:end26.x + px*offset,
        y:end26.y + py*offset
    };

    const bot08 = {
        x:end08.x - px*offset,
        y:end08.y - py*offset
    };

    const bot26 = {
        x:end26.x - px*offset,
        y:end26.y - py*offset
    };

    ctx.strokeStyle="#FFFF00";
    ctx.lineWidth=2;

    // Upper box
    ctx.beginPath();
    ctx.moveTo(end08.x,end08.y);
    ctx.lineTo(top08.x,top08.y);
    ctx.lineTo(top26.x,top26.y);
    ctx.lineTo(end26.x,end26.y);
    ctx.stroke();

    // Lower box
    ctx.beginPath();
    ctx.moveTo(end08.x,end08.y);
    ctx.lineTo(bot08.x,bot08.y);
    ctx.lineTo(bot26.x,bot26.y);
    ctx.lineTo(end26.x,end26.y);
    ctx.stroke();

}

function drawRunway1533(){

    const p1 = bearingToXY(335,10);
    const p2 = bearingToXY(155,10);

    ctx.strokeStyle="#FFFFFF";
    ctx.lineWidth=4;

    ctx.beginPath();
    ctx.moveTo(p1.x,p1.y);
    ctx.lineTo(p2.x,p2.y);
    ctx.stroke();

    ctx.fillStyle="#FFFFFF";
    ctx.font="16px Arial";

    ctx.fillText("33",p1.x-20,p1.y);
    ctx.fillText("15",p2.x+8,p2.y);

}
function drawTrafficCircuit1533(){

    const end33 = bearingToXY(335,12);
    const end15 = bearingToXY(155,12);

    const dx = end15.x - end33.x;
    const dy = end15.y - end33.y;
    const len = Math.sqrt(dx*dx + dy*dy);

    const px = -dy / len;
    const py = dx / len;

    const offset = nm(5);

    const top33 = {
        x: end33.x + px * offset,
        y: end33.y + py * offset
    };

    const top15 = {
        x: end15.x + px * offset,
        y: end15.y + py * offset
    };

    const bot33 = {
        x: end33.x - px * offset,
        y: end33.y - py * offset
    };

    const bot15 = {
        x: end15.x - px * offset,
        y: end15.y - py * offset
    };

    ctx.strokeStyle = "#FFFF00";
    ctx.lineWidth = 2;

    // Upper circuit
    ctx.beginPath();
    ctx.moveTo(end33.x, end33.y);
    ctx.lineTo(top33.x, top33.y);
    ctx.lineTo(top15.x, top15.y);
    ctx.lineTo(end15.x, end15.y);
    ctx.stroke();

    // Lower circuit
    ctx.beginPath();
    ctx.moveTo(end33.x, end33.y);
    ctx.lineTo(bot33.x, bot33.y);
    ctx.lineTo(bot15.x, bot15.y);
    ctx.lineTo(end15.x, end15.y);
    ctx.stroke();

}
// ======================================
// Draw CCB VOR
// ======================================

function drawCCB(){

    ctx.beginPath();
    ctx.arc(CCB.x,CCB.y,4,0,Math.PI*2);

    ctx.fillStyle="#00FFFF";
    ctx.fill();

    ctx.font="16px Arial";
    ctx.fillStyle="#00FFFF";

    ctx.fillText("CCB",CCB.x+8,CCB.y-8);

}
function drawNDBs(){

    ctx.strokeStyle="#00FFFF";
    ctx.fillStyle="#00FFFF";
    ctx.font="15px Consolas";

    NDBS.forEach(ndb=>{

        const p = bearingToXY(
            ndb.radial,
            ndb.distance
        );

        // NDB symbol

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            4,
            0,
            Math.PI*2
        );

        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(p.x-6,p.y);
        ctx.lineTo(p.x+6,p.y);

        ctx.moveTo(p.x,p.y-6);
        ctx.lineTo(p.x,p.y+6);

        ctx.stroke();

        ctx.fillText(
            ndb.id,
            p.x+8,
            p.y-8
        );

    });

}

// ======================================
// Draw ATS Routes
// ======================================

function drawRoutes(){

    ctx.strokeStyle=ROUTE_COLOR;
    ctx.lineWidth=2;

    ROUTES.forEach(route=>{

        const end = bearingToXY(route.bearing,60);

        ctx.beginPath();
        ctx.moveTo(CCB.x,CCB.y);
        ctx.lineTo(end.x,end.y);
        ctx.stroke();

        const label = bearingToXY(route.bearing,56);

        ctx.fillStyle = TEXT_COLOR;
        ctx.font = "15px Consolas";

        ctx.fillText(
            route.name,
            label.x-15,
            label.y
        );

    });

}
// ======================================
// TRAFFIC CIRCUIT CONFIGURATION
// ======================================

const CIRCUIT = {

    centreline:15,
    final:8,
    upwind:8,
    downwind:12,
    width:5

};

  // ======================================
// PART 3
// Draw Aircraft (placeholder)
// ======================================

// ======================================
// Draw Aircraft
// ======================================
// ======================================
// Draw Unknown Blips
// ======================================

function drawUnknownBlips(){

    unknownBlips.forEach(blip => {

        if(!blip.active) return;

        ctx.beginPath();
        ctx.arc(blip.x, blip.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#00FF00";
        ctx.fill();

    });

}
// ======================================
// Draw Aircraft
// ======================================
// ======================================
// Draw Aircraft
// ======================================

// ======================================
// Draw Aircraft
// ======================================

function drawAircraft(){

    // Draw unknown traffic
    if(typeof unknownBlips !== "undefined"){

        unknownBlips.forEach(blip=>{

            if(!blip.active) return;

            ctx.fillStyle = "#FF0000";

            ctx.beginPath();

            ctx.arc(
                blip.x,
                blip.y,
                6,
                0,
                Math.PI * 2
            );

            ctx.fill();

        });

    }


    if(typeof aircraft === "undefined") return;


   [...aircraft, ...(typeof departures !== "undefined" ? departures : [])].forEach(ac=>{

        if(!ac.active) return;


        const x = ac.x;
        const y = ac.y;


        // =====================================
        // Aircraft blip
        // =====================================

        ctx.fillStyle = "#00FF00";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            4,
            0,
            Math.PI * 2
        );

        ctx.fill();



        // =====================================
        // Leader line
        // =====================================

        const angle =
        ac.labelAngle * Math.PI / 180;


        const leaderLength = 45;


        const lx =
        x + Math.cos(angle) * leaderLength;

        const ly =
        y + Math.sin(angle) * leaderLength;


        ctx.strokeStyle = "#00FF00";
        ctx.lineWidth = 1;


        ctx.beginPath();

        ctx.moveTo(x,y);

        ctx.lineTo(lx,ly);

        ctx.stroke();



        // =====================================
        // Label anchor
        // =====================================

        let labelX;
        let align;


        if(Math.cos(angle) >= 0){

            // Right side label
            labelX = lx + 8;
            align = "left";

        }
        else{

            // Left side label
            labelX = lx - 8;
            align = "right";

        }


        ctx.textAlign = align;
        ctx.fillStyle = "#00FF00";
        ctx.font = "14px Consolas";



        // =====================================
        // Callsign
        // =====================================

        ctx.fillText(
            ac.callsign,
            labelX,
            ly - 10
        );



        // =====================================
        // Level
        // =====================================

        const currentFL =
        Math.round(ac.level);

        const assignedFL =
        Math.round(ac.targetLevel);


        let levelText;


        if(currentFL < assignedFL){

            levelText =
            "FL" + currentFL +
            " ↑ FL" + assignedFL;

        }
        else if(currentFL > assignedFL){

            levelText =
            "FL" + currentFL +
            " ↓ FL" + assignedFL;

        }
        else{

            levelText =
            "FL" + currentFL;

        }


        ctx.fillText(
            levelText,
            labelX,
            ly + 5
        );



        // =====================================
        // Vertical speed
        // =====================================

        if(ac.verticalSpeed !== 0){

            let vsText;


            if(ac.verticalSpeed > 0){

                vsText =
                "↑" + ac.verticalSpeed;

            }
            else{

                vsText =
                "↓" + Math.abs(ac.verticalSpeed);

            }


            ctx.fillText(
                vsText,
                labelX,
                ly + 20
            );

        }



        // Reset
        ctx.textAlign = "left";


    });

}
// ======================================
// Draw Complete Radar
// ======================================

function drawRadar(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    drawBackground();
    drawRoutes();
    drawRunway();
    drawTrafficCircuit();
    drawCentreline();
    drawCCB();
drawRunway1533();
    drawTrafficCircuit1533();

    drawUnknownBlips();
    drawAircraft();

    requestAnimationFrame(drawRadar);

}

// ======================================
// Start Radar
// ======================================

window.onload = function(){

    drawRadar();

};

canvas.addEventListener("click", function(e){

    console.log("Canvas clicked");

});
// ======================================
// Label Click Detection
// ======================================
// ======================================
// Aircraft Selection + Label Rotation
// ======================================

canvas.addEventListener("click", function(e){

    const rect = canvas.getBoundingClientRect();

    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

[...aircraft, ...(typeof departures !== "undefined" ? departures : [])].forEach(ac=>{
        if(!ac.active) return;

        const angle = ac.labelAngle * Math.PI / 180;
        const leaderLength = 35;

        const lx = ac.x + Math.cos(angle) * leaderLength;
        const ly = ac.y + Math.sin(angle) * leaderLength;

        // Label hit box
        if(
            mx >= lx &&
            mx <= lx + 100 &&
            my >= ly - 20 &&
            my <= ly + 35
        ){
console.log(
    "Clicked aircraft:",
    ac.callsign,
    ac.labelAngle
);
            // Select aircraft
            selectedAircraft = ac;

            // Rotate label 45°
            ac.labelAngle = (ac.labelAngle + 45) % 360;

            // Fill control panel
            document.getElementById("callsign").value = ac.callsign;
            document.getElementById("heading").value = ac.targetHeading;
            document.getElementById("level").value = ac.targetLevel;

            // Turn direction
            const turn = document.querySelector(
                `input[name="turnDir"][value="${ac.turnDirection}"]`
            );

            if(turn){
                turn.checked = true;
            }

            console.log(ac.callsign + " selected");
        }

    });

});

// ======================================
// Convert Bearing & Distance to X,Y
// ======================================

function bearingToXY(bearing, distance){

    const angle = (bearing - 90) * Math.PI / 180;

    const scale = RADAR_RADIUS / MAX_RANGE;

    return {

        x: CCB.x + Math.cos(angle) * distance * scale,

        y: CCB.y + Math.sin(angle) * distance * scale

    };

}

// ======================================
// Radar Background
// ======================================

function drawBackground(){

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle = RING_COLOR;
    ctx.lineWidth = 1;

    for(let i=10;i<=60;i+=10){

        ctx.beginPath();

        ctx.arc(
            CCB.x,
            CCB.y,
            i * RADAR_RADIUS / MAX_RANGE,
            0,
            Math.PI * 2
        );

        ctx.stroke();

    }
}
  // ======================================
// PART 2
// Draw Runway
// ======================================

function drawRunway(){

    const p1 = bearingToXY(260,10);
    const p2 = bearingToXY(80,10);

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(p1.x,p1.y);
    ctx.lineTo(p2.x,p2.y);
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "16px Arial";

    ctx.fillText("08",p1.x-22,p1.y+8);
    ctx.fillText("26",p2.x+8,p2.y+8);

}

// ======================================
// Draw Extended Runway Centreline
// ======================================

function drawCentreline(){

    const start = bearingToXY(260,15);
    const end   = bearingToXY(80,15);

    ctx.save();

    ctx.strokeStyle="#FFFF00";
    ctx.lineWidth=2;
    ctx.setLineDash([10,6]);

    ctx.beginPath();
    ctx.moveTo(start.x,start.y);
    ctx.lineTo(end.x,end.y);
    ctx.stroke();

    ctx.restore();

}
// ======================================
// Draw Traffic Circuit RWY 08/26
// ======================================

function drawTrafficCircuit(){
    const end08 = bearingToXY(260,12);
    const end26 = bearingToXY(80,12);
    const dx = end26.x - end08.x;
    const dy = end26.y - end08.y;
    const len = Math.sqrt(dx*dx + dy*dy);

    const px = -dy / len;
    const py = dx / len;

    const offset = nm(5);

    const top08 = {
        x:end08.x + px*offset,
        y:end08.y + py*offset
    };

    const top26 = {
        x:end26.x + px*offset,
        y:end26.y + py*offset
    };

    const bot08 = {
        x:end08.x - px*offset,
        y:end08.y - py*offset
    };

    const bot26 = {
        x:end26.x - px*offset,
        y:end26.y - py*offset
    };

    ctx.strokeStyle="#FFFF00";
    ctx.lineWidth=2;

    // Upper box
    ctx.beginPath();
    ctx.moveTo(end08.x,end08.y);
    ctx.lineTo(top08.x,top08.y);
    ctx.lineTo(top26.x,top26.y);
    ctx.lineTo(end26.x,end26.y);
    ctx.stroke();

    // Lower box
    ctx.beginPath();
    ctx.moveTo(end08.x,end08.y);
    ctx.lineTo(bot08.x,bot08.y);
    ctx.lineTo(bot26.x,bot26.y);
    ctx.lineTo(end26.x,end26.y);
    ctx.stroke();

}
// ======================================
// Draw CCB VOR
// ======================================

function drawCCB(){

    ctx.beginPath();
    ctx.arc(CCB.x,CCB.y,4,0,Math.PI*2);

    ctx.fillStyle="#00FFFF";
    ctx.fill();

    ctx.font="16px Arial";
    ctx.fillStyle="#00FFFF";

    ctx.fillText("CCB",CCB.x+8,CCB.y-8);

}

// ======================================
// Draw ATS Routes
// ======================================

function drawRoutes(){

    ctx.strokeStyle=ROUTE_COLOR;
    ctx.lineWidth=2;

    ROUTES.forEach(route=>{

        const end = bearingToXY(route.bearing,60);

        ctx.beginPath();
        ctx.moveTo(CCB.x,CCB.y);
        ctx.lineTo(end.x,end.y);
        ctx.stroke();

        const label = bearingToXY(route.bearing,56);

        ctx.fillStyle = TEXT_COLOR;
        ctx.font = "15px Consolas";

        ctx.fillText(
            route.name,
            label.x-15,
            label.y
        );

    });

}
// ======================================
// TRAFFIC CIRCUIT CONFIGURATION
// ======================================

const CIRCUIT = {

    centreline:15,
    final:8,
    upwind:8,
    downwind:12,
    width:5

};

  // ======================================
// PART 3
// Draw Aircraft (placeholder)
// ======================================

// ======================================
// Draw Aircraft
// ======================================
// ======================================
// Draw Unknown Blips
// ======================================

function drawUnknownBlips(){

    unknownBlips.forEach(blip => {

        if(!blip.active) return;

        ctx.beginPath();
        ctx.arc(blip.x, blip.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#00FF00";
        ctx.fill();

    });

}
// ======================================
// Draw Aircraft
// ======================================
// ======================================
// Draw Aircraft
// ======================================

// ======================================
// Draw Aircraft
// ======================================

function drawAircraft(){

    // Draw unknown traffic
    if(typeof unknownBlips !== "undefined"){

        unknownBlips.forEach(blip=>{

            if(!blip.active) return;

            ctx.fillStyle = "#FF0000";

            ctx.beginPath();

            ctx.arc(
                blip.x,
                blip.y,
                6,
                0,
                Math.PI * 2
            );

            ctx.fill();

        });

    }


    if(typeof aircraft === "undefined") return;


   [...aircraft, ...(typeof departures !== "undefined" ? departures : [])].forEach(ac=>{

        if(!ac.active) return;


        const x = ac.x;
        const y = ac.y;


        // =====================================
        // Aircraft blip
        // =====================================

        ctx.fillStyle = "#00FF00";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            4,
            0,
            Math.PI * 2
        );

        ctx.fill();



        // =====================================
        // Leader line
        // =====================================

        const angle =
        ac.labelAngle * Math.PI / 180;


        const leaderLength = 45;


        const lx =
        x + Math.cos(angle) * leaderLength;

        const ly =
        y + Math.sin(angle) * leaderLength;


        ctx.strokeStyle = "#00FF00";
        ctx.lineWidth = 1;


        ctx.beginPath();

        ctx.moveTo(x,y);

        ctx.lineTo(lx,ly);

        ctx.stroke();



        // =====================================
        // Label anchor
        // =====================================

        let labelX;
        let align;


        if(Math.cos(angle) >= 0){

            // Right side label
            labelX = lx + 8;
            align = "left";

        }
        else{

            // Left side label
            labelX = lx - 8;
            align = "right";

        }


        ctx.textAlign = align;
        ctx.fillStyle = "#00FF00";
        ctx.font = "14px Consolas";



        // =====================================
        // Callsign
        // =====================================

        ctx.fillText(
            ac.callsign,
            labelX,
            ly - 10
        );



        // =====================================
        // Level
        // =====================================

        const currentFL =
        Math.round(ac.level);

        const assignedFL =
        Math.round(ac.targetLevel);


        let levelText;


        if(currentFL < assignedFL){

            levelText =
            "FL" + currentFL +
            " ↑ FL" + assignedFL;

        }
        else if(currentFL > assignedFL){

            levelText =
            "FL" + currentFL +
            " ↓ FL" + assignedFL;

        }
        else{

            levelText =
            "FL" + currentFL;

        }


        ctx.fillText(
            levelText,
            labelX,
            ly + 5
        );



        // =====================================
        // Vertical speed
        // =====================================

        if(ac.verticalSpeed !== 0){

            let vsText;


            if(ac.verticalSpeed > 0){

                vsText =
                "↑" + ac.verticalSpeed;

            }
            else{

                vsText =
                "↓" + Math.abs(ac.verticalSpeed);

            }


            ctx.fillText(
                vsText,
                labelX,
                ly + 20
            );

        }



        // Reset
        ctx.textAlign = "left";


    });

}
// ======================================
// Draw Complete Radar
// ======================================

function drawRadar(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    drawBackground();
    drawRoutes();
    drawRunway();
    drawTrafficCircuit();
    drawCentreline();
    drawCCB();

    drawUnknownBlips();
    drawAircraft();

    requestAnimationFrame(drawRadar);

}

// ======================================
// Start Radar
// ======================================

window.onload = function(){

    drawRadar();

};

canvas.addEventListener("click", function(e){

    console.log("Canvas clicked");

});
// ======================================
// Label Click Detection
// ======================================
// ======================================
// Aircraft Selection + Label Rotation
// ======================================

canvas.addEventListener("click", function(e){

    const rect = canvas.getBoundingClientRect();

    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

[...aircraft, ...(typeof departures !== "undefined" ? departures : [])].forEach(ac=>{
        if(!ac.active) return;

        const angle = ac.labelAngle * Math.PI / 180;
        const leaderLength = 35;

        const lx = ac.x + Math.cos(angle) * leaderLength;
        const ly = ac.y + Math.sin(angle) * leaderLength;

        // Label hit box
        if(
            mx >= lx &&
            mx <= lx + 100 &&
            my >= ly - 20 &&
            my <= ly + 35
        ){
console.log(
    "Clicked aircraft:",
    ac.callsign,
    ac.labelAngle
);
            // Select aircraft
            selectedAircraft = ac;

            // Rotate label 45°
            ac.labelAngle = (ac.labelAngle + 45) % 360;

            // Fill control panel
            document.getElementById("callsign").value = ac.callsign;
            document.getElementById("heading").value = ac.targetHeading;
            document.getElementById("level").value = ac.targetLevel;

            // Turn direction
            const turn = document.querySelector(
                `input[name="turnDir"][value="${ac.turnDirection}"]`
            );

            if(turn){
                turn.checked = true;
            }

            console.log(ac.callsign + " selected");
        }

    });

});
