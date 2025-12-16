function askAI() {
  const q = document.getElementById("question").value;
  const answer = document.getElementById("answer");

  if (!q) {
    answer.innerText = "Poojitha: I am your personal AI. Ask something.";
    return;
  }

  answer.innerText =
    "Poojitha: I am your personal AI.\n\nI heard your question:\n" + q;
    }
