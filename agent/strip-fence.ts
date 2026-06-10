/**
 * Models sometimes wrap a generated README in a ```markdown … ``` fence — either
 * as the whole message or after some intro chatter. Unwrap any ```markdown (or
 * bare ```) fenced block in place so it renders as real markdown and saves
 * without the fence. Language-tagged code fences (```js, ```bash, …) are left
 * alone, so real code blocks inside the README survive.
 */
export function stripOuterFence(text: string): string {
  // Unwrap a fence whose whole content is the message (with optional chatter
  // around it) when it's tagged `markdown`/`md` or has no language tag.
  return text.replace(
    /```(?:markdown|md)?[ \t]*\n([\s\S]*?)\n?```/g,
    (whole, inner, offset: number) => {
      const lang = whole.slice(3, whole.indexOf('\n')).trim().toLowerCase();
      // Only unwrap markdown-tagged or untagged fences; keep real code fences.
      if (lang && lang !== 'markdown' && lang !== 'md') return whole;
      // Untagged fences are only unwrapped when they span the whole message
      // (after trimming) — otherwise they may be a legitimate code block.
      if (!lang && text.trim() !== whole.trim()) return whole;
      return inner;
    },
  );
}
