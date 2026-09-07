import {
    BookOpen,
    CheckCircle,
    Edit,
    Eye,
    Loader2,
    Plus,
    Save,
    Trash2,
    XCircle
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function Blogs() {
    const navigate = useNavigate();

    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [editingBlogId, setEditingBlogId] = useState(null);

    const [form, setForm] = useState({
        title: "",
        summary: "",
        content: "",
        image_url: "",
        status: "draft"
    });

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("adminToken");

            if (!token) {
                navigate("/", { replace: true });
                return;
            }

            const response = await fetch("https://orgos-backend-l7mx.onrender.com/api/blogs/admin", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("admin");
                navigate("/", { replace: true });
                return;
            }

            if (response.ok && data.success) {
                setBlogs(data.blogs || []);
            } else {
                setError(data.message || "Failed to fetch blogs");
            }
        } catch (err) {
            console.error("Fetch blogs error:", err);
            setError("Unable to connect with server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const filteredBlogs = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return blogs;

        return blogs.filter((blog) => {
            return (
                blog.title?.toLowerCase().includes(keyword) ||
                blog.summary?.toLowerCase().includes(keyword) ||
                blog.status?.toLowerCase().includes(keyword)
            );
        });
    }, [blogs, search]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const token = localStorage.getItem("adminToken");
        if (!token) {
            navigate("/", { replace: true });
            return;
        }

        if (!form.title.trim() || !form.content.trim()) {
            setError("Title and content are required");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const url = editingBlogId
                ? `https://orgos-backend-l7mx.onrender.com/api/blogs/admin/${editingBlogId}`
                : "https://orgos-backend-l7mx.onrender.com/api/blogs/admin";

            const method = editingBlogId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to save blog");
            }

            setForm({
                title: "",
                summary: "",
                content: "",
                image_url: "",
                status: "draft"
            });
            setEditingBlogId(null);
            await fetchBlogs();
        } catch (err) {
            console.error("Save blog error:", err);
            setError(err.message || "Unable to save blog");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (blog) => {
        setEditingBlogId(blog.blog_id);
        setForm({
            title: blog.title || "",
            summary: blog.summary || "",
            content: blog.content || "",
            image_url: blog.image_url || "",
            status: blog.status || "draft"
        });
        setError("");
    };

    const handleDelete = async (blogId) => {
        const confirmed = window.confirm("Delete this blog post?");
        if (!confirmed) return;

        try {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                navigate("/", { replace: true });
                return;
            }

            const response = await fetch(`https://orgos-backend-l7mx.onrender.com/api/blogs/admin/${blogId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to delete blog");
            }

            await fetchBlogs();
        } catch (err) {
            console.error("Delete blog error:", err);
            setError(err.message || "Unable to delete blog");
        }
    };

    const handleStatusToggle = async (blogId, nextStatus) => {
        try {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                navigate("/", { replace: true });
                return;
            }

            const response = await fetch(`https://orgos-backend-l7mx.onrender.com/api/blogs/admin/${blogId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: nextStatus })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to update blog status");
            }

            await fetchBlogs();
        } catch (err) {
            console.error("Status update error:", err);
            setError(err.message || "Unable to update status");
        }
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <p className="eyebrow">Content Management</p>
                    <h1>Blogs</h1>
                </div>

                <button
                    type="button"
                    className="primary-btn"
                    onClick={fetchBlogs}
                >
                    <BookOpen size={16} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="error-box" style={{ marginBottom: "1rem" }}>
                    {error}
                </div>
            )}

            <div className="grid-two" style={{ display: "grid", gridTemplateColumns: "1.1fr 1.4fr", gap: "1.5rem" }}>
                <form className="admin-form" onSubmit={handleSubmit}>
                    <div className="section-title-row">
                        <h3>{editingBlogId ? "Edit Blog" : "Create Blog"}</h3>
                    </div>

                    <div className="form-field">
                        <label>Title</label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleInputChange}
                            placeholder="Enter blog title"
                        />
                    </div>

                    <div className="form-field">
                        <label>Summary</label>
                        <textarea
                            name="summary"
                            value={form.summary}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder="Short summary shown on cards"
                        />
                    </div>

                    <div className="form-field">
                        <label>Image URL</label>
                        <input
                            type="text"
                            name="image_url"
                            value={form.image_url}
                            onChange={handleInputChange}
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="form-field">
                        <label>Status</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleInputChange}
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>

                    <div className="form-field">
                        <label>Content</label>
                        <textarea
                            name="content"
                            value={form.content}
                            onChange={handleInputChange}
                            rows={9}
                            placeholder="Write the full blog content here..."
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="primary-btn" disabled={saving}>
                            {saving ? <Loader2 size={16} className="spin" /> : editingBlogId ? <Save size={16} /> : <Plus size={16} />}
                            {saving ? "Saving..." : editingBlogId ? "Update Blog" : "Create Blog"}
                        </button>

                        {editingBlogId && (
                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => {
                                    setEditingBlogId(null);
                                    setForm({
                                        title: "",
                                        summary: "",
                                        content: "",
                                        image_url: "",
                                        status: "draft"
                                    });
                                    setError("");
                                }}
                            >
                                <XCircle size={16} />
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                <div className="admin-list-panel">
                    <div className="section-title-row">
                        <h3>Published / Drafts</h3>
                    </div>

                    <div className="search-box" style={{ marginBottom: "1rem" }}>
                        <input
                            type="text"
                            placeholder="Search blogs"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="empty-state">Loading blogs...</div>
                    ) : filteredBlogs.length === 0 ? (
                        <div className="empty-state">No blogs found</div>
                    ) : (
                        <div className="admin-list">
                            {filteredBlogs.map((blog) => (
                                <div key={blog.blog_id} className="admin-list-item">
                                    <div className="admin-list-main">
                                        <h4>{blog.title}</h4>
                                        <p>{blog.summary || "No summary added"}</p>
                                        <small>
                                            <span className={`status-badge ${blog.status}`}>
                                                {blog.status}
                                            </span>
                                        </small>
                                    </div>

                                    <div className="admin-list-actions">
                                        <button type="button" className="icon-btn" onClick={() => handleEdit(blog)} title="Edit">
                                            <Edit size={14} />
                                        </button>

                                        <button
                                            type="button"
                                            className="icon-btn"
                                            onClick={() => handleStatusToggle(blog.blog_id, blog.status === "published" ? "draft" : "published")}
                                            title={blog.status === "published" ? "Unpublish" : "Publish"}
                                        >
                                            {blog.status === "published" ? <Eye size={14} /> : <CheckCircle size={14} />}
                                        </button>

                                        <button type="button" className="icon-btn danger" onClick={() => handleDelete(blog.blog_id)} title="Delete">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Blogs;
