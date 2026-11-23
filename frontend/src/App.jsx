import { useState } from "react";
import PathwayPlot from "./PathwayPlot";

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file, file.name);

    try {
      // Make sure this is your live Render URL when deploying!
      const res = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Top Navigation Bar */}
      <header style={{
        display: "flex", alignItems: "center", padding: "0 16px", height: "60px",
        borderBottom: "1px solid var(--border)", background: "var(--panel-bg)"
      }}>
        <h1 style={{ fontSize: "18px", fontWeight: "600", margin: 0, letterSpacing: "-0.5px" }}>
          <span style={{ color: "var(--accent)" }}>PICRUSt2</span> Explorer
        </h1>
        <div className="header-subtitle" style={{ marginLeft: "auto", fontSize: "12px", color: "var(--text-muted)" }}>
          Pathway Abundance Analysis
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: "auto", padding: "16px", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
        
        {/* Upload Card */}
        {!data && (
          <div style={{
            background: "var(--panel-bg)", border: "1px solid var(--border)", borderRadius: "12px",
            padding: "32px 16px", textAlign: "center", maxWidth: "600px", margin: "40px auto"
          }}>
            <h2 style={{ marginBottom: "8px", fontSize: "20px" }}>Upload Pathway Data</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "24px", fontSize: "14px" }}>
              Select a PICRUSt2 <code>path_abun_unstrat.tsv</code> file to begin exploring.
            </p>
            
            <label style={{
              display: "block", width: "100%", padding: "12px 24px", background: "var(--accent)", color: "#fff",
              borderRadius: "8px", cursor: "pointer", fontWeight: "500", transition: "background 0.2s"
            }}>
              {loading ? "Parsing Data..." : "Browse Files"}
              <input type="file" accept=".tsv,.csv,.txt" onChange={handleUpload} style={{ display: "none" }} />
            </label>
            
            {error && <p style={{ color: "#f85149", marginTop: "16px", fontSize: "14px" }}>{error}</p>}

            <div style={{ marginTop: "24px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
              <a 
                href="/example_path_abun_unstrat.tsv" 
                download 
                style={{ color: "var(--text-muted)", fontSize: "13px", textDecoration: "underline", cursor: "pointer" }}
              >
                Don't have a file? Download an example dataset.
              </a>
            </div>
          </div>
        )}

        {/* Results Dashboard */}
        {data && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start", sm: { flexDirection: "row" } }}>
              <h2 style={{ fontSize: "20px" }}>Exploration Dashboard</h2>
              <button 
                onClick={() => setData(null)}
                style={{
                  background: "transparent", color: "var(--text-main)", border: "1px solid var(--border)",
                  padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "14px", width: "100%"
                }}
              >
                Upload New File
              </button>
            </div>
            <PathwayPlot data={data} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;