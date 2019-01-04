solvers.push((function() {
  const BASE_URL = 'https://crosswordnexus.com/finder.php';
  function extract(response) {
    const ROW_REGEX = /<tr[^>]*>\s*<td[^>]*>\s*((<img src="\/images\/star.png" \/>)*)\s*<\/td>\s*<td[^>]*>\s*<big>\s*<a[^>]*>(\w+)/g;
    const words = [];
    let m;
    do {
        m = ROW_REGEX.exec(response);
        if (m) {
            const score = m[1].length / "<img src=\"/images/star.png\" />".length >= 3.0 ? 1.0 : 0.0;
            const word = m[3];
            words.push({word, score});
        }
    } while (m != null);
    return words;
  }
  return {
    name: "crosswordnexus",
    extract,
    solve(clue) {
        return new Promise(resolve => {
        const url = `${BASE_URL}?clue=${encodeURIComponent(clue)}&pattern=`;
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
