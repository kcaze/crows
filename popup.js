let solvers = [];
let results = [];
let resultsClue = '';
let resultsStale = false;

const inputForm = document.getElementById('inputForm');
const clueInput = document.getElementById('clue');
const constraintsInput = document.getElementById('constraints');
const outDiv = document.getElementById('out');

inputForm.addEventListener('submit', event => {
  const clue = clueInput.value;
  resultsClue = clueInput.value;
  if (resultsStale) {
    resultsStale = false;
    outDiv.innerHTML = '';
    outDiv.classList.remove('stale');
    Promise.all(solvers.map(solve => solve(clue))).then(resArray => {
      let res = [];
      for (const arr of resArray) {
        res = res.concat(arr);
      } 
      results = res;
      console.log(results);
      updateOutDiv();
    });
  } else {
    updateOutDiv();
  }

  event.preventDefault();
  return false;
})

clueInput.addEventListener('keydown', event => {
  if (clueInput.value != resultsClue) {
    outDiv.classList.add('stale');
    resultsStale = true;
  }
})

function updateOutDiv() {
  const res = dedup(filter(sort(results)));
  console.log(res);
  if (typeof res === 'string') {
    outDiv.innerHTML = formatResults(resultsClue, [], res);
  } else {
    if (res.length === 0) {
      outDiv.innerHTML = formatResults(resultsClue, [], 'No results found');
    } else {
      outDiv.innerHTML = formatResults(resultsClue, sort(res), '');
    }
  }
}

function dedup(res) {
  return res.filter((item, pos) => {
    const r = res.find(x => {
      return x[0] == item[0];
    });
    return res.indexOf(r) === pos;
  });
}

function filter(res) {
  const constraints = constraintsInput.value;
  if (constraints === '') {
    return res;
  }
  let reg;
  try {
    reg = new RegExp(constraints, 'i');
  } catch (e) {
    return e.message;
  }
  return results.filter(r => {
    const m = reg.exec(r[0]);
    return m != null && m[0].length === r[0].length;
  });
}

function sort(res) {
  return res.sort((r1, r2) => Math.sign(r2[1] - r1[1]));
}

function formatResults(clue, res, message) {
  return `<table><tr><td>Results for '${clue}':</td></tr>${res.map(item => `<tr><td>${item[0]}</td><td>${Math.round(item[1]*100)}%</td></tr>`).join('')}<tr><td>${message}</td></tr></table>`;
}