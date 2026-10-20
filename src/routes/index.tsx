import { createFileRoute } from "@tanstack/react-router";
import capturedCSS from "../styles/site.css?inline";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Access Denied" }] }),
  component: Index,
});

function Index() {
  return (<><style>{capturedCSS.replace(/(<\/|<)(s)(tyle)/gi, (_, prefix, letter, rest) => prefix + (letter === "s" ? "\\73 " : "\\53 ") + rest)}</style>
    <>
      <div>
      <h1>Access Denied</h1>
       
      You don't have permission to access "http://www.berluti.com/en-za/shoes/" on this server.<p>
      Reference #18.844ddb17.1792488525.a6f883a6
      </p><p>https://errors.edgesuite.net/18.844ddb17.1792488525.a6f883a6</p>


      </div>
    </>
  </>);
}
