import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import styles from "../admin.module.css";

export default async function CategoriesPage() {
  const supabase = await createClient();

  // Fetch categories with subcategory count
  const { data: allCats } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, sort_order")
    .order("sort_order", { ascending: true });

  const categories = allCats || [];

  // Separate parents and children
  const parents = categories.filter(c => !c.parent_id);
  const getChildren = (parentId: string) =>
    categories.filter(c => c.parent_id === parentId);

  return (
    <div className={styles.wpWrap}>
      <div className={styles.wpPageHeader}>
        <h1 className={styles.wpPageTitle}>Categories</h1>
      </div>

      <div className={styles.wpCatLayout}>
        {/* Add Category Form */}
        <div className={styles.wpCatForm}>
          <h2 className={styles.wpCatFormTitle}>Add New Category</h2>

          <div className={styles.wpFormGroup2}>
            <label className={styles.wpLabel2}>Name</label>
            <input type="text" className={styles.wpInput2} placeholder="Enter category name" />
            <p className={styles.wpDesc}>The name is how it appears on your site.</p>
          </div>

          <div className={styles.wpFormGroup2}>
            <label className={styles.wpLabel2}>Slug</label>
            <input type="text" className={styles.wpInput2} placeholder="category-slug" />
            <p className={styles.wpDesc}>The slug is the URL-friendly version of the name.</p>
          </div>

          <div className={styles.wpFormGroup2}>
            <label className={styles.wpLabel2}>Parent Category</label>
            <select className={styles.wpSelect2}>
              <option value="">None</option>
              {parents.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <p className={styles.wpDesc}>Categories can have a hierarchy. Leave None for main category.</p>
          </div>

          <div className={styles.wpFormGroup2}>
            <label className={styles.wpLabel2}>Description</label>
            <textarea className={styles.wpTextarea2} rows={4} placeholder="Optional description" />
          </div>

          <button className={styles.wpButtonPrimary} disabled>
            Add New Category
          </button>
          <p className={styles.wpDesc} style={{ marginTop: 8 }}>
            (To add/edit categories, use Supabase SQL Editor or add API later)
          </p>
        </div>

        {/* Categories Table */}
        <div className={styles.wpCatTable}>
          <div className={styles.wpTablenav}>
            <div className={styles.wpAlignleft}>
              <select className={styles.wpSelect} defaultValue="">
                <option value="">Bulk Actions</option>
                <option value="delete">Delete</option>
              </select>
              <button className={styles.wpButton} style={{ marginLeft: 6 }}>Apply</button>
            </div>
            <div className={styles.wpTablenavPages}>
              <span className={styles.wpDisplayingNum}>{categories.length} items</span>
            </div>
          </div>

          <table className={styles.wpListTable}>
            <thead>
              <tr>
                <th className={styles.wpCheckColumn}><input type="checkbox" /></th>
                <th>Name</th>
                <th>Slug</th>
                <th>Parent</th>
                <th>Posts</th>
              </tr>
            </thead>
            <tbody>
              {parents.map((cat, i) => (
                <>
                  {/* Parent Row */}
                  <tr key={cat.id} className={i % 2 !== 0 ? styles.wpAlternateRow : ""}>
                    <td className={styles.wpCheckColumn}><input type="checkbox" /></td>
                    <td>
                      <strong className={styles.wpRowTitle}>{cat.name}</strong>
                      <div className={styles.wpRowActions}>
                        <span><a href="#">Edit</a> | </span>
                        <span><a href="#" style={{ color: "#d63638" }}>Delete</a> | </span>
                        <span>
                          <Link href={`/category/${cat.slug}`} target="_blank">View</Link>
                        </span>
                      </div>
                    </td>
                    <td><code>{cat.slug}</code></td>
                    <td>—</td>
                    <td>—</td>
                  </tr>

                  {/* Children Rows */}
                  {getChildren(cat.id).map((sub, j) => (
                    <tr key={sub.id} className={(i + j + 1) % 2 !== 0 ? styles.wpAlternateRow : ""}>
                      <td className={styles.wpCheckColumn}><input type="checkbox" /></td>
                      <td>
                        <strong className={styles.wpRowTitle}>
                          &nbsp;&nbsp;— {sub.name}
                        </strong>
                        <div className={styles.wpRowActions}>
                          <span><a href="#">Edit</a> | </span>
                          <span><a href="#" style={{ color: "#d63638" }}>Delete</a> | </span>
                          <span>
                            <Link href={`/category/${sub.slug}`} target="_blank">View</Link>
                          </span>
                        </div>
                      </td>
                      <td><code>{sub.slug}</code></td>
                      <td>{cat.name}</td>
                      <td>—</td>
                    </tr>
                  ))}
                </>
              ))}

              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#646970" }}>
                    No categories found. Run the SQL setup script first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
