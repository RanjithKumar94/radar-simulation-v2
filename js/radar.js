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
const ROUTE_COLOR = "#555555";
const TEXT_COLOR = "#999999";
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
// Named Fixes (reporting points at 50 NM,
// one at the end of each CCB route)
// ======================================

const FIXES = [

    {name:"ELBIS", bearing:190, distance:50},
    {name:"ANKIT", bearing:252, distance:50},
    {name:"SULEM", bearing:300, distance:50},
    {name:"MANUR", bearing:270, distance:50},
    {name:"BAMUL", bearing:350, distance:50},
    {name:"MANDU", bearing:70,  distance:50},
    {name:"DUMAS", bearing:120, distance:50}

];

function drawFixes(){

    FIXES.forEach(fix=>{

        const p = bearingToXY(fix.bearing, fix.distance);

        // Triangle marker (standard reporting-point symbol)

        ctx.beginPath();
        ctx.moveTo(p.x, p.y - 6);
        ctx.lineTo(p.x - 5, p.y + 4);
        ctx.lineTo(p.x + 5, p.y + 4);
        ctx.closePath();

        ctx.strokeStyle = TEXT_COLOR;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = TEXT_COLOR;
        ctx.font = "13px Consolas";
        ctx.textAlign = "left";

        ctx.fillText(fix.name, p.x + 8, p.y + 4);

    });

}

// ======================================
// Extra unnamed route: DUMAS to the
// 088-R/CCB route at 20 NM from CCB
// ======================================

const EXTRA_ROUTES = [

    {
        from:{bearing:120, distance:50},   // DUMAS
        to:{bearing:88, distance:20}
    }

];

function drawExtraRoutes(){

    ctx.strokeStyle = ROUTE_COLOR;
    ctx.lineWidth = 2;

    EXTRA_ROUTES.forEach(r=>{

        const start = bearingToXY(r.from.bearing, r.from.distance);
        const end   = bearingToXY(r.to.bearing, r.to.distance);

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

    });

}

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

    for(let i=10;i<=60;i+=10){

        ctx.lineWidth = (i === 30) ? 2.5 : 1;

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
        bearing1:260, label1:"08",
        bearing2:80,  label2:"26"
    },

    "1533": {
        bearing1:335, label1:"15",
        bearing2:155, label2:"33"
    }

};

// Default active runway
let activeRunway = "0826";
let activeRunwayDirection = "26";   // exact selection: "08","26","15","33"

// Display range filter (NM) - does NOT rescale the map,
// just hides aircraft further than this from CCB
let displayRange = 60;

function getActiveRunway(){
    return RUNWAYS[activeRunway];
}

function setActiveRunwayFromSelect(value){

    activeRunwayDirection = value;

    if(value === "08" || value === "26"){
        activeRunway = "0826";
    }
    else{
        activeRunway = "1533";
    }

}

// ======================================
// RWY 08/26 real physical geometry
// (from actual survey data - not the
// simplified "CCB sits on the centreline"
// model used elsewhere in this file)
// ======================================

const RWY_0826_DATA = {

    lengthM: 3812,          // full pavement length
    widthM: 60,

    displacedFrom08M: 140,  // 08 landing threshold, in from physical 08 end
    displacedFrom26M: 240,  // 26 landing threshold, in from physical 26 end

    ccbPerpOffsetM: 400,    // CCB's perpendicular distance from centreline

    // ASSUMPTION: CCB's perpendicular foot on the centreline lands
    // exactly at the RWY08 displaced (landing) threshold. Flagged
    // for confirmation - easy to adjust if that's not quite right.
    ccbFootIsRwy08Threshold: true

};

function metersToPx(m){
    return nm(m / 1852);
}

// Computes the real touchdown points / pavement ends for 08/26,
// all relative to CCB, in canvas pixel space.
function getRunway0826Geometry(){

    const d = RWY_0826_DATA;

    // "along" = direction of travel landing on 26 (08 -> 26), bearing 080
    const alongAngle = (80 - 90) * Math.PI / 180;
    const along = {x:Math.cos(alongAngle), y:Math.sin(alongAngle)};

    // perpendicular to the runway (side CCB sits on - assumption,
    // flip sign here if it renders on the wrong side)
    const perp = {x:-along.y, y:along.x};

    function addScaled(base, dir, meters){
        const px = metersToPx(meters);
        return {x: base.x + dir.x*px, y: base.y + dir.y*px};
    }

    // CCB's foot on the centreline = RWY08 landing threshold (assumption above)
    const touchdown08 = addScaled(CCB, perp, -d.ccbPerpOffsetM);

    const pavementStart08 = addScaled(touchdown08, along, -d.displacedFrom08M);
    const pavementEnd26   = addScaled(pavementStart08, along, d.lengthM);
    const touchdown26     = addScaled(pavementEnd26, along, -d.displacedFrom26M);

    return {along, perp, touchdown08, touchdown26, pavementStart08, pavementEnd26};

}

// Landing heading (direction of travel while touching down) per runway direction
const RWY_LANDING_HEADING = {"08":80, "26":260, "15":155, "33":335};

function getApproachBearing(direction){
    return (RWY_LANDING_HEADING[direction] + 180) % 360;
}

function getTouchdownPoint(direction){

    if(direction === "08" || direction === "26"){
        const geo = getRunway0826Geometry();
        return direction === "08" ? geo.touchdown08 : geo.touchdown26;
    }

    // No survey data given yet for 15/33 - falls back to CCB
    // (zero correction) until that runway's dimensions are provided.
    return {x: CCB.x, y: CCB.y};

}

// How much to correct "distance to CCB" into "distance to touchdown",
// projected along the inbound approach track (NM). Positive = touchdown
// is further along the inbound track than CCB (aircraft has further to
// go); negative = touchdown is closer than CCB.
function getTouchdownCorrectionNM(direction){

    if(direction !== "08" && direction !== "26") return 0;

    const geo = getRunway0826Geometry();
    const touchdown = direction === "08" ? geo.touchdown08 : geo.touchdown26;

    const landingAngle =
    (RWY_LANDING_HEADING[direction] - 90) * Math.PI / 180;

    const inboundDir = {x:Math.cos(landingAngle), y:Math.sin(landingAngle)};

    const dx = touchdown.x - CCB.x;
    const dy = touchdown.y - CCB.y;

    const alongPx = dx*inboundDir.x + dy*inboundDir.y;

    return alongPx / PIXELS_PER_NM;

}

// ======================================
// PART 2
// Draw Runway
// ======================================

function drawRunway(){

    const rwy = getActiveRunway();

    if(activeRunway === "0826"){

        // Real dimensioned rectangle from actual survey data
        const geo = getRunway0826Geometry();
        const halfWidthPx = metersToPx(RWY_0826_DATA.widthM) / 2;

        const corners = [

            {x: geo.pavementStart08.x + geo.perp.x*halfWidthPx,
             y: geo.pavementStart08.y + geo.perp.y*halfWidthPx},

            {x: geo.pavementEnd26.x + geo.perp.x*halfWidthPx,
             y: geo.pavementEnd26.y + geo.perp.y*halfWidthPx},

            {x: geo.pavementEnd26.x - geo.perp.x*halfWidthPx,
             y: geo.pavementEnd26.y - geo.perp.y*halfWidthPx},

            {x: geo.pavementStart08.x - geo.perp.x*halfWidthPx,
             y: geo.pavementStart08.y - geo.perp.y*halfWidthPx}

        ];

        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        corners.slice(1).forEach(c => ctx.lineTo(c.x, c.y));
        ctx.closePath();
        ctx.fill();

        // Displaced threshold tick marks
        [geo.touchdown08, geo.touchdown26].forEach(td=>{

            const tPx = metersToPx(15);

            ctx.strokeStyle = "#FF0000";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(td.x + geo.perp.x*tPx, td.y + geo.perp.y*tPx);
            ctx.lineTo(td.x - geo.perp.x*tPx, td.y - geo.perp.y*tPx);
            ctx.stroke();

        });

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("08", geo.pavementStart08.x, geo.pavementStart08.y - 12);
        ctx.fillText("26", geo.pavementEnd26.x, geo.pavementEnd26.y - 12);
        ctx.textAlign = "left";

    }
    else{

        // No survey data yet for 15/33 - simplified line
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

}

// ======================================
// Extended Approach Centreline with tick
// marks, anchored to the true touchdown
// point (not CCB) for the active runway.
// Every 1 NM out to 15 NM: 0.5 NM tick
// each side; at 5/10/15 NM: 1 NM each side.
// ======================================

function drawCentreline(){

    const touchdown = getTouchdownPoint(activeRunwayDirection);
    const approachBearing = getApproachBearing(activeRunwayDirection);

    const angle = (approachBearing - 90) * Math.PI / 180;
    const dir = {x:Math.cos(angle), y:Math.sin(angle)};
    const perp = {x:-dir.y, y:dir.x};

    ctx.save();

    ctx.strokeStyle = "#FFAA00";
    ctx.lineWidth = 2;
    ctx.setLineDash([10,6]);

    const end15 = {
        x: touchdown.x + dir.x*nm(15),
        y: touchdown.y + dir.y*nm(15)
    };

    ctx.beginPath();
    ctx.moveTo(touchdown.x, touchdown.y);
    ctx.lineTo(end15.x, end15.y);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.lineWidth = 1.5;

    for(let d=1; d<=15; d++){

        const center = {
            x: touchdown.x + dir.x*nm(d),
            y: touchdown.y + dir.y*nm(d)
        };

        const half = (d % 5 === 0) ? nm(1) : nm(0.5);

        const p1 = {x:center.x + perp.x*half, y:center.y + perp.y*half};
        const p2 = {x:center.x - perp.x*half, y:center.y - perp.y*half};

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        ctx.fillStyle = "#FFAA00";
        ctx.font = "11px Consolas";
        ctx.textAlign = "center";
        ctx.fillText(d + "NM", center.x, center.y - half - 4);

    }

    ctx.textAlign = "left";
    ctx.restore();

}
// ======================================
// Draw Traffic Circuit (active runway)
// ======================================

function drawTrafficCircuit(){

    const rwy = getActiveRunway();

    let end1, end2;

    if(activeRunway === "0826"){

        // Anchor to the real pavement ends (extended 2NM beyond
        // each end, same idea as the old bearingToXY(...,12))
        const geo = getRunway0826Geometry();
        const ext = metersToPx(2 * 1852);

        end1 = {
            x: geo.pavementStart08.x - geo.along.x*ext,
            y: geo.pavementStart08.y - geo.along.y*ext
        };

        end2 = {
            x: geo.pavementEnd26.x + geo.along.x*ext,
            y: geo.pavementEnd26.y + geo.along.y*ext
        };

    }
    else{

        end1 = bearingToXY(rwy.bearing1,12);
        end2 = bearingToXY(rwy.bearing2,12);

    }

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

    ctx.strokeStyle="#FFFFFF";
    ctx.lineWidth=2;
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

    {bearing:125, distance:14},   // A
    {bearing:117, distance:19},   // B
    {bearing:137, distance:25},   // C
    {bearing:145, distance:23},   // D
    {bearing:140, distance:14}    // E

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

    const labelPt = bearingToXY(130, 19);

    ctx.fillStyle = "#FF0000";
    ctx.font = "13px Consolas";
    ctx.textAlign = "center";
    ctx.fillText("VAD-99", labelPt.x, labelPt.y - 4);
    ctx.fillText("GND/UNL", labelPt.x, labelPt.y + 10);
    ctx.textAlign = "left";

    ctx.restore();

}

// ======================================
// Range / Bearing Line (RBL)
// Works between: aircraft-aircraft,
// aircraft-point, or point-point
// ======================================

let rbls = [];
let rblMode = false;
let rblFirstPoint = null;

function updateRblStatus(text){

    const el = document.getElementById("rblStatus");

    if(el){
        el.textContent = text;
    }

}

// Resolve a stored RBL endpoint to its current x/y.
// Returns null if it referenced an aircraft that's no longer active.
function resolveRblPoint(pt, activeList){

    if(pt.ac){

        if(!activeList.includes(pt.ac)) return null;

        return {x:pt.ac.x, y:pt.ac.y};

    }

    return {x:pt.x, y:pt.y};

}

function drawRBLs(){

    const activeList =
    [...(typeof aircraft !== "undefined" ? aircraft : []),
     ...(typeof departures !== "undefined" ? departures : [])]
    .filter(ac => ac.active);

    rbls.forEach(rbl=>{

        const a = resolveRblPoint(rbl.a, activeList);
        const b = resolveRblPoint(rbl.b, activeList);

        if(!a || !b) return;

        const ax = a.x, ay = a.y;
        const bx = b.x, by = b.y;

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
    .filter(ac=>{

        if(!ac.active) return false;

        if(typeof displayRange !== "undefined"){

            const dx = ac.x - CCB.x;
            const dy = ac.y - CCB.y;
            const distNM = Math.sqrt(dx*dx + dy*dy) / PIXELS_PER_NM;

            if(distNM > displayRange) return false;

        }

        return true;

    });


    // =====================================
    // PASS 1: compute label anchor points,
    // then repel overlapping labels apart
    // =====================================

    const LABEL_W = 100;
    const LABEL_H = 46;

    const labels = activeList.map(ac=>{

        const angle = ac.labelAngle * Math.PI / 180;
        const leaderLength = 45;

        const bx = ac.x + Math.cos(angle) * leaderLength;
        const by = ac.y + Math.sin(angle) * leaderLength;

        // Text is drawn to the right of the pivot if cos(angle)>=0,
        // to the left otherwise - so the collision box must sit on
        // that same side, not centered on the pivot.
        const dir = Math.cos(angle) >= 0 ? 1 : -1;

        if(!ac.labelOffset){
            ac.labelOffset = {x:0, y:0};
        }

        return {
            ac,
            bx, by, dir,
            ox: ac.labelOffset.x,
            oy: ac.labelOffset.y
        };

    });

    for(let pass=0; pass<8; pass++){

        for(let i=0; i<labels.length; i++){

            for(let j=i+1; j<labels.length; j++){

                const a = labels[i];
                const b = labels[j];

                // Box centre = pivot + offset, shifted toward the
                // side the text actually renders on, plus a bit
                // for the vertical spread of the 3 text lines.
                const ax = a.bx + a.ox + a.dir * (LABEL_W/2);
                const ay = a.by + a.oy + 6;
                const cx = b.bx + b.ox + b.dir * (LABEL_W/2);
                const cy = b.by + b.oy + 6;

                const dx = cx - ax;
                const dy = cy - ay;

                const overlapX = LABEL_W - Math.abs(dx);
                const overlapY = LABEL_H - Math.abs(dy);

                if(overlapX > 0 && overlapY > 0){

                    // Push apart along the axis with LESS overlap
                    if(overlapX < overlapY){

                        const push = (overlapX / 2 + 1) * (dx >= 0 ? 1 : -1);
                        a.ox -= push;
                        b.ox += push;

                    }
                    else{

                        const push = (overlapY / 2 + 1) * (dy >= 0 ? 1 : -1);
                        a.oy -= push;
                        b.oy += push;

                    }

                }

            }

        }

    }

    // Persist (with light smoothing so labels glide, not jump)
    // and clamp so a label can't drift off arbitrarily far.
    labels.forEach(l=>{

        l.ac.labelOffset.x += (l.ox - l.ac.labelOffset.x) * 0.5;
        l.ac.labelOffset.y += (l.oy - l.ac.labelOffset.y) * 0.5;

        l.ac.labelOffset.x = Math.max(-70, Math.min(70, l.ac.labelOffset.x));
        l.ac.labelOffset.y = Math.max(-70, Math.min(70, l.ac.labelOffset.y));

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
        // History trail (last 4 positions)
        // =====================================

        if(ac.trail && ac.trail.length){

            ac.trail.forEach((pt,i)=>{

                const fade = 0.35 + (0.55 * (i+1) / ac.trail.length);

                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 3, 0, Math.PI*2);
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
        // Row 2: actual level, target level,
        // climb/descend rate (hundreds of ft/min)
        // =====================================

        const currentFL =
        Math.round(ac.level);

        const assignedFL =
        Math.round(ac.targetLevel);

        let rateText = "";

        if(ac.verticalSpeed > 0){

            rateText =
            " ↑" + Math.round(Math.abs(ac.verticalSpeed)/100);

        }
        else if(ac.verticalSpeed < 0){

            rateText =
            " ↓" + Math.round(Math.abs(ac.verticalSpeed)/100);

        }

        const levelText =
        currentFL + " " + assignedFL + rateText;

        ctx.fillText(
            levelText,
            labelX,
            ly + 5
        );



        // =====================================
        // Row 3: speed
        // =====================================

        const speedText =
        Math.round(ac.speed) + "KT";

        ctx.fillText(
            speedText,
            labelX,
            ly + 20
        );



        // Reset
        ctx.textAlign = "left";


    });

}
// ======================================
// Draw Complete Radar
// ======================================

function getZoomFactor(){
    return 60 / displayRange;
}

// Convert a raw canvas click (screen space) into the same
// world-space coordinates aircraft x/y are stored in,
// undoing the zoom transform used for rendering.
function screenToWorld(mx, my){

    const zoom = getZoomFactor();

    return {
        x: CCB.x + (mx - CCB.x) / zoom,
        y: CCB.y + (my - CCB.y) / zoom
    };

}

function drawRadar(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    const zoom = getZoomFactor();

    ctx.save();

    // Zoom around CCB - underlying aircraft x/y never change,
    // only how they're rendered on screen changes.
    ctx.translate(CCB.x, CCB.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-CCB.x, -CCB.y);

    drawBackground();
    drawRoutes();
    drawExtraRoutes();
    drawNDBRoutes();
    drawVAD99();
    drawRunway();
    drawTrafficCircuit();
    drawCentreline();
    drawCCB();
    drawNDBs();
    drawFixes();

    drawUnknownBlips();
    drawAircraft();
    drawRBLs();

    ctx.restore();

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

    const rangeSelect = document.getElementById("rangeSelect");

    if(rangeSelect){

        displayRange = Number(rangeSelect.value);

        rangeSelect.onchange = function(){
            displayRange = Number(this.value);
        };

    }

    const rblBtn = document.getElementById("rblBtn");
    const clearRblBtn = document.getElementById("clearRblBtn");

    if(rblBtn){

        rblBtn.onclick = function(){

            rblMode = !rblMode;
            rblFirstPoint = null;

            rblBtn.style.background = rblMode ? "#007700" : "";
            rblBtn.textContent = rblMode ? "RBL: ON (click 2 pts)" : "DRAW RBL";

            updateRblStatus(
                rblMode
                ? "RBL mode ON — click an aircraft or any point"
                : "RBL mode off"
            );

            console.log("RBL mode:", rblMode);

        };

    }

    if(clearRblBtn){

        clearRblBtn.onclick = function(){

            rbls = [];
            rblFirstPoint = null;
            updateRblStatus(rblMode ? "RBL mode ON — click an aircraft or any point" : "");

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
    // RBL mode: click aircraft OR any point,
    // on either end, in any combination
    // =====================================

    if(rblMode){

        const world = screenToWorld(mx, my);

        const activeList =
        [...aircraft, ...(typeof departures !== "undefined" ? departures : [])]
        .filter(ac => ac.active);

        const hitAircraft = activeList.find(ac=>{
            const dx = world.x - ac.x;
            const dy = world.y - ac.y;
            return Math.sqrt(dx*dx+dy*dy) <= 18 / getZoomFactor();
        });

        // Either the aircraft we clicked, or the raw point clicked
        const clickedPoint = hitAircraft
        ? {ac: hitAircraft}
        : {x: world.x, y: world.y};

        const clickedLabel = hitAircraft
        ? hitAircraft.callsign
        : "point (" + Math.round(world.x) + "," + Math.round(world.y) + ")";

        if(!rblFirstPoint){

            rblFirstPoint = clickedPoint;
            console.log("RBL: first point =", clickedLabel);
            updateRblStatus("RBL: " + clickedLabel + " selected — click a second aircraft or point");

        }
        else{

            rbls.push({a:rblFirstPoint, b:clickedPoint});
            console.log("RBL drawn:", clickedLabel);
            updateRblStatus("RBL drawn to " + clickedLabel);
            rblFirstPoint = null;

        }

        return;

    }

const world = screenToWorld(mx, my);

[...aircraft, ...(typeof departures !== "undefined" ? departures : [])].forEach(ac=>{
        if(!ac.active) return;

        const angle = ac.labelAngle * Math.PI / 180;
        const leaderLength = 35;

        const lx = ac.x + Math.cos(angle) * leaderLength;
        const ly = ac.y + Math.sin(angle) * leaderLength;

        // Label hit box
        if(
            world.x >= lx &&
            world.x <= lx + 100 &&
            world.y >= ly - 20 &&
            world.y <= ly + 35
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

            const speedEl = document.getElementById("speedInput");

            if(speedEl){
                speedEl.value =
                (ac.targetSpeed !== undefined ? ac.targetSpeed : ac.speed);
            }

            const climbEl = document.getElementById("climbRateInput");

            if(climbEl){
                climbEl.value = ac.climbRateFpm || 1500;
            }

            const descentEl = document.getElementById("descentRateInput");

            if(descentEl){
                descentEl.value = ac.descentRateFpm || 1500;
            }

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
