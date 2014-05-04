/**
 * Created by Bill on 4/29/14.
 */

var G = {
    canvas: {
        width:100,
        height:100,
        element:null
    },
    bmp: {
        pixel: function(x,y,c) {
            x = Math.floor(x) % G.canvas.width;
            if(x < 0){
                x = G.canvas.width-1;
            }
            y = Math.floor(y) % G.canvas.height;
            if(y < 0){
                y = G.canvas.height-1;
            }
           // //console.log('\tx = '+x+'\n\ty = '+y);
            var r = 4*(G.canvas.width * y + x);
            ////console.log('\tx = '+x+'\n\ty = '+y + '\n\t -> '+r);
            var g = r + 1;
            var b = r + 2;
            var a = r + 3;
            var ac = {r: null,g:null,b:null,a:null};
            if(c === undefined){
                //hold for a minute
            } else {
                G.bmp.imgd.data[r] = Math.floor(c.r);
                G.bmp.imgd.data[g] =  Math.floor(c.g);
                G.bmp.imgd.data[b] =  Math.floor(c.b);
                G.bmp.imgd.data[a] =  Math.floor(c.a);
            }
            ac.r = G.bmp.imgd.data[r];
            ac.g = G.bmp.imgd.data[g];
            ac.b = G.bmp.imgd.data[b];
            ac.a = G.bmp.imgd.data[a];
            return ac;
        },
        imgd: null
    },
    radius: {
        min: 5,
        max: 5
    },
    angle: {
        min: 5/180 * Math.PI,
        max: 360/180 * Math.PI
    },
    random: function(min,max){
        var range = max - min;
        return Math.random()*range+min;
    },
    actions: {
        length: 3,
        nothing: 0,
        move: 1,
        copy: 2
    },
    calculateBlocks: function(number,b,l) {
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
    calculateNumber: function(blocks,b){
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
                Cblock.push((block[i] + Math.floor(1+Math.random()*(b-1)))%b);
            } else {
                Cblock.push(block[i]);
            }
        }
        return Cblock;
    },
    error_rate: 0.01,
    max_rules:10,
    blank_color: {r:0,g:0,b:0,a:255},
    souranding_blocks: [
        {x: -1,y:-1},
        {x:  0,y:-1},
        {x:  1,y:-1},
        {x:  1,y: 0},
        {x:  1,y: 1},
        {x:  0,y: 1},
        {x: -1,y: 1},
        {x: -1,y: 0}
    ],
    color_match: function(a,b){
        ////console.log("a = "+ a.r + ', '+ a.g +', '+ a.b);
        ////console.log("b = "+ b.r + ', '+ b.g +', '+ b.b);
        m = true;
        m = m && a.r === b.r;
        m = m && a.g === b.g;
        m = m && a.b === b.b;
        //m = m && a.a === b.a;
        ////console.log(m);
        return m;
    },
    cells: [],
    update: function(x,y){

        if(x === undefined){
            x = Math.floor(Math.random()*G.canvas.width);
        }
        if(y === undefined) {
            y = Math.floor(Math.random()*G.canvas.height);
        }
        var cell = G.cells[(G.canvas.width * y + x)];

        if(cell === undefined){
            //do nothing
        } else {
            //console.log((new Date().getTime())+": found cell.");
            ////console.log('actual cell');
            blocks = [0,0,0,0,0,0,0,0];
            var e = 0;
            for(var i =0; i < blocks.length;i++){
                blocks[i] = G.bmp.pixel(x+G.souranding_blocks[i].x,y+G.souranding_blocks[i].y);
                ////console.log('x = '+(x+G.souranding_blocks[i].x)+'\ny = '+(y+G.souranding_blocks[i].y) +
                //'\ncolor = '+ blocks[i]);
               // //console.log(i + ') matching');
                if(G.color_match( blocks[i], cell.color)) {
                    blocks[i] = 1;
                } else if (G.color_match( blocks[i], G.blank_color)) {
                    blocks[i] = 0;
                    e++;
                } else {
                    blocks[i] = 2;
                }
            }
            //console.log((new Date().getTime())+": blocks =  "+blocks);
            //give the cell some energy
            cell.energy += e;
            var noAction = true;
            //now we have the rule to match
            for(var i=0; i < cell.rules.length; i++){
                if(cell.rules[i].match(blocks)){
                    noAction = false;
                    //hit
                    if(cell.rules[i].action == G.actions.nothing){
                        //do nothing
                        cell.energy -= e;
                    } else if(cell.rules[i].action == G.actions.move){
                        //console.log((new Date().getTime())+": cell "+cell.id()+" moved.");
                        cell.energy -= 1;
                        var destination_pixel = G.bmp.pixel(x+G.souranding_blocks[cell.rules[i].action].x,y+G.souranding_blocks[cell.rules[i].action].y);
                        if(G.color_match(destination_pixel, G.blank_color)){
                            G.removeCell(x,y);
                            G.addCell(x+G.souranding_blocks[cell.rules[i].action].x,y+G.souranding_blocks[cell.rules[i].action].y,cell);
                        } else {
                            cellPlace = (x+G.souranding_blocks[cell.rules[i].action].x)+(G.canvas.width *(y+G.souranding_blocks[cell.rules[i].action].y));
                            otherCell = G.cells[cellPlace];
                            if(otherCell === undefined){
                                //console.log("BOOK KEEPING MISTAKE");
                            } else {
                                if(cell.energy > otherCell.energy){
                                    G.removeCell(x,y);
                                    G.addCell(x+G.souranding_blocks[cell.rules[i].action].x,y+G.souranding_blocks[cell.rules[i].action].y,cell);
                                } else {
                                    G.removeCell(x,y);
                                    break;
                                }
                            }
                        }
                    } else if (cell.rules[i].action == G.actions.copy){
                        //console.log((new Date().getTime())+": cell "+cell.id()+" copied.");
                        cell.energy -= 2;
                        cellPlace = (x+G.souranding_blocks[cell.rules[i].action].x)+(G.canvas.width *(y+G.souranding_blocks[cell.rules[i].action].y));
                        otherCell = G.cells[cellPlace];
                        if(otherCell === undefined){
                            var newCell = new Cell(cell);
                            G.addCell(x+G.souranding_blocks[cell.rules[i].action].x,y+G.souranding_blocks[cell.rules[i].action].y,newCell);
                        } else {
                            if(cell.energy > otherCell.energy){
                                var newCell = new Cell(cell);
                                G.addCell(x+G.souranding_blocks[cell.rules[i].action].x,y+G.souranding_blocks[cell.rules[i].action].y,newCell);
                            } else {
                                G.removeCell(x,y);
                                break;
                            }
                        }
                    } //end coppy
                } // end match
            } // end loop
            if(cell.energy < 0 ){
                //console.log((new Date().getTime())+": cell "+cell.id()+" Died.");
                G.removeCell(x,y);
            }
        } //end have cell
    }, //end update function
    cellsPerUpdate: 1000,
    addCell: function(x,y,cell){
        G.cells[(G.canvas.width * y + x)] = cell;
        G.bmp.pixel(x,y,cell.color);

    },
    removeCell: function(x,y){
        G.cells[(G.canvas.width * y + x)] = undefined;
        G.bmp.pixel(x,y, G.blank_color);
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
var Rule = (function(){
    var _number;
    var _blocks;
    var _action;
    var _direction;
    //--------------------------------------------- constructor(s)
    function Rule(mother,father){
        this._energy = 0;
        if(mother === undefined && father === undefined){ //new random
            this._number =  Math.floor(Math.random()*19683);
            this._action = Math.floor(Math.random()* G.actions.length);
            this._blocks = G.calculateBlocks(this._number);
            this._direction = Math.floor(Math.random()*8);
        } else if(father === undefined) {
            this._blocks = G.mutateBlock(mother.blocks,3);
            this._number = G.calculateNumber(this._blocks);
            if(Math.random() <= G.error_rate){
                this._action = (mother.action + Math.floor(1+Math.random()*(G.actions.length-1))) % G.actions.length;
            } else {
                this._action = mother.action;
            }
            if(Math.random() <= G.error_rate){
                this._direction = (mother.direction + Math.floor(1+Math.random()*6)) % 8
            } else {
                this._direction = mother.direction;
            }
        }
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
        this._id = G.generateUUID();
        if(mother === undefined && father === undefined){ //new random
            this._color = {
                r: Math.floor(Math.random()*256),
                g: Math.floor(Math.random()*256),
                b: Math.floor(Math.random()*256),
                a: 255
            };
            this._rules = [];
            var numberOfRules = Math.floor(Math.random()* G.max_rules) + 1;
            for(var i = 0; i < numberOfRules; i++){
                this._rules.push(new Rule());
            }
        } else if(father === undefined) {
            this._color = {
                r: G.calculateNumber(G.mutateBlock(G.calculateBlocks(mother.color.r,2),2),2),
                g: G.calculateNumber(G.mutateBlock(G.calculateBlocks(mother.color.g,2),2),2),
                b: G.calculateNumber(G.mutateBlock(G.calculateBlocks(mother.color.b,2),2),2),
                a:255
            };
            numberOfRules = mother.rules.length;
            if(Math.random() <= G.error_rate){
                if(Math.random() >= (numberOfRules-1)/ G.max_rules){
                    numberOfRules++;
                } else {
                    numberOfRules--;
                }
            }
            this._rules = [];
            if(numberOfRules < mother.rules.length){
                this._rules.push(new Rule());
            }
            for(i =0; this._rules.length < numberOfRules; i++){
                this._rules.push(new Rule(mother.rules[i]));
            }
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
var Arch = (function(){
    //private variables
    var _center;
    var _r;
    var _a;
    var _color;

    //--------------------------------------------- constructor(s)
    function Arch(){
        this._center = {x: G.random(0, G.canvas.width), y: G.random(0, G.canvas.height)};
        this._r = {min: G.random(G.radius.min, G.radius.max),max: G.random(G.radius.min, G.radius.max)};
        this._a = {min: G.random(G.angle.min, G.angle.max),max:G.random(G.angle.min, G.angle.max)};
        this._color = {r:0,g:0,b:0,a:255}
    };
    //--------------------------------------------- getters and setters
    Arch.prototype = {
        get center(){
            return this._center;
        },
        set center(value){
            this._center = value;
        },
        get r(){
            return this._r;
        },
        set r(value){
            this._r = value;
        },
        get a(){
            return a;
        },
        set a(value) {
            this.a = value;
        }
    };
    Arch.prototype.draw = function(){
        //console.log("debug - " + Math.floor(this._a.min*57.2957795) + ' -> ' + Math.floor(this._a.max*57.2957795) +
        //         '\n       - ' + this._r.min + ' -> '+this._r.max);
        var min = this._r.min * Math.cos(this._a.min);
        var max = this._r.min * Math.cos(this._a.max);
        var dir = (max - min)/Math.abs(max-min);
        var last = {x: min,
                    y: this._r.min * Math.sin(this._a.min)};
        for(var x = min; x <= max; x+= dir){
            var p = (x-min) / (max-min);
            var a = this._a.min * (1-p) + this._a.max * p;
            var r = this._r.min * (1-p) + this._r.max * (p);
            var y = r * Math.sin(a);
            var s = (y-last.y)/(x-last.x);
            if(s === NaN){s=0;}
            var c = s * x - y;
            //console.log("in like flin");
            for(var xx = last.x; xx <= x; xx++){
                var  yy = s * xx + c;
                G.bmp.pixel(this._center.x + xx
                    ,this._center.y + yy
                    ,this._color);
            }
            last.x = x;
            last.y = y;

        }


    };
    return Arch;
})();
var hasStarted = false;
var start = function(){
    G.canvas.element = document.getElementById("canvas");
    G.canvas.element.width = G.canvas.width;
    G.canvas.element.height = G.canvas.height;
    var ctx = G.canvas.element.getContext("2d");
    G.bmp.imgd = ctx.getImageData(0,0,G.canvas.width,G.canvas.height);


    for(var i = 0; i < 0.01 * (G.canvas.width* G.canvas.height);i++){
        //addCell(H_cell());
        addCell(B_cell());
    }

    setInterval(function(){

        ////console.log((new Date().getTime())+": ---------- START UPDATE -------- ");
        for(var i = 0; i < G.cellsPerUpdate; i++){
            var x = Math.floor(Math.random()* G.canvas.width);
            var y = Math.floor(Math.random()* G.canvas.height);
            G.update(x,y);
        }
        G.canvas.element.getContext("2d").putImageData(G.bmp.imgd,0,0);
    },10);
};
G.cellsPerUpdate = 0;
var addCell = function(cell){
    if(cell === undefined){
        cell = new Cell();

    }
    var x = Math.floor(Math.random()* G.canvas.width);
    var y = Math.floor(Math.random()* G.canvas.height);
    while(!(G.cells[(G.canvas.width * y + x)] === undefined)){
        x = Math.floor(Math.random()* G.canvas.width);
        y = Math.floor(Math.random()* G.canvas.height);
    }
    G.addCell(x,y,cell);

};
var newArch = function(){
    if (hasStarted  === false) {
        start();
        hasStarted = true;
    }
    a = new Arch();
    a.draw();

};
var c = {r:0,g:0,b:0,a:255};

var H_cell = function(){
    var cell = new Cell();
    cell._color.r = 255;
    cell._color.g = 0;
    cell._color.b = 0;
    cell._rules = [];
    var r = new Rule();
    r._number = 0;
    r._blocks = G.calculateBlocks(r._number);
    r._action = G.actions.copy;
    r._direction = 2;
    cell._rules.push(r);
    r = new Rule();
    r._number = 9;
    r._blocks = G.calculateBlocks(r._number);
    r._action = G.actions.move;
    r._direction = 5;
    cell._rules.push(r);

    return cell
};
var A_cell = function(){
    var cell = new Cell();
    cell._color.r = 0;
    cell._color.g = 255;
    cell._color.b = 0;
    cell._rules = [];

    var r = new Rule();
    r._blocks =[0,0,0,0,0,0,0,0];
    r._number = G.calculateNumber(r._blocks);
    r._action = G.actions.copy;
    r._direction = 1;
    cell._rules.push(r);

    r = new Rule();
    r._blocks = [0,1,0,0,0,0,0,0];
    r._number = G.calculateNumber(r._blocks);
    r._action = G.actions.move;
    r._direction = 5;
    cell._rules.push(r);

    r = new Rule();
    r._blocks = [0,0,1,0,0,0,0,0];
    r._number = G.calculateNumber(r._blocks);
    r._action = G.actions.move;
    r._direction = 5;
    cell._rules.push(r);

    return cell
};
var B_cell = function(){
    var cell = new Cell();
    cell._color.r = 0;
    cell._color.g = 0;
    cell._color.b = 255;
    cell._rules = [];

    var r = new Rule();
    r._blocks =[0,0,0,0,0,0,0,0];
    r._number = G.calculateNumber(r._blocks);
    r._action = G.actions.copy;
    r._direction = 1;
    cell._rules.push(r);

    r = new Rule();
    r._blocks = [0,1,0,0,0,0,0,0];
    r._number = G.calculateNumber(r._blocks);
    r._action = G.actions.move;
    r._direction = 5;
    cell._rules.push(r);

    r = new Rule();
    r._blocks = [1,0,0,0,0,0,0,0];
    r._number = G.calculateNumber(r._blocks);
    r._action = G.actions.move;
    r._direction = 5;
    cell._rules.push(r);

    r = new Rule();
    r._blocks = [0,0,1,0,0,0,0,0];
    r._number = G.calculateNumber(r._blocks);
    r._action = G.actions.move;
    r._direction = 5;
    cell._rules.push(r);

    r = new Rule();
    r._blocks = [1,1,0,0,0,0,0,0];
    r._number = G.calculateNumber(r._blocks);
    r._action = G.actions.move;
    r._direction = 5;
    cell._rules.push(r);

    r = new Rule();
    r._blocks = [1,0,1,0,0,0,0,0];
    r._number = G.calculateNumber(r._blocks);
    r._action = G.actions.move;
    r._direction = 5;
    cell._rules.push(r);

    r = new Rule();
    r._blocks = [0,1,1,0,0,0,0,0];
    r._number = G.calculateNumber(r._blocks);
    r._action = G.actions.move;
    r._direction = 5;
    cell._rules.push(r);

    r = new Rule();
    r._blocks = [1,1,1,0,0,0,0,0];
    r._number = G.calculateNumber(r._blocks);
    r._action = G.actions.move;
    r._direction = 5;
    cell._rules.push(r);


    return cell
};
