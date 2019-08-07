import p5 from "p5";
import "p5/lib/addons/p5.sound";
import initP5Collide from "./p5.collide2d";

import { guess } from "web-audio-beat-detector";

import Player from "./player";
import Obstacle from "./obstacle";
import UI from "./ui";
import BufferLoader from "./bufferLoader";

let P5;

const startGame = () => {
    GAMEUI.hideMenu();
    P5 = new p5(sketch);
    initP5Collide(P5);
};

const endGame = points => {
    P5.remove();
    GAMEUI.showMenu();
    GAMEUI.displayPoints(points);
};

const GAMEUI = new UI(startGame);

let sketch = s => {
    let song;
    let player;
    let obstacles;
    let points;
    let baseColors;
    let bgColor;
    let gameIsRunning = false;
    let gameSpeed = 10;
    let context;
    let bufferLoader;
    let lastBeatTime;
    let songBpm;
    let songFiles = [
        "./music/Tokyo Rose - Gran Turismo.mp3",
        "./music/VHS Dreams - Vice Point.mp3",
        "./music/Mitch Murder - Prime Operator.mp3",
        "./music/Stellar Dreams - Valkyrie.mp3",
    ];

    s.setup = () => {
        let canvas = s.createCanvas(
            GAMEUI.gameContainer.offsetWidth,
            GAMEUI.gameContainer.offsetHeight
        );
        canvas.parent("game-canvas");
        s.frameRate(60);

        baseColors = [
            s.color(15, 248, 223),
            s.color(254, 195, 44),
            s.color(205, 99, 255),
            s.color(255, 62, 108),
        ];

        points = 0;
        obstacles = [];
        player = new Player(s);
        bgColor = s.color(0, 0, 0);

        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
        let songFile = songFiles[Math.round(s.random(0, songFiles.length - 1))];

        bufferLoader = new BufferLoader(context, [songFile], function(
            bufferList
        ) {
            guess(bufferList[0])
                .then(({ bpm, offset }) => {
                    console.log("Selected Song: " + songFile);
                    console.log(
                        "BPM: " + bpm,
                        ", First beat at: " + offset + " seconds"
                    );
                    songBpm = bpm;
                    lastBeatTime = offset;
                    song = s.loadSound(songFile, function() {
                        gameIsRunning = true;
                        song.play();
                        checkBeat();
                    });
                })
                .catch(err => {
                    console.log(err);
                    // something went wrong
                });
        });

        bufferLoader.load();
    };

    s.draw = () => {
        if (gameIsRunning) {
            s.clear();
            s.background(bgColor);

            player.update(s, s.width, s.height);
            player.draw(s);

            obstacles = obstacles.filter(obstacle => {
                obstacle.update(gameSpeed);
                if (obstacle.x + obstacle.width > 0) {
                    obstacle.draw(s);
                    return true;
                } else {
                    points++;
                    return false;
                }
            });

            if (player.collide(s, obstacles)) {
                gameIsRunning = false;
                endGame(points);
            }

            s.textSize(40);
            s.textFont("Helvetica Now Display");
            s.textStyle(s.BOLD);
            s.fill(255, 255, 255);
            s.text(points.toString(), 24, 54);
        }
    };

    s.keyPressed = () => {
        if (s.keyCode === 32) {
            player.jump(s);
        }
    };

    const checkBeat = () => {
        let time = song.currentTime();
        let beatInterval = 60 / songBpm;

        /*
        if (time + beatInterval * 2 - lastBeatTime > beatInterval) {
            obstacles.push(new Obstacle(s, baseColors));
        }*/

        let color = s.color(255, 255, 255);

        if (time - lastBeatTime > beatInterval) {
            lastBeatTime = lastBeatTime + beatInterval;
            obstacles.push(new Obstacle(s, [color, color]));
            var newBgColor = bgColor;
            while (newBgColor === bgColor) {
                newBgColor = baseColors[Math.round(s.random(0, 3))];
            }
            bgColor = newBgColor;
        }

        if (gameIsRunning && song.isPlaying()) {
            setTimeout(function() {
                checkBeat();
            }, 1);
        }
    };
};
