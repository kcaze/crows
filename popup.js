let solvers = [];
let query = null;
let state = {
  // Format of results is an object {word, score} where score is between 0 and 1
  results: [],
  clue: '',
  constraints: '',
};

const inputForm = document.getElementById('inputForm');
const clueInput = document.getElementById('clue');
const constraintsInput = document.getElementById('constraints');
const output = document.getElementById('out');

inputForm.addEventListener('submit', event => {
  state.clue = clueInput.value;
  state.constraints = constraintsInput.value;
  state.results = [];

  if (query == null) {
    clearOutput();
    query = Promise.all(solvers.map(solve => solve(state.clue)))
      .then(resultsArray => [].concat(...resultsArray));
  } 
  query.then(results => {
    state.results = results;
    updateOutput();
  });

  event.preventDefault();
  return false;
});

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
}

function updateOutput() {
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
  console.log(constraints);
  if (!constraints) {
    return results;
  }
  const reg = new RegExp(constraints, 'i');
  return results.filter(r => {
    const match = reg.exec(r.word);
    return match != null && match[0].length === r.word.length;
  });
}

// Sort results in descending order by score.
function sort(res) {
  return res.sort((r1, r2) => Math.sign(r2.score - r1.score));
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
