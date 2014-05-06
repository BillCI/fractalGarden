Math.DNA = {
    numberToDigits: function(number,base){
        var digits = [];
        if(base === undefined){
            base = 2;
        }
        while (number >= base){
            digits.push (number % base);
            number = Math.floor(number/base);
        }
        digits.push(number);

        return digits;
    },
    digitsToNumber: function(digits,base){
        var number = 0;
        if(base === undefined){
            base = 2;
        }
        for(var i = 0; i < digits.length;i++){
            number +=  digits[i] * Math.pow(base,i);
        }
        return number;
    },
    generateUUID: function(){
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x7|0x8)).toString(16);
        });
        return uuid;
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
    }
};