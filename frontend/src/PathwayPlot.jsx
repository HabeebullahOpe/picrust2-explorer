import { useState, useMemo, useRef } from "react";
import Plot from "react-plotly.js";
import Plotly from "plotly.js-dist-min";

const getDarkLayout = (height) => ({
  height: height,
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: {
    color: "#e6edf3",
    family: "'Space Grotesk', sans-serif",
  },
  xaxis: {
    tickangle: -45,
    automargin: true,
    gridcolor: "#30363d",
    zerolinecolor: "#30363d",
    tickfont: { size: 10 }, // Smaller font for mobile
  },
  yaxis: {
    gridcolor: "#30363d",
    zerolinecolor: "#30363d",
    tickfont: { size: 10 },
  },
  margin: { b: 100, l: 40, r: 10, t: 20 }, // Tighter margins for mobile
  bargap: 0.3,
});

export default function PathwayPlot({ data }) {
  const { pathways, samples, abundances } = data;
  const [selectedPathway, setSelectedPathway] = useState(pathways[0]);
  const [viewMode, setViewMode] = useState("group"); 
  const plotRef = useRef(null);

  const topPathways = useMemo(() => {
    const means = pathways.map((pw, i) => ({
      name: pw,
      mean: abundances[i].reduce((a, b) => a + b, 0) / samples.length,
    }));
    return means.sort((a, b) => b.mean - a.mean).slice(0, 20).map((p) => p.name);
  }, [pathways, abundances, samples]);

  const barTrace = useMemo(() => {
    const idxs = topPathways.map((pw) => pathways.indexOf(pw));
    return {
      x: topPathways,
      y: idxs.map((i) => abundances[i].reduce((a, b) => a + b, 0) / samples.length),
      type: "bar",
      marker: { color: "#2ea043", borderRadius: 4 },
    };
  }, [topPathways, pathways, abundances, samples]);

  const individualTrace = useMemo(() => {
    const idx = pathways.indexOf(selectedPathway);
    if (idx === -1) return { x: [], y: [], type: "bar" };
    return {
      x: samples,
      y: abundances[idx],
      type: "bar",
      marker: { color: "#58a6ff", borderRadius: 4 },
    };
  }, [selectedPathway, pathways, samples, abundances]);

  const groupTrace = useMemo(() => {
    const idx = pathways.indexOf(selectedPathway);
    if (idx === -1) return [];

    const groupMap = {};
    samples.forEach((sample, i) => {
      const match = sample.match(/^([a-zA-Z]+)/);
      const groupName = match ? match[1] : "Other";
      if (!groupMap[groupName]) groupMap[groupName] = [];
      groupMap[groupName].push(abundances[idx][i]);
    });

    const groupNames = Object.keys(groupMap);
    const means = [];
    const stds = [];

    groupNames.forEach((group) => {
      const vals = groupMap[group];
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length;
      const std = Math.sqrt(variance);
      means.push(mean);
      stds.push(std);
    });

    return [
      {
        x: groupNames,
        y: means,
        error_y: {
          type: "data",
          array: stds,
          visible: true,
          color: "#8b949e",
          thickness: 1.5,
          width: 5,
        },
        type: "bar",
        marker: { color: "#58a6ff", borderRadius: 4 },
        width: 0.4,
      },
    ];
  }, [selectedPathway, pathways, samples, abundances]);

  const exportPNG = () => {
    if (!plotRef.current) return;
    Plotly.toImage(plotRef.current, { format: "png", width: 1200, height: 600 }).then(
      (url) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = "pathway_plot.png";
        link.click();
      }
    );
  };

  const cardStyle = {
    background: "var(--panel-bg)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "16px", // Reduced padding for mobile
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  const toggleBtnStyle = (isActive) => ({
    padding: "6px 10px",
    fontSize: "11px", // Smaller font for mobile
    cursor: "pointer",
    background: isActive ? "var(--accent)" : "var(--bg-color)",
    color: isActive ? "#fff" : "var(--text-muted)",
    border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
    borderRadius: "6px",
    transition: "all 0.2s",
  });

  return (
    <div
      style={{
        display: "grid",
        // THIS IS THE MAGIC FIX FOR MOBILE: minmax(100%, 1fr) instead of 600px
        gridTemplateColumns: "repeat(auto-fit, minmax(100%, 1fr))", 
        gap: "16px",
        alignItems: "start",
      }}
    >
      {/* LEFT PANEL */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "500" }}>Top 20 Pathways</h3>
          <button
            onClick={exportPNG}
            style={{
              background: "var(--border)", color: "var(--text-main)", border: "none",
              padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px",
            }}
          >
            Export
          </button>
        </div>
        <div style={{ width: "100%", minHeight: "400px", minWidth: 0 }}>
          <Plot
            ref={plotRef}
            data={[barTrace]}
            layout={getDarkLayout(400)}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: "100%", height: "100%" }}
            useResizeHandler
          />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={cardStyle}>
        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "500" }}>
              {viewMode === "group" ? "Group Mean" : "Individual Samples"}
            </h3>
            <div style={{ display: "flex", gap: "4px" }}>
              <button onClick={() => setViewMode("group")} style={toggleBtnStyle(viewMode === "group")}>
                Group
              </button>
              <button onClick={() => setViewMode("individual")} style={toggleBtnStyle(viewMode === "individual")}>
                Individual
              </button>
            </div>
          </div>

          <select
            value={selectedPathway}
            onChange={(e) => setSelectedPathway(e.target.value)}
            style={{
              width: "100%", padding: "10px 12px", background: "var(--bg-color)", color: "var(--text-main)",
              border: "1px solid var(--border)", borderRadius: "8px", outline: "none", fontSize: "13px",
              fontFamily: "var(--font-family)", cursor: "pointer",
            }}
          >
            {pathways.map((pw) => (
              <option key={pw} value={pw}>{pw}</option>
            ))}
          </select>
        </div>

        <div style={{ width: "100%", minHeight: "350px", minWidth: 0 }}>
          <Plot
            data={viewMode === "group" ? groupTrace : [individualTrace]}
            layout={{
              ...getDarkLayout(350),
              xaxis: {
                ...getDarkLayout(350).xaxis,
                tickangle: viewMode === "group" ? 0 : -45,
                tickfont: { size: 11, family: "'Space Grotesk', sans-serif" },
              },
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: "100%", height: "100%" }}
            useResizeHandler
          />
        </div>
      </div>
    </div>
  );
}