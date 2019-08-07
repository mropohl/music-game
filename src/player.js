export default class Player {
    constructor(s) {
        this.height = 40;
        this.width = 40;
        this.x = this.width * 2;
        this.y = Math.round(s.height - this.height);
        this.color = s.color(255, 255, 255);
        this.speedY = 0;
        this.gravity = 3.5;
    }

    collide(s, obstacles) {
        var hit = false;
        var index = 0;
        while (!hit && index < obstacles.length) {
            var obstacle = obstacles[index];
            hit = s.collideRectRect(
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
                obstacle.color = s.color(255, 0, 0);
            }
            index++;
        }
        if (hit) {
            this.color = s.color(255, 0, 0);
        } else {
            this.color = s.color(255, 255, 255);
        }
        return hit;
    }

    jump(s) {
        if (this.y >= s.height - this.height - 10) {
            this.speedY = 45;
        }
    }

    update(s) {
        if (this.speedY > 0) {
            this.speedY = this.speedY - this.gravity;
        } else {
            this.speedY = 0;
        }
        if (this.y < s.height - this.height || this.speedY > 0) {
            this.y = this.y - this.speedY * 1 + this.gravity * 3;
        } else {
            this.y = s.height - this.height;
        }
    }

    draw(s) {
        s.fill(this.color);
        s.rect(this.x, this.y, this.width, this.height);
    }
}
