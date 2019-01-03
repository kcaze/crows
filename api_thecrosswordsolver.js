solvers.push((function() {
  const BASE_URL = 'http://www.the-crossword-solver.com/search';
  return function solve(clue) {
    return new Promise(resolve => {
    const REGEX = /<p class="searchresult"><a[^>]*>(\w+)<\/a><span class="matchtypes">(<span[^>]*>[^<]*<\/span>\s*)*<\/span>/g;
      const req = new XMLHttpRequest();

      req.addEventListener("load", ret => {
        const words = [];
        let m;
        let numAnswers = 0;
        let numNonAnswers = 0;
        // Algorithm here is to put everything that's an answer in the 50% to 100% range, linearly decreasing
        // and put everything that's not an answer in the 0% to 50% range, linearly decreasing.
        do {
          m = REGEX.exec(req.responseText);
          if (m) {
            const score = m.length > 2 && m[2].indexOf("ANSWER") != -1 ? 1.0 : 0.0;
            if (score != 0.0) {
              numAnswers++;
            }
            const word = m[1];
            words.push({word, score});
          }
        } while (m != null);
        numNonAnswers = words.length - numAnswers;
        const answerDecrement = 0.5 / numAnswers;
        const nonAnswerDecrement = 0.5 / numNonAnswers;
        let answerIdx = 0;
        let nonAnswerIdx = 0;
        words.forEach(word => {
          if (word.score == 1.0) {
            word.score = 1.0 - answerDecrement*(answerIdx++);
          } else {
            word.score = 0.5 - nonAnswerDecrement*(nonAnswerIdx++);
          }
        });
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
