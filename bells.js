var samples = [];
var names = [];
var playing = false;

/*
    Using p5 for display and preloading
    Howler is much better for the audio playback
    setTimeouts and HackTimer necessary for things to keep time in the background
*/

function preload() {
    var i=1;
    while (i < 55) {
        if ([1, 6, 11, 16, 21, 26, 31].indexOf(i) > -1) {   // just grab what we need
            var num = "" + i;
            if (num.length < 2) num = "0" + num;
            // console.log("Loading " + "samples/belfort" + num + ".MP3");
            var sample = new Howl({src: ["samples/belfort" + num + ".MP3"], volume: 0.25});
            samples.push(sample);
        } else {
            samples.push('nop');
        }
        i++;
    }
}

function setup() { 
    var canvas = createCanvas(800, 240);
    canvas.parent("p5");
    for (var d in data) {
        names.push(data[d][0]);
    }
    frameRate(2);

    console.log(names);
    console.log("Loaded at " + hour() + ":" + minute() + ":" + second());        
    var delay = ((60 - minute()) * 60) + (60 - second())
    console.log("Remaining seconds: " + delay);
    setTimeout(play, delay * 1000);

}

function mouseClicked() {
    play();
}

function play() {
    console.log("Playing...");
    for (var d in data) {
        var times = data[d][1];
        var i = names.indexOf(data[d][0]);
        var s = i*2 + (i * 3);                          // finding harmonies
        var pan = (i / Object.keys(data).length);
        if ((i % 2) == 1) pan *= -1;
        samples[s].stereo(pan);
        for (var t in times) {
            // if (t == 0 || t == times.length -1) continue;   // uncomment to skip the unison hits at the beginning and end
            var time = times[t] * 1000;
            setTimeout(function(s, t) { return function() { 
                samples[s].play(); 
            }}(s), time);
        }
    }
    setTimeout(function() { 
        window.location.reload(true);
    }, 70000);
}

function draw() {

    clear();

    var h = hour() + "";
    var m = minute();
    var s = second();

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

}