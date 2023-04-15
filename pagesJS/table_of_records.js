let table = document.querySelector('table');
let data = getAllData();
console.log(data);
data = deleteDuplicates(data);

fillTableRecords(table, data);

function getAllData() {
    let data = [];

    for(let i = 0; i < window.localStorage.length; i++){
        let elem = JSON.parse(window.localStorage.getItem(i.toString()));
        data.push(elem);
    }

    return data;
}

function fillTableRecords(table, data) {
    let tbody = table.querySelector('tbody');

    for(let i = 0; i < data.length; i++){
        tbody.innerHTML += `<tr> 
                                <td>
                                    ${data[i].name}
                                </td>
                                 <td>
                                    ${data[i].score}
                                </td>
                            </tr>`;
    }
}

function deleteDuplicates(data){
    let newData = [];
    let uniqNames = new Set();
    data.map(elem => uniqNames.add(elem.name));
    for(let name of uniqNames){
        let scores = [];
        data.filter(elem => elem.name === name).map(elem => scores.push(elem.score));
        let note = {name: name, score: Math.max(...scores)};
        newData.push(note);
    }
    return newData;
}