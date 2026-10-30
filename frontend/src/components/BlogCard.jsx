// src/components/BlogCard.jsx
import React from "react"
import { Link } from "react-router-dom"

export default function BlogCard({ post }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="block p-6 rounded-2xl shadow hover:shadow-lg transition bg-white"
    >
      <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
      <p className="text-sm text-gray-500">{post.date}</p>
      <p className="text-gray-700 line-clamp-3">{post.description}</p>
    </Link>
  )
}
