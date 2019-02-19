/*
防抖
考虑一个场景，有一个按钮点击会触发网络请求，但是我们并不希望每次点击都发起网络请求，而是当用户点击按钮一段时间后没有再次点击的情况才去发起网络请求，对于这种情况我们就可以使用防抖。
个人理解 函数防抖就是法师发技能的时候要读条，技能读条没完再按技能就会重新读条。
理解了防抖的用途，我们就来实现下这个函数

*/
function debounce(func,wait=1000){
    var timer=0;
    return function (...args){
        if(timer) clearTimeout(timer)
        timer=setTimeout(() => {
            func.apply(this,args)
        }, wait);
    }
}