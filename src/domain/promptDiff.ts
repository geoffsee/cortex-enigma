export type DiffSegment = { text: string; added: boolean };

export function wordBoundaryDiff(base: string, expanded: string): DiffSegment[] {
  const tokenize = (s: string): string[] => {
    const tokens: string[] = [];
    const re = /\w+|\W+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(s)) !== null) tokens.push(m[0]);
    return tokens;
  };

  const bt = tokenize(base);
  const et = tokenize(expanded);
  const n = bt.length;
  const m = et.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = bt[i - 1] === et[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const result: DiffSegment[] = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && bt[i - 1] === et[j - 1]) {
      result.unshift({ text: et[j - 1], added: false });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ text: et[j - 1], added: true });
      j--;
    } else {
      i--;
    }
  }

  return result;
}
