// Static question bank, served from public/data/<subject>/<source>/questions.json
// (e.g. "PMP/ExamTopic"). The array is indexed by question number, so
// questions[n] is question n (index 0 is an unused placeholder).
// Image fields in the JSON are paths relative to the source folder; they are
// resolved to full URLs here so callers can use them as-is in <img src>.

const cache = {};

function dataUrl(source, relativePath) {
  return `${process.env.PUBLIC_URL}/data/${source}/${relativePath}`;
}

export function loadQuestions(source) {
  if (!cache[source]) {
    cache[source] = fetch(dataUrl(source, 'questions.json'))
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load questions for ${source}: HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((questions) => {
        questions.forEach((q) => {
          if (q.questionImage) q.questionImage = dataUrl(source, q.questionImage);
          if (q.correctImage) q.correctImage = dataUrl(source, q.correctImage);
        });
        return questions;
      })
      .catch((err) => {
        delete cache[source]; // allow a retry on the next call
        throw err;
      });
  }
  return cache[source];
}

// Resolves to the question object, or null if there is no such question.
export function getQuestion(source, number) {
  return loadQuestions(source).then((questions) => questions[number] || null);
}
