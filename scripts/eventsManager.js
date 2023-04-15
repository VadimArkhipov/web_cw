let eventsManager = {
    bind: [], // Сопоставление клавиш действиям
    action: [],//
    setup: function (canvas){
        this.bind[87] = 'up'; // w
        this.bind[65] = 'left'; // a
        this.bind[83] = 'down'; // s
        this.bind[68] = 'right'; // d
        this.bind[32] = 'fire'; // space
        canvas.addEventListener('mousedown', this.onMouseDown);
        canvas.addEventListener('mouseup', this.onMouseUp);

        document.body.addEventListener('keydown', this.onKeyDown);
        document.body.addEventListener('keyup', this.onKeyUp);
    },

    onMouseDown: function(event) {
        eventsManager.action['fire'] = true;
    },

    onMouseUp: function(event) {
        eventsManager.action['fire'] = false;
    },

    onKeyDown: function(event){
        
        let action = eventsManager.bind[event.keyCode];
        if(action){
            eventsManager.action[action] = true;
        }
    },

    onKeyUp: function (event){
        let action = eventsManager.bind[event.keyCode];
        if(action){
            eventsManager.action[action] = false;
        }
    }
}


