import Head from 'next/head';
import fs from 'fs';
import path from 'path';
import { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import GithubSlugger from 'github-slugger';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import GridBackground from '@/components/GridBackground';
import { Search, Menu, X, ChevronRight, ArrowLeft } from 'lucide-react';

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), '/src/pages/docs/DOCS.md');
  const content = fs.readFileSync(filePath, 'utf8');
  
  const toc =[];
  const slugger = new GithubSlugger();
  const lines = content.split('\n');
  
  lines.forEach(line => {
    const match = line.match(/^(##|###)\s+(.*)/);
    if (match) {
      const level = match[1].length;
      const rawTitle = match[2];
      const slug = slugger.slug(rawTitle);
      const cleanTitle = rawTitle.replace(/[\*▢●ⓘ✓✗`]/g, '').trim();
      toc.push({ level, title: cleanTitle, slug });
    }
  });

  return { props: { content, toc } };
}

export default function Docs({ content, toc }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredToc = toc.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Documentación - HorekuOs</title>
      </Head>

      <div className="relative min-h-screen w-full bg-black text-gray-300 flex flex-col">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <GridBackground gridSize="50px" spotlights={[{ position: '50% 10%', size: '40%' }]} opacity={0.15} />
        </div>

        {/* Botón flotante premium */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden fixed bottom-6 right-6 z-50 glass-effect bg-black/80 text-white p-4 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.6)] border border-gray-700 transition-transform active:scale-95"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="relative z-10 flex flex-1 max-w-[1400px] mx-auto w-full">
          
          {/* SIDEBAR */}
          <aside className={`
            fixed lg:sticky top-0 left-0 h-screen w-80 glass-effect border-r border-white/10 p-6 overflow-y-auto transition-transform duration-300 z-40 custom-scrollbar
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group w-max">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold">Regresar al Inicio</span>
            </Link>

            <div className="mb-8 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar función..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/50 border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
              />
            </div>

            <nav className="space-y-1 pb-10">
              {filteredToc.map((item, idx) => (
                <a 
                  key={idx} 
                  href={`#${item.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    block py-2 text-sm transition-colors hover:text-white
                    ${item.level === 2 ? 'text-gray-300 font-semibold mt-4 mb-1' : 'text-gray-500 pl-4 border-l border-gray-800 hover:border-gray-500'}
                  `}
                >
                  {item.level === 3 && <ChevronRight className="inline-block w-3 h-3 mr-1 opacity-50" />}
                  {item.title}
                </a>
              ))}
              {filteredToc.length === 0 && (
                <p className="text-gray-600 text-sm text-center mt-10">No se encontraron resultados.</p>
              )}
            </nav>
          </aside>

          {/* CONTENIDO PRINCIPAL */}
          <main className="flex-1 px-6 sm:px-10 py-12 lg:max-w-[900px] w-full">
            <div className="glass-effect rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-4xl sm:text-5xl font-black text-white mb-8 border-b border-gray-800 pb-4" style={{ fontFamily: 'Nunito, sans-serif' }} {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl sm:text-3xl font-bold text-white mt-16 mb-6 scroll-mt-10" style={{ fontFamily: 'Nunito, sans-serif' }} {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl sm:text-2xl font-semibold text-gray-200 mt-10 mb-4 scroll-mt-10" {...props} />,
                  p: ({node, ...props}) => <p className="text-sm sm:text-base leading-relaxed text-gray-400 mb-6" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 text-gray-400 mb-6 ml-4" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-2 text-gray-400 mb-6 ml-4" {...props} />,
                  li: ({node, ...props}) => <li className="text-sm sm:text-base" {...props} />,
                  a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300 underline transition-colors" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-gray-200" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-700 pl-4 py-1 italic text-gray-500 bg-gray-900/30 rounded-r-lg my-6" {...props} />,
                  
                  table: ({node, ...props}) => (
                    <div className="overflow-x-auto mb-8 rounded-xl border border-gray-800 bg-black/20 custom-scrollbar">
                      <table className="w-full text-left border-collapse" {...props} />
                    </div>
                  ),
                  th: ({node, ...props}) => <th className="bg-gray-900/80 p-4 text-sm font-semibold text-white border-b border-gray-800" {...props} />,
                  td: ({node, ...props}) => <td className="p-4 text-sm border-b border-gray-800/50 text-gray-400" {...props} />,
                  
                  pre({node, children, ...props}) {
                    const isSyntaxHighlighter = node.children?.[0]?.properties?.className?.includes('language-');
                    if (isSyntaxHighlighter) return <div {...props}>{children}</div>;
                    
                    return (
                      <pre className="overflow-x-auto my-6 bg-[#0a0a0a] rounded-xl border border-gray-800 shadow-xl p-4 custom-scrollbar text-gray-400 text-xs sm:text-sm font-mono whitespace-pre" {...props}>
                        {children}
                      </pre>
                    );
                  },
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '');
                    
                    if (!inline && match) {
                      return (
                        <SyntaxHighlighter 
                          style={vscDarkPlus} 
                          language={match[1]} 
                          PreTag="div" 
                          className="rounded-xl border border-gray-800 shadow-xl !my-6"
                          customStyle={{ margin: 0, padding: '1.5rem', background: '#0a0a0a' }} 
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      );
                    } 
                    return (
                      <code className={inline ? "bg-gray-800/60 text-gray-300 px-1.5 py-0.5 rounded-md text-sm font-mono border border-gray-700/50" : ""} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}