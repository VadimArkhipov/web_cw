let array = ['gameOver.mp3'];
array = array.map(elem => `../sounds/${elem}`);
console.log(array);

soundManager.init();

soundManager.loadArray(array);

soundManager.play('../sounds/gameOver.mp3');

writeScore();

function writeScore(){
    let score = JSON.parse(localStorage.getItem(localStorage.length - 1)).score;
    let p = document.querySelector('p');
    p.innerHTML += `Ваш счет: ${score}`;
}
