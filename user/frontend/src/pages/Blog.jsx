import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../api/api";

import "../styles/blog.css";

import hero from "../assets/images/blog/hero.jpg";

import { FaRegCalendarAlt } from "react-icons/fa";
import { FiClock } from "react-icons/fi";

function Blog() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await API.get("/blogs/public");
                setBlogs(res.data?.blogs || []);
            } catch (error) {
                console.error("Failed to load blogs:", error);
                setBlogs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    const formatDate = (value) => {
        if (!value) return "Recently";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "Recently";

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    return (
        <>
            <Navbar />

            <section className="blog-hero">
                <img src={hero} alt="" />
            </section>

            <section className="latest-posts">
                <h2>Latest Posts</h2>

                {loading ? (
                    <div className="blog-grid">
                        <div className="blog-card">Loading blogs...</div>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="blog-grid">
                        <div className="blog-card">No published blogs available right now.</div>
                    </div>
                ) : (
                    <div className="blog-grid">
                        {blogs.map((blog) => (
                            <div className="blog-card" key={blog.blog_id}>
                                <img src={blog.image_url || hero} alt={blog.title} />

                                <h3>{blog.title}</h3>

                                <p>{blog.summary || "Read the latest story from ORGOS."}</p>

                                <div className="blog-meta">
                                    <span>
                                        <FaRegCalendarAlt />
                                        {formatDate(blog.published_at || blog.created_at)}
                                    </span>

                                    <span>
                                        <FiClock />
                                        1 min read
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <Footer />
        </>
    );
}

export default Blog;