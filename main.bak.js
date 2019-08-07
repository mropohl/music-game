//audio stuff
var client_id = "d7039372b7bf2eee25ff93253c0623e8";
var url = "https://soundcloud.com/synthwave80s/03-highway-lovers";
var soundcloudData;
var song;
var t = [];
var amp;
var fft;
var peakDetect;
var freq;
var ranges = ["bass", "lowMid", "mid", "highMid", "treble"];
var detectors = {};

// gameStuff
var obstacleTimer = 0;
var obstacleCreationTime = 0;
var obstacles = [];
var player;
var points = 0;
var colors = [];
var gameIsRunning = false;
var backgroundColor;
var bpm = 128;
var frames = 60;
var gameSpeed = (bpm / frames) * 4;
var bpmCounter = 0;
//var songLength = 222 * 1000;
var beatInterval = 60 / bpm;
var lastTime = 0;
var gameWidth;
var gameHeight;

//html elements
var startButton = document.getElementById("btn-new-game");
var gameEl = document.getElementById("game-container");
var menuEl = document.getElementById("game-menu");
var pointsEl = document.getElementById("points");
var menuHeadlineEl = document.getElementById("menu-headline");

startButton.addEventListener("click", function() {
    menuEl.classList.add("hidden");
    startGame();
});

function setup() {
    var canvas = createCanvas(gameEl.offsetWidth, gameEl.offsetHeight);
    canvas.parent("game-canvas");
    gameWidth = width;
    gameHeight = height;
    frameRate(60);

    colors = [
        color(15, 248, 223),
        color(254, 195, 44),
        color(205, 99, 255),
        color(255, 62, 108),
    ];

    fft = new p5.FFT();
    peakDetect = new p5.PeakDetect();
    amp = new p5.Amplitude(0.25);
    freq = fft.analyze();
    for (var i = 0; i < freq.length; i++) {
        t.push(0);
    }
    detectors["bass"] = new BeatDetector(10, 0.85, 0.65);
    detectors["lowMid"] = new BeatDetector(30, 0.97, 0.4);
    detectors["mid"] = new BeatDetector(20, 0.9, 0.3);
    detectors["highMid"] = new BeatDetector(40, 0.97, 0.3);
    detectors["treble"] = new BeatDetector(20, 0.9, 0.15);
}

function startGame() {
    points = 0;
    obstacles = [];
    player = new Player(gameWidth, gameHeight);
    backgroundColor = color(0, 0, 0);
    song = loadSound("./Tokyo Rose - Gran Turismo.mp3", function() {
        gameIsRunning = true;
        song.play();
        checkBeat(song);
    });
}

function endGame() {
    gameIsRunning = false;
    menuEl.classList.remove("hidden");
    pointsEl.innerHTML = "Points: " + points;
    song.pause();
}

function checkBeat() {
    var time = song.currentTime();

    if (time - lastTime > beatInterval) {
        lastTime = time;
        obstacles.push(new Obstacle(width, height));
        var newBackgroundColor = backgroundColor;
        while (newBackgroundColor === backgroundColor) {
            newBackgroundColor = colors[Math.round(random(0, 3))];
        }
        backgroundColor = newBackgroundColor;
    }

    if (gameIsRunning && song.isPlaying()) {
        setTimeout(function() {
            checkBeat();
        }, 1);
    }
}

function draw() {
    if (gameIsRunning) {
        clear();
        background(backgroundColor);

        //audio stuff
        fft.analyze();
        var beats = [];

        for (var i = 0; i < ranges.length; i += 1) {
            var r = ranges[i];
            var e = fft.getEnergy(r);
            var level = e / 255.0;
            beats.push({
                range: r,
                level: level,
            });
        }

        /*
        if(beats[0].level > .8) {            

        } 
        */

        // obstacle stuff
        for (var i = obstacles.length - 1; i >= 0; i--) {
            var obstacle = obstacles[i];
            obstacle.update(gameSpeed);
            if (obstacle.x + obstacle.width > 0) {
                obstacle.draw();
            } else {
                points++;
                obstacles.splice(i, 1);
            }
        }

        //player stuff
        player.update(width, height);
        player.draw();
        if (player.collide(obstacles)) {
            //endGame();
        }

        //points
        textSize(40);
        textFont("Helvetica Now Display");
        textStyle(BOLD);
        text(points.toString(), 24, 54);
    }
}

function keyPressed() {
    if (keyCode === 32) {
        if (player.y >= height - player.height - 5) {
            player.speedY = 45;
        }
    }
}

//note: obstacles aus mehreren kleineren cubes wären cool
class Obstacle {
    constructor() {
        this.height = 40;
        this.width = 40;
        this.x = width - this.width;
        this.y = height - this.height;
        this.color = colors[Math.round(random(0, 3))];
    }

    update() {
        this.x -= gameSpeed;
    }

    draw() {
        fill(this.color);
        rect(this.x, this.y, this.width, this.height);
    }
}

class Player {
    constructor() {
        this.height = 40;
        this.width = 40;
        this.x = this.width * 2;
        this.y = Math.round(height - this.height);
        this.color = color(255, 255, 255);
        this.speedY = 0;
        this.gravity = 3.5;
    }

    collide(obstacles) {
        var hit = false;
        var index = 0;
        while (!hit && index < obstacles.length) {
            var obstacle = obstacles[index];
            hit = collideRectRect(
                this.x,
                this.y,
                this.width,
                this.height,
                obstacle.x,
                obstacle.y,
                obstacle.width,
                obstacle.height
            );
            if (hit) {
                obstacle.color = color(255, 0, 0);
            }
            index++;
        }
        if (hit) {
            this.color = color(255, 0, 0);
        } else {
            this.color = color(255, 255, 255);
        }
        return hit;
    }

    update() {
        if (this.speedY > 0) {
            this.speedY = this.speedY - this.gravity;
        } else {
            this.speedY = 0;
        }
        if (this.y < height - this.height || this.speedY > 0) {
            this.y = this.y - this.speedY * 1 + this.gravity * 3;
        } else {
            this.y = height - this.height;
        }
    }

    draw() {
        fill(this.color);
        rect(this.x, this.y, this.width, this.height);
    }
}

class BeatDetector {
    constructor(holdTime, decayRate, minLevel) {
        this.holdTime = holdTime; // the number of frames to hold a beat
        this.decayRate = decayRate;
        this.minLevel = minLevel; // a volume less than this is no beat

        this.cutOff = 0.0;
        this.time = 0;
    }

    detect(level) {
        const val = level || 0.0;

        if (this.minLevel < val && this.cutOff < val) {
            this.cutOff = val * 1.1;
            this.time = 0;

            return true;
        } else {
            if (this.time <= this.holdTime) {
                this.time += 1;
            } else {
                const decayed = this.cutOff * this.decayRate;
                this.cutOff = Math.max(decayed, this.minLevel);
            }
            return false;
        }
    }
}

//beat detection stuff, keine ahnugn wie das funktioniert

function OnsetDetect(f1, f2, str, thresh) {
    this.isDetected = false;
    this.f1 = f1;
    this.f2 = f2;
    this.str = str;
    this.treshold = thresh;
    this.energy = 0;
    this.penergy = 0;
    this.siz = 10;
    this.sensitivity = 500;
}

OnsetDetect.prototype.display = function(x, y) {
    if (this.isDetected == true) {
        this.siz = lerp(this.siz, 40, 0.99);
    } else if (this.isDetected == false) {
        this.siz = lerp(this.siz, 15, 0.99);
    }
    fill(255, 0, 0);
    ellipse(x, y, this.siz, this.siz);
    fill(0);
    text(this.str, x, y);
    text("( " + this.f1 + " - " + this.f2 + "Hz )", x, y + 10);
};

OnsetDetect.prototype.update = function(fftObject) {
    this.energy = fftObject.getEnergy(this.f1, this.f2) / 255;

    if (this.isDetected == false) {
        if (this.energy - this.penergy > this.treshold) {
            this.isDetected = true;
            var self = this;
            setTimeout(function() {
                self.isDetected = false;
            }, this.sensitivity);
        }
    }

    this.penergy = this.energy;
};

function BeatDetect(f1, f2, str, thresh) {
    this.isDetected = false;
    this.f1 = f1;
    this.f2 = f2;
    this.str = str;
    this.treshold = thresh;
    this.energy = 0;

    this.siz = 10;
    this.sensitivity = 500;
}

BeatDetect.prototype.display = function(x, y) {
    if (this.isDetected == true) {
        this.siz = lerp(this.siz, 40, 0.99);
    } else if (this.isDetected == false) {
        this.siz = lerp(this.siz, 15, 0.99);
    }
    fill(255, 0, 0);
    ellipse(x, y, this.siz, this.siz);
    fill(0);
    text(this.str, x, y);
    text("( " + this.f1 + " - " + this.f2 + "Hz )", x, y + 10);
};

BeatDetect.prototype.update = function(fftObject) {
    this.energy = fftObject.getEnergy(this.f1, this.f2) / 255;

    if (this.isDetected == false) {
        if (this.energy > this.treshold) {
            this.isDetected = true;
            var self = this;
            setTimeout(function() {
                self.isDetected = false;
            }, this.sensitivity);
        }
    }
};

/*
SC.initialize({ client_id: client_id });

SC.get("/resolve", { url: url }).then(function(data) {
    soundcloudData = data;
});
*/
