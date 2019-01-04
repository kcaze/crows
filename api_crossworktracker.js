solvers.push((function() {
  const BASE_URL = 'http://crosswordtracker.com/search';
  function extract(response) {
    const ROW_REGEX = /<li class="answer" data-count="(\d+)" data-text="(\w+)">/g;
    const words = [];
    let m;
    do {
        m = ROW_REGEX.exec(response);
        if (m) {
            // Crossword Tracker answers are those that have actually appeared in print before
            // so give high confidence to all answers 
            const score = 1.0;
            const word = m[2];
            words.push({word, score});
        }
    } while (m != null);
    return words;
  }
  return {
    name: "crosswordtracker",
    extract,
    solve(clue) {
        return new Promise(resolve => {
        const url = `${BASE_URL}/?clue=${encodeURIComponent(clue.replace(/\s/g, "-"))}`;
        const req = new XMLHttpRequest();
        req.addEventListener("load", ret => {
            resolve(extract(req.responseText));
        });
        req.open("GET", url);
        req.send();
        });
    }
  };
})());
