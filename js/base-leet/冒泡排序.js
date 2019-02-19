/*
    冒泡排序
    时间复杂度O(n^2)
    空间复杂度O(1)
*/
function bubbleSort(arr){
    var len=arr.length;
    var arr=arr.slice();
    for(var i=0;i<len-1;i++){
        for(var j=0;j<len-1-i;j++){
            if(arr[j]>arr[j+1]){
                var temp=arr[j];
                arr[j]=arr[j+1];
                arr[j+1]=temp;
            }
        }
    }
    return arr;
}
var arr=[22,33,11,2,1,2,34,1,222,3];
var sortArr=bubbleSort(arr);
console.log(sortArr)