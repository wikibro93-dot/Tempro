import React from "react";
import { Link } from "react-router-dom";
import { articles } from "../content/articlesData";

function BlogSection() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Latest Articles</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {articles.map(article => (
          <div key={article.slug} className="border rounded-lg p-4 shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
            <p className="text-gray-600 mb-4">{article.description}</p>
            <Link
              to={`/blog/${article.slug}`}
              className="text-blue-600 font-medium hover:underline"
            >
              Read More →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BlogSection;
