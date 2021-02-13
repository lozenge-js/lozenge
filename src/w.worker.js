import * as R from 'ramda'
let heval = async source => {let id, f;self.postMessage({type: "eval",id: id = Math.random(),source});return await new Promise(c => self.addEventListener("message",f = evt => evt.data.id == id ? (() => {c(evt.data.data);self.removeEventListener("message",f);}) : null))}
let mode, om;addEventListener("message",evt => om(mode = mode || evt.data.mode));
let worker = () => {
    let id = Math.random();
    self.postMessage({type: "worker",id});
    let s = Symbol();
    return {
        addEventListener(n,f){
            if(n == "message"){
                f[s] = m => m.data.type === "sent" && m.data.id === id ? f({data: m.data.data}) : null;
                self.addEventListener(n,f[s]);
            }
        },
        removeEventListener(n,f){
            if(n == "message"){
                self.removeEventListener(n,f[s]);
            }
        },
        postMessage(data){
            self.postMessage({id: id,type: "post",data: data})
        }
    }
}
let m = mode => {
    let w = worker();
    w.postMessage({mode});
    let createW = id => {
        let ww = worker();
        ww.addEventListener("message",evt => w.postMessage({type: 'sent',id,data: evt.data}));
        w.addEventListener("message",evt => evt.data.type === "post" && evt.data.id === id ? ww.postMessage(evt.data.data) : null)
    };
    w.addEventListener("message",evt => evt.data.type === "eval" ? w.postMessage({id: evt.data.id,data:  eval('function(w){return ' + evt.data.source + '}')(worker)}) : evt.data.type === "worker" ? w.postMessage({id: evt.data.id,data: createW(evt.data.id)}) : null);
return w;    
};
let createProc = code => {
    let p;(p=m("process")).postMessage({eval_: code});
    return p;
}
om = mode => {
    if(mode === "process"){
        addEventListener("message",evt => evt.data.eval_ && eval(evt.data.eval_));
    }
    if(mode === "host"){
        let fd = m("fs");
        let readFile = async f_ => {let id, f;id = Math.random();fd.postMessage({type: 'open+read',fd: f_});return await new Promise(c => self.addEventListener("message",f = evt => evt.data.id == id ? (() => {c(evt.data.data);self.removeEventListener("message",f);}) : null))}
        let createProcess = R.pipe(readFile,R.andThen(createProc));

    };
    if(mode === "fs"){
        let openFile = async file => {
            if(file.startsWith("/proc/pipe")){
                function concatenate(...arrays) {
                    // Calculate byteSize from all arrays
                    let size = arrays.reduce((a,b) => a + b.byteLength, 0)
                    // Allcolate a new buffer
                    let result = new Uint8Array(size)
                  
                    // Build the new array
                    let offset = 0
                    for (let arr of arrays) {
                      result.set(arr, offset)
                      offset += arr.byteLength
                    }
                  
                    return result
                  }
                let data=[];
                return {read: () => (d => (data=null,concatenate(d)))(data),write: x => data.push(x)};
            }
            let f;
            return f={
                data: await (await fetch(file)).arrayBuffer(),
                read: () => f.data,
                write: async v => {f.data=v;await fetch(file,{method: 'POST',body: v})},
            };
        };
        let fds = {};
        addEventListener("message",async evt => {
            let fd = Math.random();
            if(evt.data.type === "open")postMessage({id: evt.data.id,data: (fds[fd]=await openFile(evt.data.data),fd)});
            fd = evt.data.fd;
            if(evt.data.type === "read")postMessage({id: evt.data.id,data: fds[fd].read()});
            if(evt.data.type === "open+read")postMessage({id: evt.data.id,data: (await openFile(fd)).read()});
            if(evt.data.type === "write")await fds[fd].write(evt.data.data);
        });
    }
}