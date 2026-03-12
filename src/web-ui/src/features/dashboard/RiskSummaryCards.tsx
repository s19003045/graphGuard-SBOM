export function RiskSummaryCards() {
  return (
    <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
      <article style={{ padding: 12, border: "1px solid #ddd" }}>
        <h3>Threatened Projects</h3>
        <strong>0</strong>
      </article>
      <article style={{ padding: 12, border: "1px solid #ddd" }}>
        <h3>Open CVEs</h3>
        <strong>0</strong>
      </article>
      <article style={{ padding: 12, border: "1px solid #ddd" }}>
        <h3>High-Risk Licenses</h3>
        <strong>0</strong>
      </article>
    </section>
  );
}
