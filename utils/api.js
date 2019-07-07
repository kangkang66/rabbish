
//var HOST_URI = 'http://kang.cn1.utools.club';
//var HOST_URI = 'http://127.0.0.1:2018';
var HOST_URI = 'https://eat666.club';

function _obj2uri(obj){
    if (obj == null) {
        return "openid=" + wx.getStorageSync("openid")
    }

    var p = Object.keys(obj).map(function(k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]);
    }).join('&');
    p = p + "&openid=" +  wx.getStorageSync("openid")
    return p
}


function _wxLogin(o) {
    return HOST_URI + "/wx/login?" + _obj2uri(o);
}

function _search(o) {
    return  HOST_URI + '/rabbish/search?' + _obj2uri(o);
}

function _trashCan(o) {
    return  HOST_URI + '/rabbish/trach-can?' + _obj2uri(o);
}

function _hotSearch(o) {
    return  HOST_URI + '/rabbish/hot-search?' + _obj2uri(o);
}

function _upload(o) {
    return  HOST_URI + '/rabbish/upload?' + _obj2uri(o);
}

function _cache() {
    return HOST_URI + "/cache"
}

function _exam(o) {
    return HOST_URI + "/exam?"  + _obj2uri(o);
}
function _question(o) {
    return HOST_URI + "/question?"  + _obj2uri(o);
}
function _submitExam(o) {
    return HOST_URI + "/submit-exam?"  + _obj2uri(o);
}



module.exports = {
    wxLogin:_wxLogin,
    search: _search,
    trashCan:_trashCan,
    hotSearch:_hotSearch,
    upload:_upload,
    cache:_cache,
    exam : _exam,
    question:_question,
    submitExam:_submitExam,
};