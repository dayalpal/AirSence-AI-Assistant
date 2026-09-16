export default function MarkdownText({ text }) {
  if (!text) return null

  const html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Headers
    .replace(/^#{1,3} (.+)$/gm, '<h4 class="text-blue-300 font-semibold mt-3 mb-1 text-sm">$1</h4>')
    // Numbered list
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Bullet list
    .replace(/^[*-] (.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>[\s\S]+?<\/li>)(?=\s*(?:<li>|$))/g, (match) => {
      if (match.includes('<ul>')) return match
      return `<ul class="list-disc list-inside space-y-1 my-2">${match}</ul>`
    })
    // Double newline = paragraph break
    .replace(/\n{2,}/g, '<br /><br />')
    .replace(/\n/g, '<br />')

  return (
    <div
      className="prose-chat text-sm text-white/75 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
