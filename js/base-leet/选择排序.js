/*
选择排序
*/
function selectSort(arr){
    var minIndex;
    var len=arr.length;
    var arr=arr.slice();
    for(var i=0;i<len-1;i++){
        minIndex=i;
        for(var j=i+1;j<len;j++){
            if(arr[j]<arr[minIndex]){
                minIndex=j;
            }
        }
        var temp=arr[i];
        arr[i]=arr[minIndex];
        arr[minIndex]=temp;
    }
    return arr;
}
var arr=[22,33,11,2,1,2,34,1,222,3];
var sortArr=selectSort(arr);
console.log(sortArr)