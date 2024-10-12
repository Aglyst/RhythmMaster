(function(){"use strict";let t=null;onmessage=e=>{e.data.type==="Start"?(postMessage(""),t=setInterval(()=>{postMessage("")},e.data.dur)):e.data.type==="Stop"&&(clearInterval(t),t=null)}})();
