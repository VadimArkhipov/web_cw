async function game(){

    let array = ['brokenTune.mp3','enemyBeatsPlayer.mp3','gameOver.mp3','nextLevel.mp3', 'youWon.mp3','eat.mp3'];
    array = array.map(elem => `../sounds/${elem}`);

    
    soundManager.init();
    soundManager.loadArray(array);


    await gameManager.loadAll();
    gameManager.play();

}


let canvas = document.getElementById("canvasId");
let ctx = canvas.getContext("2d");
let canvasState = document.getElementById("canvasForHealth");
let ctxState = canvasState.getContext("2d");

ctxState.textAlign='start';
ctxState.textBaseline = 'top';
ctxState.fillStyle = 'black';
ctxState.font = '40px "Century"';


game();
