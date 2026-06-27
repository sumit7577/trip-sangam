/**
 * Renders a JSON-LD <script> into the page HTML (server-rendered, so it's in
 * the initial markup Google parses). Pass one schema object or an array.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(Array.isArray(data) ? data : [data]);
  return (
    <script
      type="application/ld+json"
      // schema is built from trusted constants, not user input
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
