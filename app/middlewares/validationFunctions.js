module.exports = function isSpecialChar(str) {
    str = str.toString();

    for (let s of str) {
        if (!isNumber(s) && !isAlphabet(s) && !isWhiteSpace(s)) {
            return true;
        }
    }

    return false;
};

function isNumber(str) {
    str = str.toString();
    for (let n of str) {
        if (n.charCodeAt() < 48 || n.charCodeAt() > 57) {
            return false;
        }
    };

    return true;
};

function isAlphabet(str) {
    str = str.toString();

    for (let c of str) {
        if (!(c.charCodeAt() >= 97 && c.charCodeAt() <= 122) && !(c.charCodeAt() >= 65 && c.charCodeAt() <= 90)) {
            return false;
        }
    };

    return true;
};

function isWhiteSpace(str) {
    str = str.toString();

    for (let c of str) {
        if (c.charCodeAt() === 32) {
            return true;
        }
    };

    return false;
};


let password = 'pass@12345';

let isValidated = validateLength(password, {
    min: 6,
    max: 10
})

console.log(isValidated)

function validateLength(val, constraint) {
    let {
        min,
        max,
        gt,
        lt,
        gte,
        lte,
        eq
    } = constraint;

    if (min !== undefined) {
        console.log('===>>> min')
        if (val.length < min) {
            return false;
        }
    }

    if (max !== undefined) {
        console.log('===>>> max')
        if (val.length > max) {
            return false;
        }
    }

    if (gt !== undefined) {
        console.log('===>>> gt')
        if (val.length <= gt) {
            return false;
        }
    }

    if (lt !== undefined) {
        console.log('===>>> lt')
        if (val.length >= lt) {
            return false;
        }
    }

    if (gte !== undefined) {
        console.log('===>>> gte')
        if (val.length < gte) {
            return false;
        }
    }

    if (lte !== undefined) {
        console.log('===>>> lte')
        if (val.length > lte) {
            return false;
        }
    }

    if (eq !== undefined) {
        console.log('===>>> eq')
        if (val.length !== eq) {
            return false;
        }
    }

    return true;
}