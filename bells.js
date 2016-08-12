var samples = [[], [], []];
// var samples = [[]];
var names = [];
var playing = false;

function preload() {
    var bank = 0;
    while (bank < samples.length) {
        var i=1;
        while (i < 55) {
            var num = "" + i;
            if (num.length < 2) num = "0" + num;
            var sample = loadSound("samples/belfort" + num + ".MP3")
            sample.playMode('restart');
            sample.setVolume(0.25);
            samples[bank].push(sample);
            i++;
        }
        bank++;
    }
}

function setup() {
    var canvas = createCanvas(800, 240);
    canvas.parent("p5");
    for (var d in data) {
        names.push(data[d][0]);
    }
    console.log(names);
}

function mouseClicked() {
    play();
}

function play() {
    console.log("Starting...");
    playing = true;
    for (var d in data) {
        var times = data[d][1];
        var i = names.indexOf(data[d][0]);
        var s = i*2 + (i * 3);
        // var pan = ((i / Object.keys(data).length) * 2) - 1;
        var pan = (i / Object.keys(data).length);
        if ((i % 2) == 1) pan *= -1;
        console.log(pan)
        samples[0][s].pan(pan);        
        for (var t in times) {
            var time = times[t]// * 1000.0;
            console.log("Sound " + s + " at time " + time);
            samples[t % samples.length][s].play(time);  // this has a bug and it misses the 0 delay, but sounds nice that way
            // setTimeout(function(s, t) { return function() { 
            //     console.log(samples[s]);
            //     samples[s].play(); 
            // }}(s), time);
        }
    }
}

function draw() {

    clear();

    var h = hour() + "";
    var m = minute();
    var s = second();

    if (m == 0 && s == 1 && playing == false) {
        console.log("PLAY");
        play();
    }
    if (m > 0 && playing == true) {
        playing = false;
    }

    var m = (60 - m);
    if (m == 60) m = 0;
    m = m + "";
    if (m.length < 2) m = "0" + m;

    s = (60 - second());
    if (m == "00") {
        s = "00";
    } else { 
        if (s == 60) s = 0;
        s = s + "";
        if (s.length < 2) s = "0" + s;
    }

    textAlign(CENTER, CENTER);
    textFont("Monaco");
    textSize(100);
    clock = text(h + ":" + m + ":" + s, 800/2, 240/2);

    // border
    // noFill();    
    // rect(0, 0, 799, 239);         

}