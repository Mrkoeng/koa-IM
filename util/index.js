/**
 * [getDate 获取当前年月日]
 * @return {[type]} [description]
 */
let getDate = function() {
    let nowDate = new Date();
    return `${nowDate.getFullYear()}-${getZero(nowDate.getMonth() + 1)}-${getZero(nowDate.getDate())}`;
}

let getFulldate = function() {
    let nowDate = new Date();
    return `${nowDate.getFullYear()}-${getZero(nowDate.getMonth() + 1)}-${getZero(nowDate.getDate())} ${nowDate.getHours()}:${getZero(nowDate.getMinutes())}:${getZero(nowDate.getSeconds())}`;
}

let getPartDate = function() {
    let nowDate = new Date();
    return {
        year: nowDate.getFullYear(),
        month: getZero(nowDate.getMonth() + 1),
        day: getZero(nowDate.getDate()),
        hour: nowDate.getHours(),
        minute: getZero(nowDate.getMinutes())
    };
}

/*
 * DateFormat
 * format YYYY/yyyy/YY/yy year
 * MM/M month
 * dd/DD/d/D day
 * hh/HH/h/H hour
 * mm/m minute
 * ss/SS/s/S second
 */
let formatDate = function(date, formatStr) {

    if (formatStr == null) return null;

    var str = formatStr;
    var Week = ['日', '一', '二', '三', '四', '五', '六'];
    var month = date.getMonth() + 1;

    str = str.replace(/yyyy|YYYY/, date.getFullYear());
    str = str.replace(/yy|YY/, (date.getYear() % 100) > 9 ? (date.getYear() % 100).toString() : '0' + (date.getYear() %
        100));

    str = str.replace(/MM/, month > 9 ? month : '0' + month);
    str = str.replace(/M/g, month);

    str = str.replace(/w|W/g, Week[date.getDay()]);

    str = str.replace(/dd|DD/, date.getDate() > 9 ? date.getDate().toString() : '0' + date.getDate());
    str = str.replace(/d|D/g, date.getDate());

    str = str.replace(/hh|HH/, date.getHours() > 9 ? date.getHours().toString() : '0' + date.getHours());
    str = str.replace(/h|H/g, date.getHours());
    str = str.replace(/mm/, date.getMinutes() > 9 ? date.getMinutes().toString() : '0' + date.getMinutes());
    str = str.replace(/m/g, date.getMinutes());

    str = str.replace(/ss|SS/, date.getSeconds() > 9 ? date.getSeconds().toString() : '0' + date.getSeconds());
    str = str.replace(/s|S/g, date.getSeconds());

    str = str.replace(/t/g, date.getHours() < 12 ? 'am' : 'pm');
    str = str.replace(/T/g, date.getHours() < 12 ? 'AM' : 'PM');

    return str;
};

function getZero(m) {
    let _m = m;
    if (m < 10) {
        _m = '0' + m;
    }

    return _m;
}

// 数据转驼峰写法
let toHumpFun = function(obj) {
    let result = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const element = obj[key];
            const index = key.indexOf('_')
            let newKey = key
            if (index === -1 || key.length === 1) {
                result[key] = element
            } else {
                const keyArr = key.split('_')
                const newKeyArr = keyArr.map((item, index) => {
                    if (index === 0) return item
                    return item.charAt(0).toLocaleUpperCase() + item.slice(1)
                })
                newKey = newKeyArr.join('')
                result[newKey] = element
            }
            if (typeof element === 'object' && element !== null) {
                if(element instanceof Date){
                    result[newKey] = element
                }else{
                    result[newKey] = toHumpFun(element)
                }
            }
        }
    }
    return result
}
module.exports = {
    getDate: getDate,
    getFulldate: getFulldate,
    getPartDate: getPartDate,
    formatDate: formatDate,
    toHumpFun
}
