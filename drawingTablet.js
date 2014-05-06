var Tablet = {
    settings: {
        width: 100,
        height: 100,
        scale: {x:1,y:1},
        frameRate: 10,
        canvas_id: 'DrawingTable',
        background_color: 'WHITE'
    },
    update: function(){

    },
    start: function(){

    },
    pixel: function(x,y,obj){
        //sanitize x,y
        x = Tablet.helpers.sanitize.x(x);
        y = Tablet.helpers.sanitize.y(y);
        //sanitize obj
        obj = Tablet.helpers.sanitize.obj(obj);
        //zero local
        index = Tablet.helpers.sanitize.index(y*Tablet.settings.width+x);

        if(!(obj === undefined)){
            Tablet.data.grid[index] = obj;

            //now the color
            for(var xi = 0; xi < Tablet.settings.scale.x;xi++){
                for(yi =0; yi < Tablet.settings.scale.y;yi++){
                    var xx = (x+xi)*Tablet.settings.scale.x;
                    var yy = (y+yi)*Tablet.settings.scale.y;
                    var r = Math.floor((Tablet.settings.width * yy + xx)*4);
                    var g = r + 1;
                    var b = r + 2;
                    var a = r + 3;
                    Tablet.data.imgd.data[r] = obj.color.r;
                    Tablet.data.imgd.data[g] = obj.color.g;
                    Tablet.data.imgd.data[b] = obj.color.b;
                    Tablet.data.imgd.data[a] = obj.color.a;
                }
            }
        }

        current_obj = Tablet.data.grid[index];
        return current_obj;
    },
    data: {
        grid: [],
        imgd: null
    },
    helpers:{
        sanitize:{
            x: function(x){
                if(x === undefined){
                    x = Math.DNA.random(0,Tablet.settings.width);
                }
                x = Math.floor(x + Tablet.settings.width) % Tablet.settings.width;
                return x;
            },
            y: function(y){
                if(y === undefined){
                    y = Math.DNA.random(0,Tablet.settings.height);
                }
                y = Math.floor(y + Tablet.settings.height) % Tablet.settings.height;
                return y;
            },
            obj: function(obj){
                if(obj === undefined){

                } else if (obj instanceof Color){
                    obj = {
                        color: obj
                    };
                } else if (obj.color === undefined){
                    obj.color = Color[Tablet.settings.background_color]();
                } else if (!(obj.color instanceof Color)){
                    obj.color = Color[Tablet.settings.background_color]();
                }
                return obj;
            },
            index: function(index){
                if(index === undefined){
                    index = Math.DNA.random(0,(Tablet.settings.height*Tablet.settings.width));
                }
                index = Math.floor(index+(Tablet.settings.height*Tablet.settings.width)) % (Tablet.settings.height*Tablet.settings.width);
                return index;
            }
        },
        build_index_set: function(x,y){
            x = Tablet.helpers.sanitize.x(x);
            y = Tablet.helpers.sanitize.y(y);
            indexes = {
                center: {
                    index: Tablet.helpers.sanitize.index(y*Tablet.settings.width+x),
                    x: x,
                    y: y
                },
                north: {
                    index: Tablet.helpers.sanitize.index((y-1)*Tablet.settings.width+x),
                    x: Tablet.helpers.sanitize.y(x),
                    y: Tablet.helpers.sanitize.y(y-1)
                },
                north_east:{
                    index: Tablet.helpers.sanitize.index((y-1)*Tablet.settings.width+(x+1)),
                    x: Tablet.helpers.sanitize.y(x+1),
                    y: Tablet.helpers.sanitize.y(y-1)
                },
                east: {
                    index: Tablet.helpers.sanitize.index((y-0)*Tablet.settings.width+(x+1)),
                    x: Tablet.helpers.sanitize.y(x+1),
                    y: Tablet.helpers.sanitize.y(y-0)
                },
                south_east: {
                    index: Tablet.helpers.sanitize.index((y+1)*Tablet.settings.width+(x+1)),
                    x: Tablet.helpers.sanitize.y(x+1),
                    y: Tablet.helpers.sanitize.y(y-1)
                },
                south: {
                    index: Tablet.helpers.sanitize.index((y+1)*Tablet.settings.width+(x+0)),
                    x: Tablet.helpers.sanitize.y(x+0),
                    y: Tablet.helpers.sanitize.y(y-1)
                },
                south_west:{
                    index: Tablet.helpers.sanitize.index((y+1)*Tablet.settings.width+(x-1)),
                    x: Tablet.helpers.sanitize.y(x-1),
                    y: Tablet.helpers.sanitize.y(y+1)
                },
                west: {
                    index: Tablet.helpers.sanitize.index((y-0)*Tablet.settings.width+(x-1)),
                    x: Tablet.helpers.sanitize.y(x-1),
                    y: Tablet.helpers.sanitize.y(y-0)
                },
                north_west: {
                    index: Tablet.helpers.sanitize.index((y-1)*Tablet.settings.width+(x-1)),
                    x: Tablet.helpers.sanitize.y(x-1),
                    y: Tablet.helpers.sanitize.y(y-1)
                }
            };
            return indexes;
        }
    }

};


var Color = (function(){
    //--------------------------------------------- variables

    var _r;
    var _g;
    var _b;
    var _a;

    //--------------------------------------------- constructor(s)
    function Color(r,g,b,a){
        if(a === undefined){
            a = 255;
        }
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;

    }

    //--------------------------------------------- getters and setters
    Color.prototype = {
        get r(){
            return this._r;
        },
        set r(value){
            this._r = Color.safeNumber(value);
        },
        get red(){
            return this._r;
        },
        set red(value){
            this._r = Color.safeNumber(value);
        },
        get g(){
            return this._g;
        },
        set g(value){
            this._g = Color.safeNumber(value);
        },
        get green(){
            return this._g;
        },
        set green(value){
            this._g = Color.safeNumber(value);
        },
        get b(){
            return this._b;
        },
        set b(value){
            this._b = Color.safeNumber(value);
        },
        get blue(){
            return this._b;
        },
        set blue(value){
            this._b = Color.safeNumber(value);
        },
        get a(){
            return this._a;
        },
        set a(value){
            this._a = Color.safeNumber(value);
        },
        get alpha(){
            return this._a;
        },
        set alpha(value){
            this._a = Color.safeNumber(value);
        }

    };
    //---------------------------------------------- helpers
    Color.safeNumber = function(value){
        if(value === undefined){
            value = 0;
        } else if((typeof value) === 'number') {
            value = Math.floor(Math.max(0,Math.min(255,value)));
        } else if((typeof  value) === 'string') {
            value = 0;
        }
        return value;
    };

    //---------------------------------------------- color prephabs
    Color.BLACK = function(){
        return new Color(0,0,0);
    };
    Color.RED = function(){
        return new Color(255,0,0);
    };
    Color.GREEN = function(){
        return new Color(0,255,0);
    };
    Color.BLUE = function(){
        return new Color(0,0,255)
    };
    Color.WHITE = function(){
        return new Color(255,255,255);
    };
    Color.addPrefab = function(colorName,color){
        if(Color[colorName] === undefined){
            Color[colorName] = function(){
                return new Color(color.r,color.g,color.b,color.a);
            }
        } else {
            console.log('Color.'+colorName+'() already exists please chose a different name for that color or set it to undefined before adding it again');
        }
    };


    return Color;
})();
