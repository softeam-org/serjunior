import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import WikiSidebar from './WikiSidebar'
import { loadWikiPage } from './useSidebar'
import SiteHeader from '../components/SiteHeader'
import '../styles/wiki.css'

export default function WikiPage() {
  const params = useParams()
  const slug = params['*'] ?? ''

  const content = loadWikiPage(slug)

  return (
    <>
      <SiteHeader />
      <div className="wiki-layout">
        <WikiSidebar />
        <main className="wiki-content">
          {content === null ? (
            <div className="wiki-not-found">
              <h1>Page not found</h1>
              <p>No wiki page exists at <code>{slug}</code>.</p>
            </div>
          ) : (
            <article className="wiki-article">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {content}
              </ReactMarkdown>
            </article>
          )}
        </main>
      </div>
    </>
  )
}
