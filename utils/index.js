const ms = require('ms');

module.exports = {
    sleep: ms => new Promise(resolve => setTimeout(resolve, ms)),

    msToTime(duration) {
        let seconds = parseInt((duration / 1000) % 60);
        let minutes = parseInt((duration / (1000 * 60)) % 60);

        minutes = minutes;
        seconds = seconds;

        if (minutes === 0) minutes = '00';
        if (minutes > 0 && minutes < 10) minutes = `0${minutes}`

        if (seconds === 0) seconds = '00';
        if (seconds > 0 && seconds < 10) seconds = `0${seconds}`

        return `${minutes}:${seconds}`;
    },

    getTime(args) {
        if (!Array.isArray(args)) args = [args];

        const timedArgs = [];

        for (let arg of args) {
            arg = arg.toString();
            const separated = arg.replace(/\'/g, '').split(/(\d+)/).filter(Boolean);
            for (let i = 0; i < separated.length; i++) {
                const sepa = separated[i];
                const sepaPlus = separated[i + 1];

                if (sepaPlus)
                    timedArgs.push(sepa + sepaPlus);
                else
                    timedArgs.push(sepa + 's');
                i++;
            }
        }

        let time = 0;
        for (tArg of timedArgs) {
            const number = this.returnNumber(tArg);
            if (!number) continue;
            if (number > 3600) continue;

            if (tArg.includes('j')) time = time + ms(`${number}d`);
            else if (tArg.includes('d')) time = time + ms(`${number}d`);
            else if (tArg.includes('h')) time = time + ms(`${number}h`);
            else if (tArg.includes('m')) time = time + ms(`${number}m`);
            else if (tArg.includes('s')) time = time + ms(`${number}s`);
            else time = time + ms(`${number}s`);
        }

        return time;
    },

    returnNumber(string) {
        const num = string.replace(/[^0-9]/g, '');
        return parseInt(num, 10);
    },

    prettyMs(milliseconds, options = {}) {
        if (!Number.isFinite(milliseconds)) {
            throw new TypeError('Erreur');
        }

        if (options.colonNotation) {
            options.compact = false;
            options.formatSubMilliseconds = false;
            options.separateMilliseconds = false;
            options.verbose = false;
        }

        if (options.compact) {
            options.secondsDecimalDigits = 0;
            options.millisecondsDecimalDigits = 0;
        }

        const result = [];

        const floorDecimals = (value, decimalDigits) => {
            const flooredInterimValue = Math.floor((value * (10 ** decimalDigits)) + 0.0000001);
            const flooredValue = Math.round(flooredInterimValue) / (10 ** decimalDigits);
            return flooredValue.toFixed(decimalDigits);
        };

        const add = (value, long, short, valueString) => {
            if ((result.length === 0 || !options.colonNotation) && value === 0 && !(options.colonNotation && short === 'm')) return;

            valueString = (valueString || value.toFixed(0) || '0').toString();
            let prefix;
            let suffix;
            if (options.colonNotation) {
                prefix = result.length > 0 ? ':' : '';
                suffix = '';
                const wholeDigits = valueString.includes('.') ? valueString.split('.')[0].length : valueString.length;
                const minLength = result.length > 0 ? 2 : 1;
                valueString = '0'.repeat(Math.max(0, minLength - wholeDigits)) + valueString;
            } else {
                prefix = '';
                suffix = options.verbose ? ' ' + this.pluralize(long, value) : short;
            }

            if (valueString === '1' && options.verbose) {
                if (long === 'seconde') valueString = 'une'
                if (long === 'minute') valueString = 'une'
                if (long === 'heure') valueString = 'une'
                if (long === 'jour') valueString = 'un'
                if (long === 'an') valueString = 'un'
            }

            if (long.includes('seconde') && parseInt(valueString) < 20 && options.verbose) valueString = 'quelques';

            result.push(prefix + valueString + suffix);
        };

        const parsed = require('parse-ms')(milliseconds);

        add(Math.trunc(parsed.days / 365), 'an', 'y');
        add(parsed.days % 365, 'jour', 'j');
        add(parsed.hours, 'heure', 'h');
        add(parsed.minutes, 'minute', 'm');

        if (
            options.separateMilliseconds ||
            options.formatSubMilliseconds ||
            (!options.colonNotation && milliseconds < 1000)
        ) {
            add(parsed.seconds, 'seconde', 's');
            const millisecondsAndBelow =
                parsed.milliseconds +
                (parsed.microseconds / 1000) +
                (parsed.nanoseconds / 1e6);

            const millisecondsDecimalDigits =
                typeof options.millisecondsDecimalDigits === 'number' ?
                    options.millisecondsDecimalDigits :
                    0;

            const roundedMiliseconds = millisecondsAndBelow >= 1 ?
                Math.round(millisecondsAndBelow) :
                Math.ceil(millisecondsAndBelow);

            const millisecondsString = millisecondsDecimalDigits ?
                millisecondsAndBelow.toFixed(millisecondsDecimalDigits) :
                roundedMiliseconds;

            add(
                Number.parseFloat(millisecondsString, 10),
                'millisecond',
                'ms',
                millisecondsString
            );

        } else {
            const seconds = (milliseconds / 1000) % 60;
            const secondsDecimalDigits =
                typeof options.secondsDecimalDigits === 'number' ?
                    options.secondsDecimalDigits :
                    1;
            const secondsFixed = floorDecimals(seconds, secondsDecimalDigits);
            const secondsString = options.keepDecimalsOnWholeSeconds ?
                secondsFixed :
                secondsFixed.replace(/\.0+$/, '');
            add(Number.parseFloat(secondsString, 10), 'seconde', 's', secondsString);
        }

        if (result.length === 0) {
            return '0' + (options.verbose ? ' milliseconds' : 'ms');
        }


        if (result.length > 1)
            return result.slice(0, 2).join(' et ');
        else 
            return result[0];


        return options.colonNotation ? result.join('') : result.join(' ');
    },


    convertChunk(arr, size) {
        const array = [];
        for (let i = 0; i < arr.length; i += size) {
            array.push(arr.slice(i, i + size))
        }
        return array;
    }
}