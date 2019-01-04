solvers.push((function() {
  const BASE_URL = 'http://crosswordtracker.com/clue';
  return {
    name: "crosswordtracker",
    solve(clue) {
        return new Promise(resolve => {
        const ROW_REGEX = /<li class="answer" data-count="(\d+)" data-text="(\w+)">/g;
        const url = `${BASE_URL}/${encodeURIComponent(clue.replace(/\s/g, "-"))}`;
        const req = new XMLHttpRequest();
        req.addEventListener("load", ret => {
            console.log(req.responseText);
            const words = [];
            let m;
            do {
            m = ROW_REGEX.exec(req.responseText);
            if (m) {
                // Crossword Tracker answers are those that have actually appeared in print before
                // so give decent confidence to all answers 
                const score = 0.75;
                const word = m[2];
                words.push({word, score});
            }
            } while (m != null);
            resolve(words);
        });
        req.open("GET", url);
        req.send();
        });
    }
  };
})());
