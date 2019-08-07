//note: obstacles aus mehreren kleineren cubes wären cool
export default class Obstacle {
    constructor(s, baseColors) {
        this.height = 40;
        this.width = 40;
        this.x = s.width - this.width;
        this.y = s.height - this.height;
        this.color =
            baseColors[Math.round(Math.random(0, baseColors.length - 1))];
    }

    update(gameSpeed) {
        this.x -= gameSpeed;
    }

    draw(s) {
        s.fill(this.color);
        s.rect(this.x, this.y, this.width, this.height);
    }
}
