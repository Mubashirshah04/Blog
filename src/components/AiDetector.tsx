"use client";
import { useMemo, useState } from "react";
import styles from "./AiDetector.module.css";

interface AiDetectorProps {
  content: string; // HTML from editor
}

// Common AI-generated phrases/words
const AI_PHRASES = [
  "furthermore", "moreover", "nevertheless", "consequently", "subsequently",
  "in conclusion", "to summarize", "it is important to note", "it's worth noting",
  "it is worth mentioning", "in today's", "in the realm of", "delve into",
  "delve deeper", "leverage", "it's important to", "as an ai", "as a language model",
  "comprehend", "nuanced", "multifaceted", "paradigm shift", "in terms of",
  "it is crucial", "it is essential", "in order to", "a wide range of",
  "a variety of", "play a crucial role", "have a significant impact",
  "in summary", "notably", "at its core", "in this article", "in this blog",
  "we will explore", "we will discuss", "let's explore", "in today's digital",
  "in today's fast", "landscape", "transformative", "groundbreaking", "seamlessly",
  "robust", "cutting-edge", "state-of-the-art", "revolutionize",
];

// Common human writing patterns
const HUMAN_PHRASES = [
  "honestly", "to be fair", "i think", "i believe", "personally",
  "in my opinion", "tbh", "btw", "you know", "kind of", "sort of",
  "a bit", "pretty", "quite", "actually", "basically", "literally",
  "anyway", "so yeah", "right?", "you see", "let me tell you",
  "the thing is", "here's the deal", "i've seen", "in my experience",
  "i remember", "interestingly", "surprisingly", "shockingly",
  "can you believe", "would you believe",
];

function getTextFromHtml(html: string): string {
  if (typeof window === "undefined") return html.replace(/<[^>]+>/g, " ");
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.innerText || div.textContent || "";
}

function analyzeSentences(text: string) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  if (sentences.length < 2) return { variance: 0, avgLength: 0, burstiness: 0 };

  const lengths = sentences.map(s => s.trim().split(/\s+/).length);
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length;

  // Burstiness: how much sentence lengths vary (humans = high, AI = low)
  const stdDev = Math.sqrt(variance);
  const burstiness = stdDev / (avg || 1);

  return { variance, avgLength: avg, burstiness };
}

function getTypeTokenRatio(text: string): number {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  if (words.length === 0) return 0;
  const unique = new Set(words);
  return unique.size / words.length;
}

function countPassiveVoice(text: string): number {
  const passivePattern = /\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi;
  const matches = text.match(passivePattern) || [];
  const words = text.split(/\s+/).length || 1;
  return (matches.length / words) * 100;
}

function getPunctuationConsistency(text: string): number {
  // AI tends to use commas and semicolons very consistently
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  if (sentences.length < 3) return 0;
  const commasPerSentence = sentences.map(s => (s.match(/,/g) || []).length);
  const avg = commasPerSentence.reduce((a, b) => a + b, 0) / commasPerSentence.length;
  const variance = commasPerSentence.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / commasPerSentence.length;
  // Low variance = more consistent = more AI-like
  return Math.max(0, 1 - Math.sqrt(variance) / (avg + 1));
}

function analyze(rawContent: string) {
  const text = getTextFromHtml(rawContent).toLowerCase();
  const words = (text.match(/\b\w+\b/g) || []);
  const wordCount = words.length;

  if (wordCount < 30) return null; // Too short to analyze

  const scores: { label: string; value: number; isAi: boolean; weight: number; desc: string }[] = [];

  // 1. Burstiness (low = AI)
  const { burstiness, avgLength } = analyzeSentences(text);
  const burstScore = Math.min(burstiness * 60, 100);
  const isHumanBurst = burstScore > 40;
  scores.push({
    label: "Sentence Variety",
    value: Math.round(isHumanBurst ? burstScore : 100 - burstScore),
    isAi: !isHumanBurst,
    weight: 20,
    desc: isHumanBurst
      ? `Sentence lengths vary naturally (burstiness: ${burstiness.toFixed(2)}) — human-like`
      : `Sentence lengths very uniform (avg: ${avgLength.toFixed(0)} words) — AI pattern`
  });

  // 2. AI Phrases count
  const aiPhraseCount = AI_PHRASES.filter(p => text.includes(p)).length;
  const aiPhraseScore = Math.min((aiPhraseCount / 5) * 100, 100);
  scores.push({
    label: "AI Phrases",
    value: Math.round(aiPhraseScore),
    isAi: aiPhraseCount >= 2,
    weight: 25,
    desc: aiPhraseCount >= 2
      ? `${aiPhraseCount} AI-typical phrases found: "${AI_PHRASES.filter(p => text.includes(p)).slice(0, 3).join('", "')}"`
      : `${aiPhraseCount} AI phrases — mostly natural language`
  });

  // 3. Human phrases
  const humanPhraseCount = HUMAN_PHRASES.filter(p => text.includes(p)).length;
  const humanScore = Math.min((humanPhraseCount / 3) * 100, 100);
  scores.push({
    label: "Human Writing Style",
    value: Math.round(humanScore),
    isAi: humanPhraseCount === 0,
    weight: 15,
    desc: humanPhraseCount > 0
      ? `${humanPhraseCount} natural human expressions found`
      : "No casual/personal expressions — typical of AI"
  });

  // 4. Passive voice
  const passive = countPassiveVoice(text);
  const isHighPassive = passive > 3;
  scores.push({
    label: "Passive Voice",
    value: Math.round(Math.min(passive * 15, 100)),
    isAi: isHighPassive,
    weight: 10,
    desc: isHighPassive
      ? `High passive voice usage (${passive.toFixed(1)}%) — AI tends to use more passive`
      : `Low passive voice (${passive.toFixed(1)}%) — more active writing`
  });

  // 5. Vocabulary diversity
  const ttr = getTypeTokenRatio(text);
  const isHighTtr = ttr > 0.65;
  scores.push({
    label: "Vocabulary Diversity",
    value: Math.round(ttr * 100),
    isAi: isHighTtr,
    weight: 15,
    desc: isHighTtr
      ? `Very high vocabulary diversity (${(ttr * 100).toFixed(0)}%) — AI uses many unique words`
      : `Natural vocabulary diversity (${(ttr * 100).toFixed(0)}%)`
  });

  // 6. Punctuation consistency
  const punctConsist = getPunctuationConsistency(text);
  const isHighConsist = punctConsist > 0.6;
  scores.push({
    label: "Punctuation Pattern",
    value: Math.round(punctConsist * 100),
    isAi: isHighConsist,
    weight: 15,
    desc: isHighConsist
      ? "Very consistent punctuation — typical of AI models"
      : "Natural punctuation variation — human-like"
  });

  // Calculate weighted AI score
  const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
  const aiWeightedScore = scores.reduce((sum, s) => {
    return sum + (s.isAi ? s.value * s.weight : 0);
  }, 0) / totalWeight;

  // Final AI probability
  const aiPercent = Math.min(Math.max(Math.round(aiWeightedScore), 0), 100);
  const humanPercent = 100 - aiPercent;

  return { aiPercent, humanPercent, scores, wordCount };
}

export function AiDetector({ content }: AiDetectorProps) {
  const [expanded, setExpanded] = useState(false);

  const result = useMemo(() => analyze(content), [content]);

  if (!result) {
    return (
      <div className={styles.detectorBox}>
        <div className={styles.placeholder}>
          Analyze karne ke liye kam se kam 30 words likhein
        </div>
      </div>
    );
  }

  const { aiPercent, humanPercent, scores, wordCount } = result;

  const verdict = aiPercent >= 70
    ? { label: "Likely AI Generated", color: "#d63638", emoji: "🤖" }
    : aiPercent >= 40
    ? { label: "Mixed (AI + Human)", color: "#dba617", emoji: "⚠️" }
    : { label: "Likely Human Written", color: "#00a32a", emoji: "✅" };

  return (
    <div className={styles.detectorBox}>
      {/* Verdict */}
      <div className={styles.verdict}>
        <span className={styles.verdictEmoji}>{verdict.emoji}</span>
        <div>
          <div className={styles.verdictLabel} style={{ color: verdict.color }}>{verdict.label}</div>
          <div className={styles.verdictSub}>{wordCount} words analyzed</div>
        </div>
      </div>

      {/* Bar */}
      <div className={styles.barWrap}>
        <div className={styles.barLabels}>
          <span className={styles.humanLabel}>🧠 Human {humanPercent}%</span>
          <span className={styles.aiLabel}>🤖 AI {aiPercent}%</span>
        </div>
        <div className={styles.bar}>
          <div className={styles.barHuman} style={{ width: `${humanPercent}%` }} />
          <div className={styles.barAi} style={{ width: `${aiPercent}%` }} />
        </div>
      </div>

      {/* Tip */}
      {aiPercent >= 40 && (
        <div className={styles.tip}>
          💡 <strong>Improve karein:</strong> Personal anecdotes, conversational tone, aur specific examples add karein. "Furthermore", "Moreover" jaisy AI phrases hataein.
        </div>
      )}

      {/* Toggle details */}
      <button className={styles.expandBtn} onClick={() => setExpanded(!expanded)}>
        {expanded ? "▲ Hide Details" : "▼ Show Detailed Analysis"}
      </button>

      {expanded && (
        <div className={styles.details}>
          {scores.map((s, i) => (
            <div key={i} className={styles.detailRow}>
              <div className={styles.detailLeft}>
                <span className={s.isAi ? styles.badSignal : styles.goodSignal}>
                  {s.isAi ? "🤖" : "✅"}
                </span>
                <div>
                  <div className={styles.detailLabel}>{s.label}</div>
                  <div className={styles.detailDesc}>{s.desc}</div>
                </div>
              </div>
              <div className={styles.detailMiniBar}>
                <div
                  className={s.isAi ? styles.detailBarAi : styles.detailBarHuman}
                  style={{ width: `${s.value}%` }}
                />
              </div>
            </div>
          ))}
          <div className={styles.disclaimer}>
            ⚠️ Yeh tool heuristic-based hai. 100% accurate nahi hai — professional tools (GPTZero, Originality.ai) zyada accurate hain.
          </div>
        </div>
      )}
    </div>
  );
}
