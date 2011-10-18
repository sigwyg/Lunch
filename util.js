var scroll = {
    leap: function(idname){
        if(navigator.userAgent.indexOf('iPhone') > -1) return;
        var start = util.info.getScrollPos();
        var obj = document.getElementById(idname);
        var goal = util.info.getElementPos(obj);
        
        var moveY = goal.y - start.y;
        var moveX = goal.x - start.x;

        var direction = new Object;
        direction.x = moveX > 0 ? 'plus' : 'minus'
        direction.y = moveY > 0 ? 'plus' : 'minus'

        var maxScroll = this.getMaxScroll();
        goal.x = goal.x > maxScroll.x ? maxScroll.x : goal.x;
        goal.y = goal.y > maxScroll.y ? maxScroll.y : goal.y;

        this.land(goal,direction);
        this.cancel();
    },

    land: function(goal,direction){
        var pos = util.info.getScrollPos();
        var arrive = new Object;
        arrive.x = direction.x == 'plus'
            ? Math.floor(pos.x + ((goal.x - pos.x) / 5)) + 1
            : arrive.x = Math.max(Math.floor(pos.x - (pos.x / 6)),goal.x);
        arrive.y = direction.y == 'plus'
            ? Math.floor(pos.y + ((goal.y - pos.y) / 5)) + 1
            : arrive.y = Math.max(Math.floor(pos.y - (pos.y / 6)),goal.y)

        scrollTo(arrive.x,arrive.y);

        if(direction.y == 'plus' && direction.x == 'plus') {
            if(arrive.y < goal.y || arrive.x < goal.x){
                this.timerID = setTimeout( function(){ scroll.land(goal,direction) },10);
            }
        }
        else if(direction.y == 'plus' && direction.x == 'minus') {
            if(arrive.y < goal.y || arrive.x != goal.x){
                this.timerID = setTimeout( function(){ scroll.land(goal,direction) },10);
            }
        }
        else if(direction.y == 'minus' && direction.x == 'plus') {
            if(arrive.y != goal.y || arrive.x < goal.x){
                this.timerID = setTimeout( function(){ scroll.land(goal,direction) },10);
            }
        }
        else if(direction.y == 'minus' && direction.x == 'minus') {
            if(arrive.y != goal.y || arrive.x != goal.x){
                this.timerID = setTimeout( function(){ scroll.land(goal,direction) },10);
            }
        }
        else {
        }
    },

    cancel: function(){
        util.event.add(document,'mousedown',function(){clearTimeout(scroll.timerID)},false);
        util.event.add(document,'keydown',function(){clearTimeout(scroll.timerID)},false);
        util.event.add(document,'mousewheel',function(){clearTimeout(scroll.timerID)},false);
        util.event.add(document,'DOMMouseScroll',function(){clearTimeout(scroll.timerID)},false);
    },

    getMaxScroll: function(){
        var scrSize = util.info.getScreenSize();
        var docSize = util.info.getDocSize();

        var maxScroll = new Object;
        maxScroll.x = docSize.x - scrSize.x;
        maxScroll.y = docSize.y - scrSize.y;
        
        return maxScroll;
    },

    hop: function(d){
        var direction = d == 'up' ? 'minus' : 'plus';
        var pos = util.info.getScrollPos();
        var scr = util.info.getScreenSize();
        
        var goal = new Object;
        goal.x = pos.x;
        goal.y = direction == 'plus' ? pos.y + scr.y : pos.y - scr.y;

        var maxScroll = this.getMaxScroll();
        goal.x = pos.x;
        goal.y = goal.y > maxScroll.y ? maxScroll.y : goal.y;

        this.land(goal,direction);
        this.cancel();
    }
}

var util = {};

util.browser = {
    isIE: !!(window.attachEvent && navigator.userAgent.indexOf('Opera') === -1),
    isOpera:  navigator.userAgent.indexOf('Opera') > -1,
    isWebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
    isGecko:  navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') === -1,
    isMobileSafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/),
    XPath: !!document.evaluate
}


util.event = {
    /* ------------------------------------------
     * add()
     *  - Set function to specified event
     *  - add(elm,evType,fn,useCapture);
     *      - elm        : event-target (object of DOM elements)
     *      - evType     : event-type (string without 'no' string) 
     *      - fn         : event-listener (object of javascript function)
     *      - useCapture : event-bubbling (boolean)
     *  ex.
     *    util.event.add(window,'load',func1,false);
    /* ------------------------------------------ */
    add: function(elm, evType, fn, useCapture){
        if (elm.addEventListener) {
            elm.addEventListener(evType, fn, useCapture);
            return true;
        }
        else if (elm.attachEvent) {
            var IEfn = function(e){
                if(!e) e = window.event;
                e.currentTarget = elm;
                if(Function.prototype.call)
                    fn.call(elm,e)
                else{
                    elm._currentHandler = fn;
                    elm._currentHandler(e);
                    elm._currentHandler = null;
                }
            }
            var r = elm.attachEvent('on' + evType, fn);
            return r;
        }
        else {
            elm['on' + evType] = fn;
        }
    }
};

util.info = {
    /* ------------------------------------------ *
     * getElementSize(elm)
     *  - require target objects
     *  - return objects = {
     *      x: width,
     *      y: height
     *    }
    /* ------------------------------------------ */
    getElementSize: function(elm) {
        var oSize = new Object();
        var elm2 = elm.cloneNode(true);
        
        if(-1 == navigator.userAgent.indexOf('MSIE 5')){
            elm2.style.padding = '0';
            elm2.style.border = '0';
        }
        elm2.style.display = 'block';
        elm2.style.position = 'absolute';
    
        elm.parentNode.appendChild(elm2);
        oSize.x = elm2.clientWidth;
        oSize.y = elm2.clientHeight;
        elm.parentNode.removeChild(elm2);
        
        return oSize;
    },

    /* ------------------------------------------ *
     * getElementPos(elm)
     *  - require target objects
     *  - return objects = {
     *      x: left-position,
     *      y: top-position
     *    }
    /* ------------------------------------------ */
    getElementPos: function(elem){
        var obj = new Object();
        obj.x = elem.offsetLeft;
        obj.y = elem.offsetTop;

        while(elem.offsetParent) {
            elem = elem.offsetParent;
            obj.x += elem.offsetLeft;
            obj.y += elem.offsetTop;
        }
        return obj;
    },

    /* ------------------------------------------ *
     * getScrollPos()
     *  - return objects = {
     *      x: scroll left,
     *      y: scroll top
     *    }
    /* ------------------------------------------ */
    getScrollPos: function(){
        var pos = new Object();
        pos.x = document.documentElement.scrollLeft || document.body.scrollLeft;
        pos.y = document.documentElement.scrollTop || document.body.scrollTop;
        return pos;
    },

    /* ------------------------------------------ *
     * getDocSize()
     *  - return objects = {
     *      x: document width,
     *      y: document height
     *    }
    /* ------------------------------------------ */
    getDocSize: function(){
        var doc = new Object;
        doc.x = document.documentElement.scrollWidth || document.body.scrollWidth;
        doc.y = document.documentElement.scrollHeight || document.body.scrollHeight;
        return doc;
    },

    /* ------------------------------------------ *
     * getScreenSize()
     *  - return objects = {
     *      x: window width,
     *      y: window height,
     *      mx: window mid-width,
     *      my: window mid-height
     *    }
    /* ------------------------------------------ */
    getScreenSize: function() {
        var isOpera = (navigator.userAgent.toLowerCase().indexOf('opera')+1?1:0);
        var isSafari = (navigator.appVersion.toLowerCase().indexOf('safari')+1?1:0);
        var obj = new Object();
        if (!isSafari && !isOpera) {
            obj.x = document.documentElement.clientWidth || document.body.clientWidth || document.body.scrollWidth;
            obj.y = document.documentElement.clientHeight || document.body.clientHeight || document.body.scrollHeight;
        } else {
            obj.x = window.innerWidth;
            obj.y = window.innerHeight;
        }
        obj.mx = parseInt((obj.x)/2);
        obj.my = parseInt((obj.y)/2);
        return obj;
    }
};

