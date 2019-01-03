solvers.push((function() {
  const BASE_URL = 'https://www.wordplays.com/crossword-solver';
  return function solve(clue) {
    return new Promise(resolve => {
      const ROW_REGEX = /<tr[^>]*><td><div class=stars>((<div><\/div>)*)<\/div><div class=clear><\/div><\/td><td><a[^>]*>(\w+)/g;
      const url = `${BASE_URL}/${encodeURIComponent(clue)}`;
      const req = new XMLHttpRequest();
      req.addEventListener("load", ret => {
        const words = [];
        let m;
        do {
          m = ROW_REGEX.exec(req.responseText);
          if (m) {
            const score = m[1].length / "<div></div>".length / 5.0;
            const word = m[3];
            words.push({word, score});
          }
        } while (m != null);
        resolve(words);
      });
      req.open("GET", url);
      req.send();
    });
  }
})());
