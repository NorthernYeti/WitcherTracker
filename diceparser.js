var DEFAULT_DICE = '1d6';
var DEFAULT_FACES = 6;
var DEFAULT_SEPARATOR = 'D';
var defaulOptions = {
    separator: DEFAULT_SEPARATOR,
    defaultFaces: DEFAULT_FACES,
};

function rollDice(str, _a) {
    if (str === void 0) { str = DEFAULT_DICE; }
    var _b = _a === void 0 ? defaulOptions : _a, _c = _b.separator, separator = _c === void 0 ? 'd' : _c, _d = _b.defaultFaces, defaultFaces = _d === void 0 ? 6 : _d;
    var tokenizedString = Array.from(str.toLowerCase());
    var sum = 0;
    var multiplier = 0;
    var currentNumber = '';
    var diceArray = [];
    var rollOrAdd = function (num) {
        if (multiplier) {
            var dice = num || defaultFaces;
            for (var i = 0; i < multiplier; i++) {
                var result = Math.ceil(Math.random() * dice);
                sum += result;
                diceArray.push({
                    die: "".concat(separator.toUpperCase()).concat(dice),
                    result: result,
                });
            }
        }
        if (!multiplier) {
            sum += num;
        }
    };
    tokenizedString.forEach(function (c) {
        var isNumber = !isNaN(c);
        if (c === ' ') {
        }
        else if (c === '+') {
            rollOrAdd(parseInt(currentNumber, 10));
            multiplier = 0;
            currentNumber = '';
        }
        else if (c === separator.toLowerCase()) {
            multiplier = currentNumber.length ? parseInt(currentNumber, 10) : 1;
            currentNumber = '';
        }
        else if (isNumber) {
            currentNumber += c;
        }
        else {
            throw new Error("Unknown character in dice string \"".concat(str, "\". Please use only numbers, \"+\" and \"").concat(separator, "\""));
        }
    });
    rollOrAdd(parseInt(currentNumber, 10));
    return {
        sum: sum,
        dice: diceArray,
    };
};
