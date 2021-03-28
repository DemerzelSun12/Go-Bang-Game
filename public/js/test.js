/************** 测量字符串字节长度 **************/
function strlen(str) {
    var len,
        i;
    len = 0;
    for (i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 255) {
            len += 2;
        }
        else {
            len++;
        }
    }
    return len;
}

/*************** 较完整数据类型安全检查 ***************/
function myTypeOf(o) {
    var _toString = Object.prototype.toString;
    var _type = {
        "undefined": "undefined",
        "number": "number",
        "boolean": "boolean",
        "string": "string",
        "[object Function]": "function",
        "[object RegExp]": "regexp",
        "[object Array]": "array",
        "[object Date]": "date",
        "[object Error]": "error"
    }
    return _type[typeof o] || _type[_toString.call(o)] || (o ? "object" : "null");
}
/**************** 重写alert ****************/
// window.alert = function (title, info) {
//     var box = document.getElementById("alert_box");
//     var html = '<dl><dt>' + title + '</dt><dd>' + info + '</dd></dl>';
//     if (box) {
//         box.innerHTML = html;
//         box.style.display = "block";
//     } else {
//         var div = document.createElement("div");
//         div.id = "alert_box";
//         div.style.display = "block";
//         this.document.body.appendChild(div);
//         div.innerHTML = html;


//     }
// }


/**获取浏览器窗口位置 */
var leftPos = (typeof window.screenLeft == "number") ? window.screenLeft : window.screenX;
var TopPos = (typeof window.ScreenTop == "number") ? window.ScreenTop : window.ScreenY;


/**把nodeList转换为数组 */
function convertToArray(nodes) {
    var arr = null;
    try {
        arr = Array.prototype.slice.call(nodes, 0);
    } catch (e) {
        arr = new Array();
        for (var i = 0; i < nodes.length; i++) {
            arr.push(nodes[i]);
        }
    }
    return arr;

}

/**获得第一个子元素节点 */
function first(e) {
    var e = e.firstChild;
    while (e && e.nodeType != 1) {
        e = e.nextSibling;
    }
    return e;
}
/**获得最后一个子元素节点 */
function last(e) {
    var e = e.lastChild;
    while (e && e.nodeType != 1) {
        e = e.previousSibling;
    }
    return e;
}

/**获得多层父元素 */
function parent(e, n) {
    var n = n || 1;

    for (var i = 0; i < n; i++) {
        if (e.nodeType == 9)
            break;
        if (e != null)
            e = e.parentNode;
    }
    return e;
}

/**返回上一个相邻的元素节点 */
function pre(e) {
    var e = e.previousSibling;
    while (e && e.nodeType != 1) {
        e = e.previousSibling;
    }
    return e;
}


/**返回下一个相邻的元素节点 */

function next(e) {
    var e = e.nextSibling;
    while (e && e.nodeType != 1) {
        e = e.nextSibling;
    }
    return e;
}

/**创建元素 */
function create(e) {
    return document.createElementNS ?
        document.createElementNS("http://www.w3.org/1999/xhtml", e) :
        document.createElement(e);
}

/**删除节点 */
function remove(e) {
    if (e) {
        var _e = e.parentNode.removeChild(e);
        return _e;
    }
    return undefined;
}

/**删除节点的子节点 */
function empty(e) {
    while (e.firstChild) {
        e.removeChild(e.firstChild);
    }
}

/**检测一个节点是不是包含另一个节点的
 * refNode(包含者)
 * otherNode(被包含者) */

function contains(refNode, otherNode) {
    if (typeof refNode.contains == "function" &&
        (!client.engine.webkit || client.engine.webkit >= 522)) {
        return refNode.contains(otherNode);
    } else if (typeof refNode.compareDocumentPosition == "function") {
        return !!(refNode.compareDocumentPosition(otherNode) & 16);
    } else {
        var node = otherNode.parentNode;
        do {
            if (node === refNode) {
                return true;
            } else {
                node = node.parentNode;
            }
        } while (node !== null);
        return false;
    }
}

/**获取指定元素包含的文本
 * 返回包含的所有文本，包括子元素中包含的文本
 */

function text(e) {
    var s = "";
    var e = e.childNodes || e;
    for (var i = 0; i < e.length; i++) {
        s += e[i].nodeType != 1 ? e[i].nodeValue : text(e[i].childNodes);
    }
    return s;
}


/**得到元素文本 */

function getInnerText(e) {
    return (typeof e.textContent == "string") ? e.textContent : e.innerText;
}

function setInnerText(e, text) {
    if (typeof e.textContent == "string") {
        e.textContent = text;
    } else {
        e.innerText = text;
    }
}

/**动态添加脚本文件 */
function loadScript(url, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    if (script.readyState) {
        script.onreadystatechange = function () {
            if (script.readyState == "loaded" || script.readyState == "complete") {
                script.onreadystatechange = null;
                callback();
            }
        }
    } else {
        script.onload = function () {
            callback();
        }
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
    //document.body.appendChild(script);
}

/**动态添加脚本代码 */
function loadScriptString(code) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    try {
        script.appendChild(document.createTextNode(code));
    } catch (e) {
        script.text = code;
    }
    document.body.appendChild(script);
}