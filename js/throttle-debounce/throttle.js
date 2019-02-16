/*
节流
考虑一个场景，滚动事件中会发起网络请求，但是我们并不希望用户在滚动过程中一直发起请求，而是隔一段时间发起一次，对于这种情况我们就可以使用节流。

理解了节流的用途，我们就来实现下这个函数
*/
function throttle(func,wait=50){
    let lastTime=0;
    return function(...args){
        let now=Date.now();
        if(now-lastTime>wait){
            lastTime=now;
            func.apply(this,args)
        }
    }
}