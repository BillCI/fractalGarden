/**
 * Created by Bill on 4/29/14.
 */



var S = {
    debug: true,
    error_rate: 0.01,
    updatesPerFrame: 1000,
    canvas: {
        width: 100,
        height: 100,
        scale:1
    },
    actions: {
        length: 3,
        nothing: 0,
        move: 1,
        copy: 2
    },
    blank_color: {r:0,g:0,b:0,a:255},
    surrounding_blocks: [
        {x: -1,y:-1},
        {x:  0,y:-1},
        {x:  1,y:-1},
        {x:  1,y: 0},
        {x:  1,y: 1},
        {x:  0,y: 1},
        {x: -1,y: 1},
        {x: -1,y: 0}
    ],
    modes: {
        old_school: 'old school'
    },
    mode: 'old school'

};
var G = {

    update: function(x,y){
        x = M.normalize.x(x);
        y = M.normalize.y(y);
        cell = G.cells[M.xyToNumber(x,y)];

        if (S.mode === S.modes.old_school) {
            var sc = [0,0,0,0,0,0,0,0];
            var n_count = 0;
            for(var i = 0; i < 8; i++){
                sc[i] = G.cells[M.xyToNumber(x + S.surrounding_blocks[i].x,y + S.surrounding_blocks[i].y)];
                if(!(sc[i] === undefined)) {
                    n_count++;
                }
            } //end checking neighbors
            if(cell === undefined){
                if(n_count < 2) {
                    G.removeCell(x,y);
                } else if(n_count < 4) {
                    //live
                } else {
                    G.removeCell(x,y);
                }
            } else { //live cell
                if(n_count === 3){
                    G.addCell(x,y);
                }
            }
            if(n_count < 2){
                G.removeCell(x,y);
            } else if (n_count < 4 && cell === undefined) {

            }
        } // ------------ END OF OLD SCHOOL MODE --------------


    },
    pixel: function(x,y,c){
       x = M.normalize.x(x);
       y = M.normalize.y(y);
       var r = 4*(S.canvas.width * y + x)* S.canvas.scale;
       var g = r + 1;
       var b = r + 2;
       var a = r + 3;
       var ac = {r: null,g:null,b:null,a:null};
       if(c === undefined){
           //hold for a minute
       } else {
           for(var xx = S.canvas.scale-1; xx >= 0 ; xx--){
               for(var yy = S.canvas.scale-1; yy >= 0 ; yy--){
                   r = 4*(S.canvas.width * (y+yy) + (x+xx))* S.canvas.scale;
                   g = r + 1;
                   b = r + 2;
                   a = r + 3;

                   G.imgd.data[r] = Math.floor(c.r);
                   G.imgd.data[g] =  Math.floor(c.g);
                   G.imgd.data[b] =  Math.floor(c.b);
                   G.imgd.data[a] =  Math.floor(c.a);
               }
           }
       }
       ac.r = G.imgd.data[r];
       ac.g = G.imgd.data[g];
       ac.b = G.imgd.data[b];
       ac.a = G.imgd.data[a];
       return ac;
    },
    addCell: function(x,y,cell){
        if(cell === undefined){
            cell = new Cell();
        }
        G.cells[(S.canvas.width * y + x)] = cell;
        G.pixel(x,y,cell.color);
    },
    removeCell: function(x,y){
        G.cells[(S.canvas.width * y + x)] = undefined;
        G.pixel(x,y, S.blank_color);
    },
   imgd: null,
   cells: []
};
var M = {
    xyToNumber: function(x,y){
        return (S.canvas.width * y + x);
    },
    normalize: {
        x: function(x){
            if(x === undefined){
                x = M.random(0, S.canvas.width,true);
            }
            x = Math.floor(x) % S.canvas.width;
            if(x < 0){
                x = S.canvas.width-1;
            }
            return x;
        },
        y: function(y){
            if(y === undefined){
                y = M.random(0, S.canvas.width,true);
            }
            y = Math.floor(y) % S.canvas.height;
            if(y < 0){
                y = S.canvas.height-1;
            }
            return y;
        }
    },
    random: function(min,max,int){
        if(max === undefined){
            max = min;
            min = 0;
        }
        if(int === undefined){
            int = true;
        }
        var range = max - min;
        if(int){
            return Math.floor(Math.random()*range+min);
        }
        return Math.random()*range+min;
    },
    numberToBlocks: function(number,b,l) {
        var blocks = [];
        if(l === undefined){
            l = 8
        }
        if(b === undefined){
            b = 3;
        }
        while (number >= b){
            blocks.push (number % b);
            number = Math.floor(number/b);
        }
        blocks.push(number);
        while(blocks.length < l){
            blocks.push(0);
        }
        return blocks;
    },
    blocksToNumber: function(blocks,b){
        if(b === undefined){
            b = 3;
        }
        var number = 0;
        for (var i = 0; i < blocks.length;i++){
            number += blocks[i] * Math.pow(b,i);
        }
        return number;
    },
    mutateBlock: function(block,b){
        if(b === undefined){
            b = 3;
        }
        var Cblock = [];
        for(var i = 0; i < block.length;i++){
            if(Math.random() <= G.error_rate){
                Cblock.push(M.mutateNumber(block[i],b));
            } else {
                Cblock.push(block[i]);
            }
        }
        return Cblock;
    },
    mutateNumber: function(number,max){
        return Math.floor(number + M.random(1,max,true)) % max;
    },
    color_match: function(a,b){
        m = true;
        m = m && a.r === b.r;
        m = m && a.g === b.g;
        m = m && a.b === b.b;
        return m;
    },
    generateUUID: function(){
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x7|0x8)).toString(16);
        });
        return uuid;
    }
};
var D = {
    log: function(s){
        if(S.debug) {
            console.log((new Date().getTime()) + ": " + s);
        }
    }
};

var Rule = (function(){
    var _number;
    var _blocks;
    var _action;
    var _direction;
    //--------------------------------------------- constructor(s)
    function Rule(mother,father){

    }
    //--------------------------------------------- getters and setters
    Rule.prototype = {
        get blocks(){
            return this._blocks;
        },
        get action(){
            return this._action;
        },
        get direction(){
            return this._direction;
        }
    };
    Rule.prototype.match = function(other){
        var m = true;
        for(var i =0; i < this._blocks.length; i++){
            m = m && this._blocks[i] === other[i];
        }
        return m;
    };
    return Rule;
})();
var Cell = (function(){
    var _color;
    var _rules;
    var _energy;
    var _id;
    //--------------------------------------------- constructor(s)
    function Cell(mother,father){
        this._id = M.generateUUID();
        if(mother === undefined && father === undefined){ //new random
            this._color = {
                r: 128,//Math.floor(Math.random()*256),
                g: 0,//,Math.floor(Math.random()*256),
                b: 256,//Math.floor(Math.random()*256),
                a: 255
            };

        }
    }
    //--------------------------------------------- getters and setters
    Cell.prototype = {
        get rules(){
            return this._rules;
        },
        get color(){
            return this._color;
        },
        get energy(){
            return this._energy;
        },
        set energy(value){
            this._energy = value;
        }
    };
    Cell.prototype.id = function(){
        return this._id;
    };
    return Cell;
})();

//=============================================================================

var hasStarted = false;
var start = function(){
    S.canvas.element = document.getElementById("canvas");
    S.canvas.element.width = S.canvas.width * S.canvas.scale;
    S.canvas.element.height = S.canvas.height * S.canvas.scale;
    var ctx = S.canvas.element.getContext("2d");
    G.imgd = ctx.getImageData(0,0,S.canvas.width,S.canvas.height);


    for(var i = 0; i < 0.25 * (S.canvas.width* S.canvas.height);i++){
        addCell();
        //addCell(H_cell());
        //addCell(B_cell());
    }

    setInterval(function(){

        ////console.log((new Date().getTime())+": ---------- START UPDATE -------- ");
        for(var i = 0; i < S.updatesPerFrame; i++){
            var x = Math.floor(Math.random()* S.canvas.width);
            var y = Math.floor(Math.random()* S.canvas.height);
            G.update(x,y);
        }
        S.canvas.element.getContext("2d").putImageData(G.imgd,0,0);
    },100);
};

var addCell = function(cell){
    if(cell === undefined){
        cell = new Cell();
    }
    var x = Math.floor(Math.random()* S.canvas.width);
    var y = Math.floor(Math.random()* S.canvas.height);
    while(!(G.cells[(S.canvas.width * y + x)] === undefined)){
        x = Math.floor(Math.random()* S.canvas.width);
        y = Math.floor(Math.random()* S.canvas.height);
    }
    G.addCell(x,y,cell);
};
