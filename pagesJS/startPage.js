function submitButtonPressed(){
    const form = document.querySelector('form');
    let name = form.querySelector('input').value;// Имя, введенное игроком
    if(!name){
        return;
    }
    let note = {name: name,
                score: 0};
    localStorage.setItem(localStorage.length, JSON.stringify(note));
}

function writeLastPlayer(){
    if(localStorage.length === 0) return;
    let name = JSON.parse(localStorage.getItem(localStorage.length-1)).name;
    const form = document.querySelector('form');
    form.querySelector('input').value = name;
}

writeLastPlayer()