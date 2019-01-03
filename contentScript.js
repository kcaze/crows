document.addEventListener('selectionchange', event => {
  chrome.runtime.sendMessage({type: "selectionChange", selection: document.getSelection().toString()});
});
