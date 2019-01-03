let state = {
  // Format of results is an object {word, score} where score is between 0 and 1
  results: [],
  clue: '',
  constraints: '',
};

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request);
    if (request.type === 'getState') {
      sendResponse({
        type: 'getStateResponse',
        state
      });
    } else if (request.type === 'setState') {
      state = request.state;
    } else if (request.type === 'selectionChange') {
      state.selection = request.selection;
    }
  }
);
/**
Use these 2 sites:
https://www.wordplays.com/crossword-solver/
http://www.the-crossword-solver.com/search
**/
