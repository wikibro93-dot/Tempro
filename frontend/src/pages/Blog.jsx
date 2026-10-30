// src/pages/Blog.jsx
import React from "react"
import BlogList from "../components/BlogList"
import BlogCard from "../components/BlogCard" // your custom card UI

export default function Blog() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Latest Blog Posts</h1>
      <BlogList CardComponent={BlogCard} />
    </div>
  )
}
