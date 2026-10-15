const gapSignal = /\b(?:little is known|few studies|limited (?:evidence|research|understanding)|lack of|has not been|have not been|not yet (?:been )?(?:studied|examined|explored|addressed)|underexplored|unresolved|knowledge gap|research gap|remains? unclear|remains? unknown)\b/i
const limitationSignal = /\b(?:limitation|limitations|small sample|short follow.?up|single (?:site|center|centre|country)|cannot (?:establish|infer|determine)|causality|generalizability|generalisability)\b/i
const futureSignal = /\b(?:future (?:research|work|studies|investigation)|further (?:research|studies|investigation)|warrants? further|should be (?:studied|examined|explored|investigated|addressed)|need(?:s)? to (?:investigate|explore|examine|study)|remain(?:s)? to be (?:studied|examined|explored|investigated)|next steps)\b/i
const negativeSignal = /\b(?:without (?:naming|identifying|stating|mentioning)|does not (?:name|identify|state|mention)|no (?:clear )?(?:research gap|future work|future direction))\b/i

function splitSentences(text) {
  return String(text || '').replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z0-9(])/).map(s => s.trim()).filter(s => s.length > 35)
}

export function analyzePaperText(pages) {
  const findings = { gaps: [], limitations: [], futureWork: [] }
  let inReferences = false

  for (const page of pages) {
    const text = String(page.text || '')
    if (/^\s*(?:references|bibliography|works cited)\s*$/im.test(text)) inReferences = true
    if (inReferences) continue

    for (const sentence of splitSentences(text)) {
      if (negativeSignal.test(sentence)) continue
      const evidence = { sentence, page: page.page }
      if (gapSignal.test(sentence) && findings.gaps.length < 6) findings.gaps.push(evidence)
      if (limitationSignal.test(sentence) && findings.limitations.length < 6) findings.limitations.push(evidence)
      if (futureSignal.test(sentence) && findings.futureWork.length < 6) findings.futureWork.push(evidence)
    }
  }

  for (const key of Object.keys(findings)) {
    findings[key] = findings[key].filter((item, index, all) => all.findIndex(other => other.sentence === item.sentence) === index)
  }

  return findings
}

export async function extractPdfPages(file, onProgress = () => {}) {
  if (!file || (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf'))) {
    throw new Error('Choose a PDF file to analyze.')
  }
  if (file.size > 35 * 1024 * 1024) throw new Error('This PDF is larger than the 35 MB limit. Try a smaller open-access copy.')

  const [{ getDocument, GlobalWorkerOptions }, workerUrl] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.mjs?url'),
  ])
  GlobalWorkerOptions.workerSrc = workerUrl.default
  const pdf = await getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
  if (pdf.numPages > 400) throw new Error('This PDF has more than 400 pages. Choose a shorter paper or article PDF.')

  const pages = []
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    pages.push({ page: pageNumber, text: content.items.map(item => item.str).join(' ') })
    onProgress({ current: pageNumber, total: pdf.numPages })
  }
  const characterCount = pages.reduce((total, page) => total + page.text.length, 0)
  if (characterCount < 300) throw new Error('No readable text was found. This may be a scanned image PDF; try a text-based PDF.')
  return pages
}
