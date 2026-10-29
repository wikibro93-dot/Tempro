import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import { articles } from "../content/articlesData";
import PageNavbar from "./PageNavbar";
import Footer from "./Footer";
import AppIcon from "./AppIcon";

/**
 * BlogList
 * @param {number}  limit     – max articles to show (omit = show all)
 * @param {boolean} showSEO   – render <Helmet> for the /blog route (default false)
 * @param {boolean} showHeader – render section heading (default true)
 */
export default function BlogList({ limit, showSEO = false, showHeader = true }) {
  const displayed = limit ? articles.slice(0, limit) : articles;

  const content = (
    <>
      {showSEO && (
        <Helmet>
          <title>TempMail Pro Blog – Disposable Email Privacy &amp; Security Guides</title>
          <meta name="description" content="Expert guides on temporary disposable emails, spam protection, cybersecurity, and online privacy. Learn how to keep your personal email safe." />
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          <link rel="canonical" href="https://tempmailpk.com/blog" />
          <meta property="og:title" content="TempMail Pro Blog – Disposable Email Privacy &amp; Security Guides" />
          <meta property="og:description" content="Expert guides on temporary disposable emails, spam protection, cybersecurity, and online privacy." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://tempmailpk.com/blog" />
          <meta property="og:site_name" content="TempMail Pro" />
          <meta property="og:image" content="https://tempmailpk.com/pwa-512x512.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="TempMail Pro Blog – Disposable Email Privacy Guides" />
          <meta name="twitter:description" content="Expert guides on temporary disposable emails, spam protection, and online privacy." />
          <meta name="twitter:image" content="https://tempmailpk.com/pwa-512x512.png" />
          <meta name="twitter:site" content="@tempmailpk" />
          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Blog',
              name: 'TempMail Pro Blog',
              url: 'https://tempmailpk.com/blog',
              description: 'Expert guides on temporary emails, online privacy, and protecting your inbox from spam.',
              publisher: {
                '@type': 'Organization',
                name: 'TempMail Pro',
                url: 'https://tempmailpk.com',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://tempmailpk.com/pwa-512x512.png',
                },
              },
            })}
          </script>
        </Helmet>
      )}

      <section className="blog-section py-5">
        <div className="container">
          {showHeader && (
            <div className="text-center mb-5">
              <h2 className="section-title">Latest Articles</h2>
              <p className="section-subtitle">Discover insights about privacy, security, and technology</p>
            </div>
          )}

          <div className="row g-4">
            {displayed.map((article) => (
              <div key={article.slug} className="col-lg-6">
                <div className="blog-card card h-100 border-0 shadow-sm position-relative overflow-hidden">
                  {/* Colored top accent bar */}
                  <div className={`blog-card-accent bg-${article.categoryColor}`} />

                  <div className="card-body p-4">
                    {/* Category badge + read time */}
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className={`badge bg-${article.categoryColor} bg-opacity-10 text-${article.categoryColor} fw-semibold px-3 py-1`}>
                        <AppIcon iconClass={`bi ${article.icon} me-1`} />
                        {article.category}
                      </span>
                      <span className="text-muted small">
                        <AppIcon iconClass="bi bi-clock me-1" />
                        {article.readTime}
                      </span>
                    </div>

                    <h3 className="card-title h5 mb-2">
                      <Link
                        to={`/blog/${article.slug}`}
                        className="stretched-link text-decoration-none text-dark blog-card-title"
                      >
                        {article.title}
                      </Link>
                    </h3>

                    <p className="card-text text-muted small mb-3">{article.description}</p>

                    {/* Tags */}
                    <div className="d-flex flex-wrap gap-1 mb-3">
                      {article.tags.map((tag) => (
                        <span key={tag} className="badge rounded-pill bg-light text-secondary border">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top">
                      <span className="text-muted small">
                        <AppIcon iconClass="bi bi-calendar3 me-1" />
                        {new Date(article.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className={`text-${article.categoryColor} fw-semibold small`}>
                        Read Article <AppIcon iconClass="bi bi-arrow-right" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {limit && articles.length > limit && (
            <div className="text-center mt-5">
              <Link to="/blog" className="btn btn-outline-primary btn-lg px-5">
                View All Articles
                <AppIcon iconClass="bi bi-arrow-right ms-2" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );

  if (showSEO) {
    return (
      <div className="bloglist-page">
        <PageNavbar />
        {content}
        <Footer />
      </div>
    );
  }

  return content;
}
