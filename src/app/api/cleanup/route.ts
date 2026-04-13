import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*');

  if (!categories) return NextResponse.json({ error: "No categories" });

  const keepNames = ['online earning', 'ai tools', 'mobile apps'];
  const keepSlugs = ['online-earning', 'ai-tools', 'mobile-apps'];

  const idsToKeepArr = categories
    .filter(c => {
      const name = c.name.toLowerCase();
      const slug = c.slug.toLowerCase();
      return keepNames.includes(name) || keepSlugs.includes(slug);
    })
    .map(c => c.id);

  const finalKeepIds = categories
    .filter(c => idsToKeepArr.includes(c.id) || (c.parent_id && idsToKeepArr.includes(c.parent_id)))
    .map(c => c.id);

  const deleteIds = categories
    .filter(c => !finalKeepIds.includes(c.id))
    .map(c => c.id);

  if (deleteIds.length > 0) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .in('id', deleteIds);
      
    if (error) return NextResponse.json({ error: error.message });
  }

  return NextResponse.json({ success: true, deleted: deleteIds.length });
}
