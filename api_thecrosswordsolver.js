solvers.push((function() {
  const BASE_URL = 'http://www.the-crossword-solver.com/search';
  return function solve(clue) {
    return new Promise(resolve => {
    const REGEX = /<p class="searchresult"><a[^>]*>(\w+)<\/a><span class="matchtypes">(<span[^>]*>[^<]*<\/span>\s*)*<\/span>/g;
      const req = new XMLHttpRequest();

      req.addEventListener("load", ret => {
        const words = [];
        let m;
        do {
          m = REGEX.exec(req.responseText);
          if (m) {
            const score = 0.0;
            const word = m[1];
            words.push({word, score: 0.0});
          }
        } while (m != null);
        resolve(words);
      });
      req.open("POST", BASE_URL, true);

      const boundary = "crows";
      let data = '';
      data += "--" + boundary + "\r\n";
      data += "Content-Disposition: form-data; name=\"q\"\r\n\r\n";
      data += clue + "\r\n";
      data += "--" + boundary;
      req.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + boundary);
      req.send(data);
    });
  }
})());
