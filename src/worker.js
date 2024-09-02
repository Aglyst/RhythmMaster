timer = null;
onmessage = (message) => {
    if (message.data.type === "Start"){
        postMessage("");
        timer = setInterval(() => {postMessage("")}, message.data.dur)
    }
    else if (message.data.type === "Stop"){
        clearInterval(timer);
        timer=null;
    }
}


