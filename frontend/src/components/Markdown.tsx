import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders the chatbot's markdown response (bold, lists, links, tables, etc.)
 * with the .md prose styles defined in index.css.
 */
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a target="_blank" rel="noopener noreferrer" {...props} />
          ),
          // Force relative links to open safely; nothing else needs overriding.
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
