solvers.push((function() {
  const BASE_URL = 'https://crosswordnexus.com/finder.php';
  return {
    name: "crosswordnexus",
    solve(clue) {
        return new Promise(resolve => {
        const ROW_REGEX = /<tr[^>]*>\s*<td[^>]*>\s*((<img src="\/images\/star.png" \/>)*)\s*<\/td>\s*<td[^>]*>\s*<big>\s*<a[^>]*>(\w+)/g;
        const url = `${BASE_URL}?clue=${encodeURIComponent(clue)}&pattern=`;
        const req = new XMLHttpRequest();
        req.addEventListener("load", ret => {
            const words = [];
            let m;
            do {
            m = ROW_REGEX.exec(req.responseText);
            if (m) {
                const score = m[1].length / "<img src=\"/images/star.png\" />".length / 5.0;
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
  };
})());
