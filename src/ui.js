export default class UI {
    constructor(startGame) {
        this.startGameBtn = document.getElementById("btn-new-game");
        this.gameContainer = document.getElementById("game-container");
        this.menuContainer = document.getElementById("game-menu");
        this.pointsEl = document.getElementById("points");
        this.menuHeadlineEl = document.getElementById("menu-headline");

        this.startGameBtn.addEventListener("click", function() {
            startGame();
        });
    }

    hideMenu() {
        this.menuContainer.classList.add("hidden");
    }
    showMenu() {
        this.menuContainer.classList.remove("hidden");
    }
    displayPoints(points) {
        this.pointsEl.innerHTML = points + " Points";
    }
}
