這是一份針對大廠面試量身打造的 **GraphGuard SBOM** 升級版規格書。作為技術長，我特別優化了技術棧的選擇，這套組合（.NET 8 + Neo4j + TypeScript）正是目前跨國企業處理複雜資產關聯的主流架構。

---

## 專案名稱：GraphGuard SBOM 2.0 (Enterprise Edition)

**定位：** 企業級多語言軟體供應鏈安全監測平台，專注於解決「遞迴依賴」引發的資安漏洞風險。

---

## 1. 核心技術棧與選擇理由 (Interview Highlights)

| 組件 | 技術選擇 | 優化理由 (面試時的關鍵回答) |
| --- | --- | --- |
| **前端** | **React + TS + Vite** | **Vite** 提供極速開發體驗；**TypeScript** 展現對大型專案維護性的重視。 |
| **視覺化** | **D3.js** | 展現處理複雜 Canvas/SVG 繪圖能力，動態呈現數千個套件間的關聯圖。 |
| **後端** | **ASP.NET Core 8.0** | 利用 .NET 8 的高性能、原生 AOT 與強大的依賴注入 (DI) 架構，符合大廠開發規範。 |
| **關聯資料庫** | **SQL Server** | 處理結構化資料（使用者、權限 RBAC、審計日誌），確保 ACID 特性。 |
| **圖資料庫** | **Neo4j (Cypher)** | 針對「深層依賴掃描」具備 $O(1)$ 的查詢性能。Cypher 比起 SPARQL 在 Property Graph 建模上更具靈活性。 |
| **AI 層** | **Semantic Kernel (.NET)** | **強烈建議選擇此項。** 這能展示你能在不離開 .NET 生態系下整合 LLM，是微軟生態大廠極其看重的技能。 |

---

## 2. 系統功能規格

### A. 多語言 SBOM 自動化注入引擎

* **功能：** 支援上傳 Node.js (`cyclonedx-npm` 產出) 與 Python (`cyclonedx-py` 產出) 的標準 JSON。
* **技術點：** 後端實作 **Strategy Pattern (策略模式)**，根據上傳的 BOM 類型自動切換解析邏輯。

### B. Neo4j 全域依賴圖譜 (Dependency Graph)

* **功能：** 建立橫跨公司所有專案的圖譜。
* **Cypher 應用：** 實作「爆炸半徑分析 (Blast Radius Analysis)」。
* *查詢範例：* 「如果 `Lodash 4.17.21` 出現漏洞，全公司有哪些專案的第 N 層依賴會受影響？」



### C. 智慧漏洞補丁助手 (AI RAG)

* **功能：** 串接 NVD (National Vulnerability Database)。
* **Semantic Kernel 應用：** * **Planner:** 自動規劃「分析漏洞 -> 查詢文件 -> 生成 PowerShell/Bash 升級腳本」的流程。
* **RAG:** 將 CVE 描述與公司內部開發規範 (Coding Standard) 結合，生成客製化的修復建議。



### D. 企業級權限與稽核系統

* **功能：** 使用 SQL Server 儲存 **RBAC (Role-Based Access Control)**。
* **技術點：** 實作 **JWT Authentication** 與 **Refresh Token** 機制，並記錄所有漏洞忽略 (Ignore) 的操作紀錄（資安合規需求）。

---

## 3. 數據模型優化 (Hybrid Database Design)

### SQL Server (結構化資料)

* `Users`: ID, Email, PasswordHash, Role.
* `Projects`: ID, Name, Language, GitUrl, LastScanTime.
* `ScanLogs`: ID, ProjectID, Status, FindingsCount.

### Neo4j (非結構化關聯)

* **Node Labels:** `:Project`, `:Package`, `:Version`, `:Vulnerability`.
* **Relationships:** * `(:Project)-[:USES]->(:Package)`
* `(:Package)-[:DEPENDS_ON]->(:Package)`
* `(:Package)-[:HAS_VULNERABILITY]->(:Vulnerability)`



---

## 4. 前端視覺化設計 (D3.js + React)

請參考 fontend_spec.md

---

## 5.專業 Monorepo 目錄結構建議
Plaintext
GraphGuard-SBOM/
├── .github/                # CI/CD 自動化流程 (GitHub Actions)
├── docs/                   # 系統架構圖、API 文件、資料庫 Schema (ERD)
├── src/                    # 源碼主目錄
│   ├── web-ui/             # [Frontend] React.js + Vite + TS
│   ├── api-server/         # [Backend] ASP.NET Core 8.0 Web API
│   │   ├── GraphGuard.API/
│   │   ├── GraphGuard.Domain/
│   │   └── GraphGuard.Infrastructure/ (包含 SQL & Neo4j 邏輯)
│   ├── ai-service/         # [AI Layer] Semantic Kernel 整合層
│   └── scripts/            # [Tools] Python 腳本 (用於產出 Node.js/Python BOM)
├── deployments/            # 部署相關配置
│   ├── docker-compose.yml  # 一鍵啟動所有服務 (SQL, Neo4j, API, UI)
│   └── nginx.conf
├── tests/                  # 測試套件 (Unit Tests, Integration Tests)
├── .gitignore
├── README.md               # 專案門面 (包含安裝步驟與技術亮點)
└── LICENSE

