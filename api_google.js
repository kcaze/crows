solvers.push((function() {
  const BASE_URL = 'https://www.google.com/search?q=';
  async function extract(response) {
    const WIKIPEDIA_REGEX = />([^<]*) - Wikipedia</g;
    const THE_CROSSWORD_SOLVER_REGEX = /a href="http:\/\/www.the-crossword-solver.com\/word\/([^"]*)"/g;
    const WORDPLAYS_REGEX = /a href="https:\/\/www.wordplays.com\/crossword-solver\/([^"]*)"/g;
    const promises = [];
    let words = [];
    let m;
    m = WIKIPEDIA_REGEX.exec(response);
    if (m) {
      words.push({
        word: m[1].toLocaleUpperCase(),
        score: 1.0,
      });
    }
    // Aggregate results from google autocorrecting our crossword clue.
    // This is a bit slow and not the most useful so commenting out for now.
    /*
    m = THE_CROSSWORD_SOLVER_REGEX.exec(response);
    if (m) {
      promises.push(
        solvers
          .find(x => x.name === 'thecrosswordsolver')
          .solve(m[1].replace(/\+/g, " "))
          .then(w => {
            words = words.concat(w);
          })
      );
    }
    m = WORDPLAYS_REGEX.exec(response);
    if (m) {
      promises.push(
        solvers
          .find(x => x.name === 'wordplays')
          .solve(m[1].replace(/-/g, " "))
          .then(w => {
            words = words.concat(w);
          })
      );
    }
    await Promise.all(promises);
    */
    return words;
  }
  return {
    name: "wordplays",
    extract,
    solve(clue) {
      return new Promise(resolve => {
        const url = `${BASE_URL}/${encodeURIComponent(clue.replace(/\s/g, '+'))}`;
        const req = new XMLHttpRequest();
        req.addEventListener("load", ret => {
          console.log("google", req.responseText);
          extract(req.responseText).then(words => resolve(words));
          resolve(extract(req.responseText));
        });
        req.open("GET", url);
        req.send();
      });
    },
  };
})());
