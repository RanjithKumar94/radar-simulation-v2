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
const BG_COLOR = "#000000";
const RING_COLOR = "#333333";
const ROUTE_COLOR = "#FF0000";
const TEXT_COLOR = "#FF0000";
const AIRCRAFT_COLOR = "#00FF00";
const AIRCRAFT_SELECTED_COLOR = "#FFFF00";

// ATS Routes
const ROUTES = [

    {name:"B425", bearing:190},
    {name:"W14", bearing:350},
    {name:"R416", bearing:70},
    {name:"Q1", bearing:252},
    {name:"Q2", bearing:270},
    {name:"G473 NW", bearing:300},
    {name:"G473 SE", bearing:120},
    {name:"088-R/CCB", bearing:88}

];

// ======================================
// NDBs (defined by radial/distance from CCB)
// ======================================

const NDBS = [

    {name:"PJ", fullName:"PANKAJ", bearing:190, distance:30},   // sits on the B425 track
    {name:"BR", fullName:"BINSAR", bearing:252, distance:35},
    {name:"NT", fullName:"NIPTAN", bearing:20,  distance:15}

];

// Resolve each NDB's x/y once CCB is known
NDBS.forEach(ndb=>{

    const pos = bearingToXY(ndb.bearing, ndb.distance);

    ndb.x = pos.x;
    ndb.y = pos.y;

});

function getNDB(name){

    return NDBS.find(n => n.name === name);

}

// ======================================
// Routes that originate from an NDB
// rather than from CCB directly
// ======================================

const NDB_ROUTES = [

    {name:"W-20", from:"PJ", track:160, length:30},
    {name:"109 TR PJ", from:"PJ", track:109, length:30}

];

// ======================================
// Convert Bearing & Distance to X,Y
// ======================================

function bearingToXY(bearing, distance){

    return pointFromXY(CCB, bearing, distance);

}

// ======================================
// Generic projection from ANY origin point
// (used for NDB-based routes, e.g. PJ NDB)
// ======================================

function pointFromXY(origin, bearing, distance){

    const angle = (bearing - 90) * Math.PI / 180;

    const scale = RADAR_RADIUS / MAX_RANGE;

    return {

        x: origin.x + Math.cos(angle) * distance * scale,

        y: origin.y + Math.sin(angle) * distance * scale

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
// Runway Configuration
// ======================================

const RUNWAYS = {

    "0826": {
        bearing1:260, label1:"26",
        bearing2:80,  label2:"08"
    },

    "1533": {
        bearing1:335, label1:"33",
        bearing2:155, label2:"15"
    }

};

// Default active runway
let activeRunway = "0826";

function getActiveRunway(){
    return RUNWAYS[activeRunway];
}

function setActiveRunwayFromSelect(value){

    if(value === "08" || value === "26"){
        activeRunway = "0826";
    }
    else{
        activeRunway = "1533";
    }

}

// ======================================
// PART 2
// Draw Runway
// ======================================

function drawRunway(){

    const rwy = getActiveRunway();

    const p1 = bearingToXY(rwy.bearing1,10);
    const p2 = bearingToXY(rwy.bearing2,10);

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(p1.x,p1.y);
    ctx.lineTo(p2.x,p2.y);
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "16px Arial";

    ctx.fillText(rwy.label1,p1.x-22,p1.y+8);
    ctx.fillText(rwy.label2,p2.x+8,p2.y+8);

}

// ======================================
// Draw Extended Runway Centreline
// ======================================

function drawCentreline(){

    const rwy = getActiveRunway();

    const start = bearingToXY(rwy.bearing1,15);
    const end   = bearingToXY(rwy.bearing2,15);

    ctx.save();

    ctx.strokeStyle="#FFAA00";
    ctx.lineWidth=2;
    ctx.setLineDash([10,6]);

    ctx.beginPath();
    ctx.moveTo(start.x,start.y);
    ctx.lineTo(end.x,end.y);
    ctx.stroke();

    ctx.restore();

}
// ======================================
// Draw Traffic Circuit (active runway)
// ======================================

function drawTrafficCircuit(){

    const rwy = getActiveRunway();

    const end1 = bearingToXY(rwy.bearing1,12);
    const end2 = bearingToXY(rwy.bearing2,12);
    const dx = end2.x - end1.x;
    const dy = end2.y - end1.y;
    const len = Math.sqrt(dx*dx + dy*dy);

    const px = -dy / len;
    const py = dx / len;

    const offset = nm(5);

    const top1 = {
        x:end1.x + px*offset,
        y:end1.y + py*offset
    };

    const top2 = {
        x:end2.x + px*offset,
        y:end2.y + py*offset
    };

    const bot1 = {
        x:end1.x - px*offset,
        y:end1.y - py*offset
    };

    const bot2 = {
        x:end2.x - px*offset,
        y:end2.y - py*offset
    };

    ctx.strokeStyle="#FF0000";
    ctx.lineWidth=2;

    // Upper box
    ctx.beginPath();
    ctx.moveTo(end1.x,end1.y);
    ctx.lineTo(top1.x,top1.y);
    ctx.lineTo(top2.x,top2.y);
    ctx.lineTo(end2.x,end2.y);
    ctx.stroke();

    // Lower box
    ctx.beginPath();
    ctx.moveTo(end1.x,end1.y);
    ctx.lineTo(bot1.x,bot1.y);
    ctx.lineTo(bot2.x,bot2.y);
    ctx.lineTo(end2.x,end2.y);
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
// Draw NDBs
// ======================================

function drawNDBs(){

    NDBS.forEach(ndb=>{

        // Diamond marker (to distinguish from the CCB VOR circle)

        ctx.save();

        ctx.translate(ndb.x, ndb.y);
        ctx.rotate(Math.PI / 4);

        ctx.fillStyle = "#FFAA00";
        ctx.fillRect(-4, -4, 8, 8);

        ctx.restore();

        ctx.font = "15px Consolas";
        ctx.fillStyle = "#FFAA00";
        ctx.textAlign = "left";

        ctx.fillText(
            (ndb.fullName || ndb.name) + " " + ndb.name,
            ndb.x + 8,
            ndb.y - 8
        );

    });

}

// ======================================
// Draw routes that originate from an NDB
// ======================================

function drawNDBRoutes(){

    ctx.strokeStyle = ROUTE_COLOR;
    ctx.lineWidth = 2;

    NDB_ROUTES.forEach(route=>{

        const origin = getNDB(route.from);

        if(!origin){
            console.warn("NDB_ROUTES: unknown origin NDB", route.from);
            return;
        }

        const end = pointFromXY(
            {x:origin.x, y:origin.y},
            route.track,
            route.length
        );

        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        const label = pointFromXY(
            {x:origin.x, y:origin.y},
            route.track,
            route.length - 4
        );

        ctx.fillStyle = TEXT_COLOR;
        ctx.font = "15px Consolas";
        ctx.textAlign = "left";

        ctx.fillText(
            route.name,
            label.x - 15,
            label.y
        );

    });

}

// ======================================
// VAD-99 Area (GND/UNL)
// NOTE: approximated from the chart image -
// no exact radial/distance vertices were given.
// Adjust the bearing/distance pairs below if you
// have the official coordinates.
// ======================================

const VAD99 = [

    {bearing:110, distance:15},
    {bearing:135, distance:26},
    {bearing:150, distance:22},
    {bearing:145, distance:17},
    {bearing:120, distance:15}

];

function drawVAD99(){

    if(VAD99.length === 0) return;

    ctx.save();

    ctx.beginPath();

    VAD99.forEach((pt,i)=>{

        const p = bearingToXY(pt.bearing, pt.distance);

        if(i === 0){
            ctx.moveTo(p.x,p.y);
        }
        else{
            ctx.lineTo(p.x,p.y);
        }

    });

    ctx.closePath();

    ctx.fillStyle = "rgba(255,0,0,0.20)";
    ctx.fill();

    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 2;
    ctx.stroke();

    const labelPt = bearingToXY(130, 20);

    ctx.fillStyle = "#FF0000";
    ctx.font = "13px Consolas";
    ctx.textAlign = "center";
    ctx.fillText("VAD-99", labelPt.x, labelPt.y - 4);
    ctx.fillText("GND/UNL", labelPt.x, labelPt.y + 10);
    ctx.textAlign = "left";

    ctx.restore();

}

// ======================================
// Range / Bearing Line (RBL) between aircraft
// ======================================

let rbls = [];
let rblMode = false;
let rblFirstAircraft = null;

function updateRblStatus(text){

    const el = document.getElementById("rblStatus");

    if(el){
        el.textContent = text;
    }

}

function drawRBLs(){

    const activeList =
    [...(typeof aircraft !== "undefined" ? aircraft : []),
     ...(typeof departures !== "undefined" ? departures : [])]
    .filter(ac => ac.active);

    rbls.forEach(rbl=>{

        if(!activeList.includes(rbl.a) || !activeList.includes(rbl.b)) return;

        const ax = rbl.a.x, ay = rbl.a.y;
        const bx = rbl.b.x, by = rbl.b.y;

        const dx = bx - ax;
        const dy = by - ay;

        const distanceNM = Math.sqrt(dx*dx + dy*dy) / PIXELS_PER_NM;

        let bearing = (Math.atan2(dy,dx) * 180 / Math.PI) + 90;
        bearing = (bearing + 360) % 360;

        ctx.save();

        ctx.strokeStyle = "#00FFFF";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6,4]);

        ctx.beginPath();
        ctx.moveTo(ax,ay);
        ctx.lineTo(bx,by);
        ctx.stroke();

        ctx.setLineDash([]);

        const midX = (ax+bx)/2;
        const midY = (ay+by)/2;

        const label =
        Math.round(bearing) + "°/" +
        distanceNM.toFixed(1) + "NM";

        ctx.fillStyle = "#00FFFF";
        ctx.font = "13px Consolas";
        ctx.textAlign = "center";
        ctx.fillText(label, midX, midY - 6);
        ctx.textAlign = "left";

        ctx.restore();

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


    const activeList =
    [...aircraft, ...(typeof departures !== "undefined" ? departures : [])]
    .filter(ac => ac.active);


    // =====================================
    // PASS 1: compute label anchor points,
    // then repel overlapping labels apart
    // =====================================

    const LABEL_W = 95;
    const LABEL_H = 46;

    const labels = activeList.map(ac=>{

        const angle = ac.labelAngle * Math.PI / 180;
        const leaderLength = 45;

        const bx = ac.x + Math.cos(angle) * leaderLength;
        const by = ac.y + Math.sin(angle) * leaderLength;

        if(!ac.labelOffset){
            ac.labelOffset = {x:0, y:0};
        }

        return {
            ac,
            bx, by,
            ox: ac.labelOffset.x,
            oy: ac.labelOffset.y
        };

    });

    for(let pass=0; pass<4; pass++){

        for(let i=0; i<labels.length; i++){

            for(let j=i+1; j<labels.length; j++){

                const a = labels[i];
                const b = labels[j];

                const ax = a.bx + a.ox;
                const ay = a.by + a.oy;
                const cx = b.bx + b.ox;
                const cy = b.by + b.oy;

                const dx = cx - ax;
                const dy = cy - ay;

                const overlapX = LABEL_W - Math.abs(dx);
                const overlapY = LABEL_H - Math.abs(dy);

                if(overlapX > 0 && overlapY > 0){

                    // Push apart along the axis with LESS overlap
                    if(overlapX < overlapY){

                        const push = (overlapX / 2) * (dx >= 0 ? 1 : -1);
                        a.ox -= push;
                        b.ox += push;

                    }
                    else{

                        const push = (overlapY / 2) * (dy >= 0 ? 1 : -1);
                        a.oy -= push;
                        b.oy += push;

                    }

                }

            }

        }

    }

    // Persist (with light smoothing so labels glide, not jump)
    labels.forEach(l=>{

        l.ac.labelOffset.x += (l.ox - l.ac.labelOffset.x) * 0.4;
        l.ac.labelOffset.y += (l.oy - l.ac.labelOffset.y) * 0.4;

    });


    // =====================================
    // PASS 2: draw trail, blip, leader line,
    // and label at its (possibly repelled) spot
    // =====================================

    labels.forEach(({ac, bx, by})=>{

        const x = ac.x;
        const y = ac.y;

        const isSelected =
        (typeof selectedAircraft !== "undefined") &&
        selectedAircraft === ac;

        const acColor = isSelected
        ? AIRCRAFT_SELECTED_COLOR
        : AIRCRAFT_COLOR;

        const lx = bx + ac.labelOffset.x;
        const ly = by + ac.labelOffset.y;


        // =====================================
        // History trail (last 3 seconds)
        // =====================================

        if(ac.trail && ac.trail.length){

            ac.trail.forEach((pt,i)=>{

                const fade = (i+1) / (ac.trail.length+1);

                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI*2);
                ctx.fillStyle = isSelected
                ? `rgba(255,255,0,${fade})`
                : `rgba(0,255,0,${fade})`;
                ctx.fill();

            });

        }


        // =====================================
        // Aircraft blip
        // =====================================

        ctx.fillStyle = acColor;

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
        // Leader line (follows the label
        // even after it's been repelled)
        // =====================================

        ctx.strokeStyle = acColor;
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

        const angle = ac.labelAngle * Math.PI / 180;

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
        ctx.fillStyle = acColor;
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
    drawNDBRoutes();
    drawVAD99();
    drawRunway();
    drawTrafficCircuit();
    drawCentreline();
    drawCCB();
    drawNDBs();

    drawUnknownBlips();
    drawAircraft();
    drawRBLs();

    requestAnimationFrame(drawRadar);

}

// ======================================
// Start Radar
// ======================================

window.onload = function(){

    drawRadar();

    const rwySelect = document.getElementById("runwaySelect");

    if(rwySelect){

        setActiveRunwayFromSelect(rwySelect.value);

        rwySelect.onchange = function(){
            setActiveRunwayFromSelect(this.value);
        };

    }

    const rblBtn = document.getElementById("rblBtn");
    const clearRblBtn = document.getElementById("clearRblBtn");

    if(rblBtn){

        rblBtn.onclick = function(){

            rblMode = !rblMode;
            rblFirstAircraft = null;

            rblBtn.style.background = rblMode ? "#007700" : "";
            rblBtn.textContent = rblMode ? "RBL: ON (click 2 A/C)" : "DRAW RBL";

            updateRblStatus(
                rblMode
                ? "RBL mode ON — click an aircraft dot"
                : "RBL mode off"
            );

            console.log("RBL mode:", rblMode);

        };

    }

    if(clearRblBtn){

        clearRblBtn.onclick = function(){

            rbls = [];
            rblFirstAircraft = null;
            updateRblStatus(rblMode ? "RBL mode ON — click an aircraft dot" : "");

        };

    }

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

    // =====================================
    // RBL mode: click two aircraft blips
    // =====================================

    if(rblMode){

        const activeList =
        [...aircraft, ...(typeof departures !== "undefined" ? departures : [])]
        .filter(ac => ac.active);

        const hit = activeList.find(ac=>{
            const dx = mx - ac.x;
            const dy = my - ac.y;
            return Math.sqrt(dx*dx+dy*dy) <= 18;
        });

        if(hit){

            if(!rblFirstAircraft){

                rblFirstAircraft = hit;
                console.log("RBL: first aircraft =", hit.callsign);
                updateRblStatus("RBL: " + hit.callsign + " selected — click a second aircraft");

            }
            else if(hit !== rblFirstAircraft){

                rbls.push({a:rblFirstAircraft, b:hit});
                console.log("RBL drawn:", rblFirstAircraft.callsign, "-", hit.callsign);
                updateRblStatus("RBL drawn: " + rblFirstAircraft.callsign + " – " + hit.callsign);
                rblFirstAircraft = null;

            }

        }
        else{

            updateRblStatus("RBL mode ON — click an aircraft dot");

        }

        return;

    }

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
