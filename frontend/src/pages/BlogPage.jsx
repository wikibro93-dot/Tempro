// src/pages/BlogPage.jsx
import React from "react"
import { useParams } from "react-router-dom"

// Import all markdown files at build time
const markdownFiles = import.meta.glob("../content/articles/*.md", { eager: true })

export default function BlogPage() {
  const { slug } = useParams()
  const filePath = `../content/articles/${slug}.md`
  const Post = markdownFiles[filePath]?.default

  if (!Post) {
    return <div className="p-6 text-center text-red-500">❌ Post not found</div>
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <article className="prose lg:prose-xl">
        <Post />
      </article>
    </div>
  )
}
