"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "../admin.module.css";
import { createCategory, updateCategory, deleteCategory, bulkDeleteCategories } from "./actions";

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description?: string;
};

interface CategoryManagerProps {
  initialCategories: Category[];
}

export default function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const [error, setError] = useState<string | null>(null);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editId) setSlug(slugify(val));
  };

  const resetForm = () => {
    setName("");
    setSlug("");
    setParentId("");
    setDescription("");
    setEditId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    setLoading(true);
    setError(null);
    const data = { name, slug, parent_id: parentId || null, description };

    if (editId) {
      const result = await updateCategory(editId, data);
      if (result.success) {
        setCategories(prev =>
          prev.map(c => (c.id === editId ? { ...c, ...data, id: editId } : c))
        );
        resetForm();
      } else {
        setError(result.error || "Failed to update category");
      }
    } else {
      const result = await createCategory(data);
      if (result.success) {
        // Full refresh to ensure consistency with server actions and revalidatePath
        window.location.href = "/admin/categories";
      } else {
        setError(result.error || "Failed to create category. Maybe the slug already exists?");
      }
    }
    setLoading(false);
  };

  const handleEdit = (cat: Category) => {
    setName(cat.name);
    setSlug(cat.slug);
    setParentId(cat.parent_id || "");
    setDescription(cat.description || "");
    setEditId(cat.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    setLoading(true);
    const result = await deleteCategory(id);
    if (result.success) {
      setCategories(prev => prev.filter(c => c.id !== id));
    } else {
      alert("Error: " + result.error);
    }
    setLoading(false);
  };

  const handleBulkApply = async () => {
    if (bulkAction === "delete" && selectedIds.length > 0) {
      if (!confirm(`Are you sure you want to delete ${selectedIds.length} categories?`)) return;
      setLoading(true);
      const result = await bulkDeleteCategories(selectedIds);
      if (result.success) {
        setCategories(prev => prev.filter(c => !selectedIds.includes(c.id)));
        setSelectedIds([]);
        setBulkAction("");
      } else {
        alert("Error: " + result.error);
      }
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const parents = categories.filter(c => !c.parent_id);
  const getChildren = (pid: string) => categories.filter(c => c.parent_id === pid);

  return (
    <div className={styles.wpCatLayout}>
      {/* Add/Edit Category Form */}
      <div className={styles.wpCatForm}>
        <h2 className={styles.wpCatFormTitle}>
          {editId ? "Edit Category" : "Add New Category"}
        </h2>

        {error && (
          <div className={styles.wpNotice} style={{ marginBottom: 15, borderColor: "#d63638", background: "#fcf0f1" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.wpFormGroup2}>
            <label className={styles.wpLabel2}>Name</label>
            <input
              type="text"
              className={styles.wpInput2}
              value={name}
              onChange={handleNameChange}
              placeholder="Enter category name"
              required
            />
            <p className={styles.wpDesc}>The name is how it appears on your site.</p>
          </div>

          <div className={styles.wpFormGroup2}>
            <label className={styles.wpLabel2}>Slug</label>
            <input
              type="text"
              className={styles.wpInput2}
              value={slug}
              onChange={e => setSlug(slugify(e.target.value))}
              placeholder="category-slug"
              required
            />
            <p className={styles.wpDesc}>The slug is the URL-friendly version of the name.</p>
          </div>

          <div className={styles.wpFormGroup2}>
            <label className={styles.wpLabel2}>Parent Category</label>
            <select
              className={styles.wpSelect2}
              value={parentId}
              onChange={e => setParentId(e.target.value)}
            >
              <option value="">None</option>
              {parents
                .filter(p => p.id !== editId)
                .map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
            <p className={styles.wpDesc}>Categories can have a hierarchy. Leave None for main category.</p>
          </div>

          <div className={styles.wpFormGroup2}>
            <label className={styles.wpLabel2}>Description</label>
            <textarea
              className={styles.wpTextarea2}
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" className={styles.wpButtonPrimary} disabled={loading}>
              {loading ? "Processing..." : editId ? "Update Category" : "Add New Category"}
            </button>
            {editId && (
              <button type="button" className={styles.wpButton} onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Categories Table */}
      <div className={styles.wpCatTable}>
        <div className={styles.wpTablenav}>
          <div className={styles.wpAlignleft}>
            <select
              className={styles.wpSelect}
              value={bulkAction}
              onChange={e => setBulkAction(e.target.value)}
            >
              <option value="">Bulk Actions</option>
              <option value="delete">Delete</option>
            </select>
            <button
              className={styles.wpButton}
              style={{ marginLeft: 6 }}
              onClick={handleBulkApply}
              disabled={!bulkAction || selectedIds.length === 0}
            >
              Apply
            </button>
          </div>
          <div className={styles.wpTablenavPages}>
            <span className={styles.wpDisplayingNum}>{categories.length} items</span>
          </div>
        </div>

        <table className={styles.wpListTable}>
          <thead>
            <tr>
              <th className={styles.wpCheckColumn}>
                <input
                  type="checkbox"
                  onChange={e =>
                    setSelectedIds(e.target.checked ? categories.map(c => c.id) : [])
                  }
                  checked={selectedIds.length === categories.length && categories.length > 0}
                />
              </th>
              <th>Name</th>
              <th>Slug</th>
              <th>Description</th>
              <th>Parent</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#646970" }}>
                  No categories found. Start by adding one!
                </td>
              </tr>
            ) : (
              parents.map((cat, i) => (
                <React.Fragment key={cat.id}>
                  {/* Parent Row */}
                  <tr className={i % 2 !== 0 ? styles.wpAlternateRow : ""}>
                    <td className={styles.wpCheckColumn}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(cat.id)}
                        onChange={() => toggleSelect(cat.id)}
                      />
                    </td>
                    <td>
                      <strong className={styles.wpRowTitle}>{cat.name}</strong>
                      <div className={styles.wpRowActions}>
                        <span>
                          <button
                            onClick={() => handleEdit(cat)}
                            style={{ background: "none", border: "none", color: "#2271b1", cursor: "pointer", padding: 0 }}
                          >
                            Edit
                          </button> | 
                        </span>
                        <span>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            style={{ background: "none", border: "none", color: "#d63638", cursor: "pointer", padding: 0 }}
                          >
                            Delete
                          </button> | 
                        </span>
                        <span>
                          <Link href={`/category/${cat.slug}`} target="_blank">View</Link>
                        </span>
                      </div>
                    </td>
                    <td><code>{cat.slug}</code></td>
                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {cat.description || "—"}
                    </td>
                    <td>—</td>
                  </tr>

                  {/* Children Rows */}
                  {getChildren(cat.id).map((sub, j) => (
                    <tr key={sub.id} className="wpSubCatRow">
                      <td className={styles.wpCheckColumn}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(sub.id)}
                          onChange={() => toggleSelect(sub.id)}
                        />
                      </td>
                      <td>
                        <strong className={styles.wpRowTitle}>
                          &nbsp;&nbsp;— {sub.name}
                        </strong>
                        <div className={styles.wpRowActions}>
                          <span>
                            <button
                              onClick={() => handleEdit(sub)}
                              style={{ background: "none", border: "none", color: "#2271b1", cursor: "pointer", padding: 0 }}
                            >
                              Edit
                            </button> | 
                          </span>
                          <span>
                            <button
                              onClick={() => handleDelete(sub.id)}
                              style={{ background: "none", border: "none", color: "#d63638", cursor: "pointer", padding: 0 }}
                            >
                              Delete
                            </button> | 
                          </span>
                          <span>
                             <Link href={`/category/${sub.slug}`} target="_blank">View</Link>
                          </span>
                        </div>
                      </td>
                      <td><code>{sub.slug}</code></td>
                      <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {sub.description || "—"}
                      </td>
                      <td>{cat.name}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
