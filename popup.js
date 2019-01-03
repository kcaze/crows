let solvers = [];
let query = null;
let state = null;

const inputForm = document.getElementById('inputForm');
const clueInput = document.getElementById('clue');
const constraintsInput = document.getElementById('constraints');
const output = document.getElementById('out');

// Fetch state on start up to persist results between popup open and close.
chrome.runtime.sendMessage({type: "getState"}, response => {
  state = response.state;
  if (!state.selection) {
    clueInput.value = state.clue;
    constraintsInput.value = state.constraints;
    if (state.clue != '') {
      updateOutput();
    }
  } else {
    // Automatically search for user's selection
    state.clue = state.selection.trim();
    state.constraints = '';
    clueInput.value = state.clue;
    constraintsInput.value = state.constraints;
    const fakeEvent = {preventDefault: () => {}};
    onSubmit(fakeEvent);
  }
});

function onSubmit(event) {
  state.clue = clueInput.value;
  state.constraints = constraintsInput.value;
  state.results = [];

  if (query == null) {
    clearOutput();
    output.classList.add('loading');
    query = Promise.all(solvers.map(solve => solve(state.clue)))
      .then(resultsArray => [].concat(...resultsArray));
  } 
  query.then(results => {
    state.results = results;
    chrome.runtime.sendMessage({type: "setState", state});
    updateOutput();
  });

  event.preventDefault();
  return false;
} 

inputForm.addEventListener('submit', onSubmit);

clueInput.addEventListener('keydown', _ => {
  if (clueInput.value == state.clue) {
    return;
  }
  output.classList.add('stale');
  query = null;
});

function clearOutput() {
  output.innerHTML = '';
  output.classList.remove('stale');
  output.classList.remove('loading');
}

function updateOutput() {
  output.classList.remove('loading');
  let processedResults;
  try {
    processedResults = sort(filter(dedupe(state.results), state.constraints));
  } catch (error) {
    output.innerHTML = formatResults(state.clue, [], error);
    return;
  }

  output.innerHTML = formatResults(state.clue, processedResults, processedResults.length > 0 ? '' : 'No results found');
}

// Dedupe results whose 'word' field is the same.
// This retains the result whose score is highest.
function dedupe(results) {
  const scores = {};
  for (const r of results) {
    scores[r.word] = Math.max(r.score, scores[r.word] || 0);
  }
  return Object.keys(scores).map(word => ({ word, score: scores[word] }));
}

// Filters results to those that match the passed in (regex) constraints.
function filter(results, constraints) {
  if (!constraints) {
    return results;
  }
  // Treat regex's that lead with numbers as lengths
  if (!isNaN(parseInt(constraints[0]))) {
    constraints = '.'.repeat(parseInt(constraints[0]));
  }
  const reg = new RegExp(constraints, 'i');
  return results.filter(r => {
    const match = reg.exec(r.word);
    return match != null && match[0].length === r.word.length;
  });
}

// Sort results in descending order by score, then alphabetical.
function sort(res) {
  return res.sort((r1, r2) => {
    const scoreSort = Math.sign(r2.score - r1.score);
    if (scoreSort != 0) {
      return scoreSort;
    }
    const w1 = r1.word.toUpperCase();
    const w2 = r2.word.toUpperCase();
    if (w1 < w2) {
      return -1;
    } else if (w1 > w2) {
      return 1;
    } else {
      return 0;
    }
  });
}

function formatRow(...cells) {
  return `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
}

function formatResults(clue, results, message) {
  const header = formatRow(`Results for '${clue}'`);
  const resultRows = results.map(r => formatRow(r.word, Math.round(r.score*100) + '%'));
  const footer = message ? formatRow(message) : '';
  return `<table>${header}${resultRows.join('')}${footer}</table>`;
}
