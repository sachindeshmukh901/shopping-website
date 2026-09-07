import {
    FolderTree,
    Plus,
    Search,
    Trash2,
    RefreshCw,
    X,
    ShieldCheck
} from "lucide-react";

import {
    useEffect,
    useState
} from "react";

import { useNavigate } from "react-router-dom";


function Categories() {

    let navigate = useNavigate();

    let [categories, setCategories] = useState([]);
    let [loading, setLoading] = useState(true);
    let [error, setError] = useState("");
    let [search, setSearch] = useState("");
    let [saving, setSaving] = useState(false);
    let [deletingId, setDeletingId] = useState(null);
    let [editingCategoryId, setEditingCategoryId] = useState(null);

    let [form, setForm] = useState({
        category_name: "",
        description: "",
        category_image: "",
        target_page: "Men"
    });

    let fetchCategories = async () => {

        try {

            setLoading(true);
            setError("");

            let token = localStorage.getItem("adminToken");

            if (!token) {
                navigate("/", { replace: true });
                return;
            }

            let response = await fetch(
                "https://orgos-backend-h7ad.onrender.com/api/admin/categories",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            let data = await response.json();

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("admin");
                navigate("/", { replace: true });
                return;
            }

            if (response.ok && data.success) {
                setCategories(data.categories || []);
            } else {
                setError(data.message || "Failed to fetch categories");
            }

        } catch (error) {
            console.error("Fetch Categories Error:", error);
            setError("Unable to connect with server");
        } finally {
            setLoading(false);
        }

    };

    useEffect(() => {
        fetchCategories();
    }, []);

    let handleChange = (event) => {
        let { name, value } = event.target;
        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    let handleSubmit = async (event) => {
        event.preventDefault();

        let token = localStorage.getItem("adminToken");

        if (!token) {
            navigate("/", { replace: true });
            return;
        }

        try {
            setSaving(true);
            setError("");

            let url = "https://orgos-backend-h7ad.onrender.com/api/admin/categories";
            let method = "POST";

            if (editingCategoryId) {
                url = `https://orgos-backend-h7ad.onrender.com/api/admin/categories/${editingCategoryId}`;
                method = "PUT";
            }

            let response = await fetch(
                url,
                {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(form)
                }
            );

            let data = await response.json();

            if (response.ok && data.success) {
                setForm({
                    category_name: "",
                    description: "",
                    category_image: "",
                    target_page: "Men"
                });
                setEditingCategoryId(null);
                await fetchCategories();
            } else {
                setError(data.message || (editingCategoryId ? "Failed to update category" : "Failed to add category"));
            }

        } catch (error) {
            console.error("Category save error:", error);
            setError(editingCategoryId ? "Unable to update category" : "Unable to add category");
        } finally {
            setSaving(false);
        }
    };

    let handleEdit = (category) => {
        setEditingCategoryId(category.category_id);
        setForm({
            category_name: category.category_name || "",
            description: category.description || "",
            category_image: category.category_image || "",
            target_page: category.target_page || "Men"
        });
        setError("");
    };

    let handleDelete = async (categoryId) => {
        let confirmed = window.confirm("Delete this category?");

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(categoryId);
            setError("");

            let token = localStorage.getItem("adminToken");

            let response = await fetch(
                `https://orgos-backend-h7ad.onrender.com/api/admin/categories/${categoryId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            let data = await response.json();

            if (response.ok && data.success) {
                await fetchCategories();
            } else {
                setError(data.message || "Unable to delete category");
            }

        } catch (error) {
            console.error("Delete Category Error:", error);
            setError("Unable to delete category");
        } finally {
            setDeletingId(null);
        }
    };

    let filteredCategories = categories.filter((category) => {
        let keyword = search.toLowerCase().trim();

        if (!keyword) {
            return true;
        }

        return (
            category.category_name?.toLowerCase().includes(keyword) ||
            category.description?.toLowerCase().includes(keyword)
        );
    });

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <p className="eyebrow">Catalog Management</p>
                    <h1>Categories</h1>
                </div>

                <button
                    type="button"
                    className="primary-btn"
                    onClick={() => fetchCategories()}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <FolderTree size={18} />
                    </div>
                    <div>
                        <span>Total</span>
                        <strong>{categories.length}</strong>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">
                        <ShieldCheck size={18} />
                    </div>
                    <div>
                        <span>Active</span>
                        <strong>{categories.filter((category) => category.status !== "Inactive").length}</strong>
                    </div>
                </div>
            </div>

            <div className="panel-row">
                <div className="panel form-panel">
                    <div className="panel-header">
                        <h3>{editingCategoryId ? "Edit Category" : "Add Category"}</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="space-form">
                        <div className="field-group">
                            <label>Page</label>
                            <select
                                name="target_page"
                                value={form.target_page}
                                onChange={handleChange}
                            >
                                <option value="Men">Men</option>
                                <option value="Women">Women</option>
                                <option value="Kids">Kids</option>
                                <option value="Accessories">Accessories</option>
                                <option value="Unisex">Unisex</option>
                            </select>
                        </div>

                        <div className="field-group">
                            <label>Category Name</label>
                            <input
                                type="text"
                                name="category_name"
                                value={form.category_name}
                                onChange={handleChange}
                                placeholder="e.g. Premium Casual"
                                required
                            />
                        </div>

                        <div className="field-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Optional description"
                            />
                        </div>

                        <div className="field-group">
                            <label>Category Image</label>
                            <input
                                type="text"
                                name="category_image"
                                value={form.category_image}
                                onChange={handleChange}
                                placeholder="Optional image path or URL"
                            />
                        </div>

                        {error && <div className="message error-message">{error}</div>}

                        <div className="action-row split-actions">
                            <button
                                type="submit"
                                className="primary-btn full-width"
                                disabled={saving}
                            >
                                {saving ? "Saving..." : (editingCategoryId ? "Update Category" : "Add Category")}
                            </button>

                            {editingCategoryId && (
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => {
                                        setEditingCategoryId(null);
                                        setForm({
                                            category_name: "",
                                            description: "",
                                            category_image: "",
                                            target_page: "Men"
                                        });
                                        setError("");
                                    }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="panel list-panel">
                    <div className="panel-header split-header">
                        <h3>Category List</h3>
                        <div className="search-box">
                            <Search size={16} />
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search categories"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="empty-state">Loading categories...</div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="empty-state">No categories found.</div>
                    ) : (
                        <div className="category-list">
                            {filteredCategories.map((category) => (
                                <div key={category.category_id} className="category-item">
                                    <div className="category-main">
                                        <div className="category-badge">
                                            {category.category_name?.charAt(0)?.toUpperCase() || "C"}
                                        </div>

                                        <div>
                                            <h4>{category.category_name}</h4>
                                            <p>{category.description || "No description provided"}</p>
                                            <small>
                                                Status: {category.status || "Active"}
                                            </small>
                                        </div>
                                    </div>

                                    <div className="category-actions">
                                        <button
                                            type="button"
                                            className="icon-button"
                                            onClick={() => handleEdit(category)}
                                            title="Edit category"
                                        >
                                            <RefreshCw size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            className="icon-button danger"
                                            onClick={() => handleDelete(category.category_id)}
                                            disabled={deletingId === category.category_id}
                                            title="Delete category"
                                        >
                                            {deletingId === category.category_id ? "Deleting..." : <Trash2 size={16} />}
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

export default Categories;
