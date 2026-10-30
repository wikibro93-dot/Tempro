import React, { useMemo, useState } from "react";
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
 * @param {boolean} showFilters – render search + category + tag filters
 *   (default: same as showSEO, so the full /blog page gets filters while
 *   the homepage reuse in LandingDeferredSections (<BlogList />) keeps
 *   its existing unfiltered "latest articles" rendering unchanged)
 */
export default function BlogList({ limit, showSEO = false, showHeader = true, showFilters = showSEO }) {
  const displayed = limit ? articles.slice(0, limit) : articles;

  // --- Blog search / filter state (client-side only, no new deps, no backend) ---
  // Search matches title, description, category and tags only. Article
  // markdown bodies are deliberately NOT loaded into the list page for search.
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTag, setActiveTag] = useState(null);

  // Category list is derived from articlesData at render time, never
  // hard-coded, so it stays correct if article metadata changes.
  const categories = useMemo(
    () => [...new Set(articles.map((article) => article.category))].sort(),
    []
  );

  const hasActiveFilters =
    showFilters &&
    (searchQuery.trim() !== "" || activeCategory !== "All" || activeTag !== null);

  const clearFilters = () => {
    setSearchQuery("");
    setActiveCategory("All");
    setActiveTag(null);
  };

  // Combination logic: search AND category AND tag (all three must match).
  // When filters are off (homepage reuse) this returns the existing
  // displayed list untouched, preserving the limit behaviour there.
  const filteredArticles = useMemo(() => {
    if (!showFilters) {
      return displayed;
    }
    const query = searchQuery.trim().toLowerCase();
    return articles.filter((article) => {
      if (activeCategory !== "All" && article.category !== activeCategory) {
        return false;
      }
      if (
        activeTag !== null &&
        !(article.tags || []).some((tag) => tag.toLowerCase() === activeTag.toLowerCase())
      ) {
        return false;
      }
      if (query) {
        const haystack = [article.title, article.description, article.category, ...(article.tags || [])]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [showFilters, displayed, searchQuery, activeCategory, activeTag]);

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

          {showFilters && (
            <div className="blog-filters mb-4">
              {/* Filter 1 — search (title, description, category, tags) */}
              <div className="mb-3">
                <label htmlFor="blog-search" className="visually-hidden">
                  Search articles
                </label>
                <div className="input-group">
                  <input
                    id="blog-search"
                    type="search"
                    className="form-control"
                    placeholder="Search articles…"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    aria-describedby="blog-results-count"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>

              {/* Filter 2 — category chips (All + each unique category), single-select */}
              <div
                className="d-flex flex-wrap gap-2 mb-3"
                role="group"
                aria-label="Filter by category"
              >
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill ${activeCategory === "All" ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => setActiveCategory("All")}
                  aria-pressed={activeCategory === "All"}
                >
                  All ({articles.length})
                </button>
                {categories.map((category) => {
                  const count = articles.filter((article) => article.category === category).length;
                  const isActive = activeCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      className={`btn btn-sm rounded-pill ${isActive ? "btn-primary" : "btn-outline-secondary"}`}
                      onClick={() => setActiveCategory(category)}
                      aria-pressed={isActive}
                    >
                      {category} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Active tag (set by clicking a tag badge on any card) */}
              {activeTag !== null && (
                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                  <span className="small text-muted">Tag:</span>
                  <button
                    type="button"
                    className="btn btn-sm rounded-pill btn-primary"
                    onClick={() => setActiveTag(null)}
                    aria-label={`Clear tag filter ${activeTag}`}
                  >
                    #{activeTag} &times;
                  </button>
                </div>
              )}

              {/* Live results count */}
              <p id="blog-results-count" className="small text-muted mb-0" role="status" aria-live="polite">
                {hasActiveFilters
                  ? `Showing ${filteredArticles.length} of ${articles.length} articles`
                  : `Showing all ${articles.length} articles`}
              </p>

              {hasActiveFilters && (
                <button type="button" className="btn btn-link btn-sm p-0 mt-1" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>
          )}

          {showFilters && filteredArticles.length === 0 ? (
            <div className="text-center py-5">
              <p className="h5 mb-2">No articles match your search</p>
              <p className="text-muted small mb-3">
                Try a different search term, category, or tag.
              </p>
              <button type="button" className="btn btn-outline-primary" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          ) : (
          <div className="row g-4">
            {filteredArticles.map((article) => (
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

                    {/* Tags — clickable tag filter when filters are on.
                        Buttons sit above the title's stretched-link
                        (position-relative + zIndex) so clicking a tag
                        filters instead of navigating. Clicking the
                        active tag again clears the tag filter. When
                        filters are off (homepage reuse) tags stay
                        plain badges, exactly as before. */}
                    <div className="d-flex flex-wrap gap-1 mb-3 position-relative" style={{ zIndex: 2 }}>
                      {article.tags.map((tag) => {
                        if (!showFilters) {
                          return (
                            <span key={tag} className="badge rounded-pill bg-light text-secondary border">
                              #{tag}
                            </span>
                          );
                        }
                        const isActiveTag = activeTag !== null && tag.toLowerCase() === activeTag.toLowerCase();
                        return (
                          <button
                            key={tag}
                            type="button"
                            className={`badge rounded-pill border ${isActiveTag ? "bg-primary text-white border-primary" : "bg-light text-secondary"}`}
                            onClick={() => setActiveTag(isActiveTag ? null : tag)}
                            aria-pressed={isActiveTag}
                            aria-label={isActiveTag ? `Clear tag filter ${tag}` : `Filter by tag ${tag}`}
                          >
                            #{tag}
                          </button>
                        );
                      })}
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
          )}

          {limit && !hasActiveFilters && articles.length > limit && (
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
