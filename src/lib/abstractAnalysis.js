const gapSignal = /\b(?:however|yet|although|remains? unclear|remains? unknown|little is known|few studies|limited (?:evidence|research|understanding)|lack of|has not been|have not been|not yet (?:been )?(?:studied|examined|explored|addressed)|underexplored|unresolved|knowledge gap|research gap)\b/i
const limitationSignal = /\b(?:limitation|limitations|small sample|short follow.?up|single (?:site|center|centre|country)|cannot (?:establish|infer|determine)|causality|generalizability|generalisability)\b/i
const futureSignal = /\b(?:future (?:research|work|studies|investigation)|further (?:research|studies|investigation)|warrants? further|should be (?:studied|examined|explored|investigated|addressed)|need(?:s)? to (?:investigate|explore|examine|study)|remain(?:s)? to be (?:studied|examined|explored|investigated)|next steps)\b/i
const negatedSignal = /\b(?:without (?:naming|identifying|stating|mentioning)|does not (?:name|identify|state|mention)|no (?:clear )?(?:research gap|future work|future direction))\b/i

function sentencesFrom(abstract) {
  return String(abstract || '')
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9(])/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 24)
}

export function analyzeAbstract(abstract) {
  const sentences = sentencesFrom(abstract)
  const gaps = sentences.filter(sentence => gapSignal.test(sentence) && !negatedSignal.test(sentence)).slice(0, 4)
  const limitations = sentences.filter(sentence => limitationSignal.test(sentence) && !negatedSignal.test(sentence)).slice(0, 4)
  const futureWork = sentences.filter(sentence => futureSignal.test(sentence) && !negatedSignal.test(sentence)).slice(0, 4)

  return {
    gaps: [...new Set([...gaps, ...limitations])].slice(0, 4),
    futureWork,
    hasAbstract: sentences.length > 0,
  }
}
