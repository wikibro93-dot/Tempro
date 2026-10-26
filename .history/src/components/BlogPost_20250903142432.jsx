import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { Helmet } from 'react-helmet';   // ✅ Import Helmet
import 'highlight.js/styles/github.css';

// Import all markdown files at build time
const markdownFiles = import.meta.glob('../content/articles/*.md', { as: 'raw', eager: true });

export default function BlogPost() {
  const { slug } = useParams();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      setLoading(true);
      setError(null);

      const filePath = `../content/articles/${slug}.md`;
      const text = markdownFiles[filePath];

      if (!text) throw new Error('Post not found');

      // Extract frontmatter and content
      const frontmatterEnd = text.indexOf('---', 3);
      if (frontmatterEnd !== -1) {
        const frontmatter = text.substring(3, frontmatterEnd).trim();
        const contentStart = frontmatterEnd + 3;
        const contentText = text.substring(contentStart).trim();

        const titleMatch = frontmatter.match(/title: "([^"]+)"/);
        const dateMatch = frontmatter.match(/date: "([^"]+)"/);
        const descriptionMatch = frontmatter.match(/description: "([^"]+)"/);

        if (titleMatch) setTitle(titleMatch[1]);
        if (dateMatch) setDate(dateMatch[1]);
        if (descriptionMatch) setDescription(descriptionMatch[1]);

        setContent(contentText);
      } else {
        setContent(text);
        setTitle(slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
      }
    } catch (err) {
      console.error('Error loading markdown:', err);
      setError('Failed to load the blog post. Please try again later.');
      setContent('');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="blog-post-container d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-post-container">
        <div className="alert alert-danger text-center my-5">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post-container">
      {/* ✅ SEO for each article */}
      <Helmet>
        <title>{title ? `${title} | TempMail Pro Blog` : "Blog Post | TempMail Pro"}</title>
        <meta
          name="description"
          content={description || "Read the latest article on TempMail Pro Blog."}
        />
        <link rel="canonical" href={`${window.location.origin}/blog/${slug}`} />

        {/* Open Graph for social media */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description || "TempMail Pro Blog article"} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${window.location.origin}/blog/${slug}`} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description || "TempMail Pro Blog article"} />
      </Helmet>

      <main className="blog-post container my-5">
        <article>
          <header className="mb-4">
            <h1 className="display-4 fw-bold mb-3">{title}</h1>
            <div className="text-muted d-flex align-items-center gap-3">
              {date && (
                <small>
                  <i className="bi bi-calendar me-1"></i>
                  {new Date(date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </small>
              )}
              <small>
                <i className="bi bi-clock me-1"></i>
                {Math.ceil(content.split(' ').length / 200)} min read
              </small>
            </div>
            {description && <p className="lead mt-3">{description}</p>}
          </header>

          <div className="blog-content">
            <ReactMarkdown rehypePlugins={[rehypeHighlight, rehypeSlug, rehypeAutolinkHeadings]}>
              {content}
            </ReactMarkdown>
          </div>

          <footer className="mt-5 pt-4 border-top">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted">Published on TempMail Pro</span>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-twitter me-1"></i> Tweet
                </button>
                <button className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-linkedin me-1"></i> Share
                </button>
              </div>
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
}


import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import 'highlight.js/styles/github.css';

// Import all markdown files at build time
const markdownFiles = import.meta.glob('../content/articles/*.md', { as: 'raw', eager: true });

export default function BlogPost() {
  const { slug } = useParams();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the markdown content directly from the imported files
      const filePath = `../content/articles/${slug}.md`;
      const text = markdownFiles[filePath];
      
      if (!text) {
        throw new Error('Post not found');
      }
      
      // Extract frontmatter and content
      const frontmatterEnd = text.indexOf('---', 3);
      if (frontmatterEnd !== -1) {
        const frontmatter = text.substring(3, frontmatterEnd).trim();
        const contentStart = frontmatterEnd + 3;
        const contentText = text.substring(contentStart).trim();
        
        // Parse frontmatter
        const titleMatch = frontmatter.match(/title: "([^"]+)"/);
        const dateMatch = frontmatter.match(/date: "([^"]+)"/);
        const descriptionMatch = frontmatter.match(/description: "([^"]+)"/);
        
        if (titleMatch) setTitle(titleMatch[1]);
        if (dateMatch) setDate(dateMatch[1]);
        if (descriptionMatch) setDescription(descriptionMatch[1]);
        
        setContent(contentText);
      } else {
        // If no frontmatter, use the entire content
        setContent(text);
        setTitle(slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
      }
    } catch (err) {
      console.error('Error loading markdown:', err);
      setError('Failed to load the blog post. Please try again later.');
      setContent('');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="blog-post-container">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-post-container">
        <div className="alert alert-danger text-center my-5">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post-container">
      <main className="blog-post container my-5">
        <article>
          <header className="mb-4">
            <h1 className="display-4 fw-bold mb-3">{title}</h1>
            <div className="text-muted d-flex align-items-center gap-3">
              {date && (
                <small>
                  <i className="bi bi-calendar me-1"></i> 
                  {new Date(date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </small>
              )}
              <small>
                <i className="bi bi-clock me-1"></i> 
                {Math.ceil(content.split(' ').length / 200)} min read
              </small>
            </div>
            {description && (
              <p className="lead mt-3">{description}</p>
            )}
          </header>
          
          <div className="blog-content">
            <ReactMarkdown
              rehypePlugins={[rehypeHighlight, rehypeSlug, rehypeAutolinkHeadings]}
            >
              {content}
            </ReactMarkdown>
          </div>
          
          <footer className="mt-5 pt-4 border-top">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted">Published on TempMail Pro</span>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-twitter me-1"></i> Tweet
                </button>
                <button className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-linkedin me-1"></i> Share
                </button>
              </div>
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
}

