
function containsDuplicateVal(arr) {
   let map = {};
   let isDuplicate = false;
   for(let i = 0; i < arr.length; i++) {
      if(map[arr[i]]) {
        isDuplicate = true;
        break;
      }
      map[arr[i]] = true;
   }
   if(isDuplicate) {
      return isDuplicate;
   } else {
      return isDuplicate;
   }
}