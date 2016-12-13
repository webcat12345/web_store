$(document).ready(function(){

  for (var i = $("h1").length - 1; i >= 0; i--) {
    console.log($("h1")[i].innerHTML);
    $("h1")[i].innerHTML = changeString($("h1")[i].innerHTML);
  }

  function changeString(str) {
    var patt1 = /[0-9]+[/,.][0-9]+R/g;
    var patt2 = /[|]/g;
    var match = patt1.exec(str);
  
    if (match) {
    	return str.substr(0, match.index) + "</br>" + str.substr(match.index);
  }
    var match2 = patt2.exec(str);
    if (match2) {
      return str.substr(0, match2.index - 1) + "</br>" + str.substr(match2.index + 1);
    }

	  return str;
  }
});
