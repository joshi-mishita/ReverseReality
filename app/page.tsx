import { query } from "@/lib/db";

export default async function Home() {
  const res = await query("SELECT NOW()");
  console.log(res.rows);

  return (
    <main style={{ padding: "20px" }}>
      <h1>Database Connected ✅</h1>
    </main>
  );
}