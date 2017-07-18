(function(win, doc, undefined) {

    Array.prototype.until = function(func) {
        let len = this.length;
        let i;
        let current;

        for (i = 0; i < len; i++) {
            current = this[i];
            if (func(current)) return true;
        }

        return false;
    };

    Function.prototype.timeout = function(timeout) {
        win.setTimeout(this, timeout);
    };

    var self = this;

    self.executeTimes = function(beforeFunc, func, afterFunc, times, delay) {
        beforeFunc();
        let counter = 0;
        func(counter);
        counter++;
        let interval = win.setInterval(function() {
            func(counter);
            counter++;
            if (counter === times) {
                win.clearInterval(interval);
                if (afterFunc) afterFunc();
            }
        }, delay);
    };

    self.select = function(all) {
        all = !!all;

        if (all) {
            return function(selector) {
                if (selector.startsWith('#')) return doc.getElementById(selector.substring(1, selector.length));
                else if (selector.startsWith('.')) return doc.getElementsByClassName(selector.substring(1, selector.length));
                else return doc.querySelectorAll(selector);
            }
        }

        else {
            return function(selector) {
                if (selector.startsWith('#')) return doc.getElementById(selector.substring(1, selector.length));
                else if (selector.startsWith('.')) {
                    var els = doc.getElementsByClassName(selector.substring(1, selector.length));
                    return els.length === 0 ? null : els[0];
                }
                else return doc.querySelector(selector);
            }
        }
    };

    //http://stackoverflow.com/a/27078401/1701316
    // Returns a function, that, when invoked, will only be triggered at most once
    // during a given window of time. Normally, the throttled function will run
    // as much as it can, without ever going more than once per `wait` duration;
    // but if you'd like to disable the execution on the leading edge, pass
    // `{leading: false}`. To disable execution on the trailing edge, ditto.
    self.throttle = function(func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        if (!options) options = {};
        var later = function() {
            previous = options.leading === false ? 0 : Date.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };
        return function() {
            var now = Date.now();
            if (!previous && options.leading === false) previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
            } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };

    win.funcs = {
        executeTimes: self.executeTimes,
        select: self.select(false),
        selectAll: self.select(true),
        throttle: self.throttle
    };
})(window, document);