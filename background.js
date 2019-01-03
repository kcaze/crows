chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request.greeting);
  }
);
/**
Use these 2 sites:
https://www.wordplays.com/crossword-solver/
http://www.the-crossword-solver.com/search
**/
