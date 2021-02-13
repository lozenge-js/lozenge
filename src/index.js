import * as R from 'ramda';
import './test.coffee'
import worker from './w.worker.js'
let dp = R.bind(Object.defineProperty,Object);
let w = new worker();
let createW = id => {
    let ww = new worker();
    ww.addEventListener("message",evt => w.postMessage({type: 'sent',id,data: evt.data}));
    w.addEventListener("message",evt => evt.data.type === "post" && evt.data.id === id ? ww.postMessage(evt.data.data) : null)
};
w.onmessage = evt => evt.data.type === "eval" ? w.postMessage({id: evt.data.id,data: eval('function(w){return ' + evt.data.source + '}')(worker)}) : evt.data.type === "worker" ? w.postMessage({id: evt.data.id,data: createW(evt.data.id)}) : null;
w.postMesage({mode: 'host'});