var myp5;
var sound;
var client_id = "d7039372b7bf2eee25ff93253c0623e8";
var url = "https://soundcloud.com/trndmusik/dirty-doering-burning-ham";
var song;

var sketch = function(s) {
    var x = 100;
    var y = 100;
    var angleSpeed = 1;
    var angle = 0 ;
    var c = color(181, 157, 0);
    var t = [];
    var myCanvas;
    var freq;


    s.preload = function() {
        song = s.loadSound(sound.stream_url + "?client_id=" + client_id);
    };

    s.setup = function() {
        myCanvas = s.createCanvas(s.windowWidth, s.windowHeight);

        amp = new p5.Amplitude(0.25);
        fft = new p5.FFT(0.25, 256);
        freq = fft.analyze();
        for (var i = 0; i < freq.length; i++) {
            t.push(0);
        }
        song.play();
        s.background(0);


    };

    s.draw = function() {
        console.log("test1")
        stroke(255,12,234);
        line(0,0,Math.random(20),0);
        rotate(radians(angle));
        angel += angleSpeed;

    };

    s.windowResized = function() {
        s.background(0);
        myCanvas.resize(s.windowWidth, s.windowHeight);
    };
};

function oldviz(s) {
    s.background(0, 10);
    s.fill(0, 23, s.random(180, 255), 200);
    var level = amp.getLevel();
    s.ellipse(s.width / 2, s.height / 2, s.map(level, 0, 1, 0, s.height));

    
    freq = fft.analyze();

    s.background(0, 25);
    s.translate(s.width / 2, s.height / 2);

    var freqLoopNum = freq.length - 90;
    
    for (var i = 0; i < freqLoopNum; i++) {
        t[i] += freq[i] / 2000;
        var offset = 10 + i * 3;
        var xPos = offset * s.cos(s.TWO_PI + t[i]);
        var yPos = offset * s.sin(s.TWO_PI + t[i]);

        s.push();
        var c1 = s.color(217, 17, 110);
        var c2 = s.color(74, 17, 89);
        var l = s.lerpColor(c1, c2, i / freqLoopNum);
        s.fill(l);
        s.noStroke();
        s.translate(xPos, yPos);
        s.rotate(s.atan2(yPos, xPos));

        var h = 2 + i * 4 + freq[i] / 20;
        s.rect(0, 0, freq[i] / 40, h);
        s.pop();
    }
}

document.addEventListener("DOMContentLoaded", function(event) {
    SC.initialize({ client_id: client_id });

    var buttonLoad = document.getElementById("button-load");
    var buttonPlay = document.getElementById("button-play");
    var buttonPause = document.getElementById("button-pause");

    buttonLoad.addEventListener("click", function() {
        var url = document.getElementById("input-url").value;

        if (myp5) myp5.remove();

        SC.get("/resolve", { url: url }).then(function(data) {
            console.log(data);
            sound = data;
            myp5 = new p5(sketch);
        });
    });

    buttonPlay.addEventListener("click", function() {
        if (song && !song.isPlaying()) song.play();
    });

    buttonPause.addEventListener("click", function() {
        song.pause();
    });
});
