/*
给定一个整数数组 nums 和一个目标值 target，请你在该数组中找出和为目标值的那 两个 整数，并返回他们的数组下标。

你可以假设每种输入只会对应一个答案。但是，你不能重复利用这个数组中同样的元素。

示例:

给定 nums = [2, 7, 11, 15], target = 9

因为 nums[0] + nums[1] = 2 + 7 = 9
所以返回 [0, 1]
*/
//第一种
var twoSum = function(nums, target) {
    var hashArr=[];
    for(var i=0;i<nums.length;i++){
        var temp=target-nums[i];
        var index=hashArr.indexOf(temp)
        //～index 对于 index+1 然后取反 判断是否存在这个索引
        if(~index){
            return [index,i];
        }
        hashArr[i]=nums[i];
    }
};
//第二种
var twoSum = function(nums, target) {
    var nums=[...new Set(nums)];
    for(var i=0;i<nums.length;i++){
        for(var j=i+1;j<nums.length;j++){
            if(nums[i]+nums[j]===target)
                return [i,j]
        }
    }
    return false;
};