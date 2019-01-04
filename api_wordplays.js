solvers.push((function() {
  const BASE_URL = 'https://www.wordplays.com/crossword-solver';
  function extract(response) {
    const ROW_REGEX = /<tr[^>]*><td><div class=stars>((<div><\/div>)*)<\/div><div class=clear><\/div><\/td><td><a[^>]*>(\w+)/g;
    const words = [];
    let m;
    do {
      m = ROW_REGEX.exec(response);
      if (m) {
        const score = m[1].length / "<div></div>".length >= 4.0 ? 1.0 : 0.0;
        const word = m[3];
        words.push({word, score});
      }
    } while (m != null);
    return words;
  }
  return {
    name: "wordplays",
    extract,
    solve(clue) {
      return new Promise(resolve => {
        const url = `${BASE_URL}/${encodeURIComponent(clue.replace(/\s/g, '-'))}`;
        const req = new XMLHttpRequest();
        req.addEventListener("load", ret => {
          resolve(extract(req.responseText));
        });
        req.open("GET", url);
        req.send();
      });
    },
  };
})());
