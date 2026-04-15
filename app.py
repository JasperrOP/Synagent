import streamlit as st
import time
from agents import build_reader_agent, build_search_agent, writer_chain, critic_chain

# ── Page config ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Synagent · AI Research Agent",
    page_icon="🔬",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── Session state init ────────────────────────────────────────────────────────
for key in ("results", "running", "done", "theme"):
    if key not in st.session_state:
        st.session_state[key] = {} if key == "results" else (False if key in ["running", "done"] else "dark")

def toggle_theme():
    st.session_state.theme = "light" if st.session_state.theme == "dark" else "dark"

# ── Theme CSS Variables ───────────────────────────────────────────────────────
if st.session_state.theme == "dark":
    theme_css = """
    :root {
        --bg-main: #141415;
        --bg-grad: rgba(255, 255, 255, 0.02);
        --text-main: #ffffff;
        --text-muted: #8e8e93;
        --card-bg: rgba(255, 255, 255, 0.03);
        --card-border: rgba(255, 255, 255, 0.1);
        --accent: #ffffff;
        --accent-glow: rgba(255, 255, 255, 0.1);
        --btn-bg: #ffffff;
        --btn-text: #141415;
        --btn-hover: #e5e5ea;
        --input-bg: rgba(0, 0, 0, 0.4);
        --step-done: #666666;
    }
    """
else:
    theme_css = """
    :root {
        --bg-main: #f5f5f7;
        --bg-grad: rgba(0, 0, 0, 0.02);
        --text-main: #1d1d1f;
        --text-muted: #86868b;
        --card-bg: rgba(255, 255, 255, 0.8);
        --card-border: rgba(0, 0, 0, 0.1);
        --accent: #1d1d1f;
        --accent-glow: rgba(0, 0, 0, 0.08);
        --btn-bg: #1d1d1f;
        --btn-text: #ffffff;
        --btn-hover: #333336;
        --input-bg: rgba(255, 255, 255, 0.9);
        --step-done: #86868b;
    }
    """

st.markdown(f"<style>{theme_css}</style>", unsafe_allow_html=True)

# ── Custom CSS ────────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

/* ── Reset & base ── */
html, body, [class*="css"] {
    font-family: 'DM Sans', sans-serif;
    color: var(--text-main);
}

.stApp {
    background: var(--bg-main);
    background-image:
        radial-gradient(ellipse 80% 50% at 20% -10%, var(--bg-grad) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 80% 110%, var(--bg-grad) 0%, transparent 55%);
    transition: background 0.3s ease;
}

/* ── Hide default streamlit chrome ── */
#MainMenu, footer, header { visibility: hidden; }
.block-container { padding: 2rem 3rem 4rem; max-width: 1200px; }

/* ── Top Bar ── */
.top-bar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
}

/* ── Hero header ── */
.hero {
    text-align: center;
    padding: 2.5rem 0 2.5rem;
    position: relative;
}
.hero-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 1rem;
}
.hero h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2.8rem, 6vw, 5rem);
    font-weight: 800;
    line-height: 1.0;
    letter-spacing: -0.03em;
    color: var(--text-main);
    margin: 0 0 1rem;
}
.hero h1 span {
    color: var(--text-main);
    opacity: 0.7;
}
.hero-sub {
    font-size: 1.05rem;
    font-weight: 400;
    color: var(--text-muted);
    max-width: 520px;
    margin: 0 auto;
    line-height: 1.65;
}

/* ── Divider ── */
.divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--card-border), transparent);
    margin: 2rem 0;
}

/* ── Input card ── */
.input-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 2rem 2.5rem;
    margin-bottom: 2rem;
    backdrop-filter: blur(12px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}

/* ── Streamlit input overrides ── */
.stTextInput > div > div > input {
    background: var(--input-bg) !important;
    border: 1px solid var(--card-border) !important;
    border-radius: 10px !important;
    color: var(--text-main) !important;
    font-family: 'DM Sans', sans-serif !important;
    font-size: 1rem !important;
    padding: 0.75rem 1rem !important;
    transition: all 0.3s ease !important;
}
.stTextInput > div > div > input:focus {
    border-color: var(--accent) !important;
    box-shadow: 0 0 0 2px var(--accent-glow) !important;
}
.stTextInput > label {
    font-family: 'DM Mono', monospace !important;
    font-size: 0.72rem !important;
    letter-spacing: 0.15em !important;
    text-transform: uppercase !important;
    color: var(--text-main) !important;
    font-weight: 600 !important;
}

/* ── Buttons ── */
.stButton > button {
    background: var(--btn-bg) !important;
    color: var(--btn-text) !important;
    font-family: 'Syne', sans-serif !important;
    font-weight: 700 !important;
    font-size: 0.95rem !important;
    letter-spacing: 0.04em !important;
    border: 1px solid var(--accent) !important;
    border-radius: 10px !important;
    padding: 0.7rem 2.2rem !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
    width: 100%;
}
.stButton > button:hover {
    background: var(--btn-hover) !important;
    transform: translateY(-1px) !important;
}
.stButton > button:active {
    transform: translateY(0) !important;
}

/* Small toggle button override */
[data-testid="column"]:nth-child(2) .stButton > button {
    width: auto;
    float: right;
    padding: 0.4rem 1rem !important;
    font-size: 0.8rem !important;
    background: transparent !important;
    color: var(--text-main) !important;
    border: 1px solid var(--card-border) !important;
    white-space: nowrap !important; /* Prevents text from breaking into two lines */
}
[data-testid="column"]:nth-child(2) .stButton > button:hover {
    background: var(--card-bg) !important;
    border-color: var(--text-muted) !important;
}

/* ── Pipeline step cards ── */
.step-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 14px;
    padding: 1.5rem 1.8rem;
    margin-bottom: 1.2rem;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    backdrop-filter: blur(8px);
}
.step-card.active {
    border-color: var(--accent);
    box-shadow: 0 0 15px var(--accent-glow);
}
.step-card.done {
    border-color: var(--card-border);
    opacity: 0.8;
}
.step-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 4px;
    border-radius: 14px 0 0 14px;
    background: transparent;
    transition: background 0.3s ease;
}
.step-card.active::before { 
    background: var(--accent); 
}
.step-card.done::before { 
    background: var(--step-done); 
}

.step-header {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 0.3rem;
}
.step-num {
    font-family: 'DM Mono', monospace;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    color: var(--text-muted);
}
.step-title {
    font-family: 'Syne', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-main);
}
.step-status {
    margin-left: auto;
    font-family: 'DM Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    font-weight: 600;
}
.status-waiting  { color: var(--text-muted); opacity: 0.5; }
.status-running  { color: var(--accent); }
.status-done     { color: var(--text-muted); }

/* ── Result panels ── */
.result-panel {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 14px;
    padding: 1.8rem 2rem;
    margin-top: 1rem;
    margin-bottom: 1.5rem;
}
.result-panel-title {
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text-main);
    margin-bottom: 1rem;
    padding-bottom: 0.7rem;
    border-bottom: 1px solid var(--card-border);
}
.result-content {
    font-size: 0.92rem;
    line-height: 1.8;
    color: var(--text-muted);
    white-space: pre-wrap;
    font-family: 'DM Sans', sans-serif;
}

/* ── Report & feedback panels ── */
.report-panel, .feedback-panel {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 2rem 2.5rem;
    margin-top: 1rem;
}
.panel-label {
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 1.2rem;
    padding-bottom: 0.7rem;
    color: var(--text-main);
    border-bottom: 1px solid var(--card-border);
}

/* ── Progress text ── */
.stSpinner > div > div { border-color: var(--accent) !important; border-bottom-color: transparent !important; }
.stSpinner > div > span { color: var(--text-main) !important; font-family: 'DM Mono', monospace; font-size: 0.85rem;}

/* ── Expander ── */
details summary {
    font-family: 'DM Mono', monospace !important;
    font-size: 0.75rem !important;
    color: var(--text-muted) !important;
    letter-spacing: 0.1em !important;
    cursor: pointer;
    transition: color 0.2s;
}
details summary:hover {
    color: var(--text-main) !important;
}

/* ── Section heading ── */
.section-heading {
    font-family: 'Syne', sans-serif;
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text-main);
    margin: 2rem 0 1rem;
}

/* ── Toast-style notice ── */
.notice {
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    color: var(--text-muted);
    text-align: center;
    margin-top: 3rem;
    letter-spacing: 0.08em;
}
</style>
""", unsafe_allow_html=True)


# ── Top Bar Theme Toggle ──────────────────────────────────────────────────────
# Slightly widened the right column to give the button more native space
col_spacer1, col_theme = st.columns([8.8, 1.2])
with col_theme:
    icon = "🌙" if st.session_state.theme == "light" else "☀️"
    st.button(f"{icon} Theme", on_click=toggle_theme, key="theme_btn")


# ── Helper: render a step card ────────────────────────────────────────────────
def step_card(num: str, title: str, state: str, desc: str = ""):
    status_map = {
        "waiting": ("WAITING", "status-waiting"),
        "running": ("● RUNNING", "status-running"),
        "done":    ("✓ DONE",   "status-done"),
    }
    label, cls = status_map.get(state, ("", ""))
    card_cls = {"running": "active", "done": "done"}.get(state, "")
    st.markdown(f"""
    <div class="step-card {card_cls}">
        <div class="step-header">
            <span class="step-num">{num}</span>
            <span class="step-title">{title}</span>
            <span class="step-status {cls}">{label}</span>
        </div>
        {"<div style='font-size:0.82rem;color:var(--text-muted);margin-top:0.3rem;'>"+desc+"</div>" if desc else ""}
    </div>
    """, unsafe_allow_html=True)


# ── Hero ──────────────────────────────────────────────────────────────────────
st.markdown("""
<div class="hero">
    <div class="hero-eyebrow">Multi-Agent AI System</div>
    <h1>Syn<span>agent</span></h1>
    <p class="hero-sub">
        Four specialized AI agents collaborate — searching, scraping, writing,
        and critiquing — to deliver a polished research report on any topic.
    </p>
</div>
<div class="divider"></div>
""", unsafe_allow_html=True)


# ── Layout: input left, pipeline right ───────────────────────────────────────
col_input, col_spacer, col_pipeline = st.columns([5, 0.5, 4])

with col_input:
    st.markdown('<div class="input-card">', unsafe_allow_html=True)
    topic = st.text_input(
        "Research Topic",
        placeholder="e.g. Quantum computing breakthroughs in 2025",
        key="topic_input",
        label_visibility="visible",
    )
    run_btn = st.button("⚡  Run Research Pipeline", use_container_width=True)
    st.markdown('</div>', unsafe_allow_html=True)

    # Example chips
    st.markdown("""
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.5rem;">
        <span style="font-family:'DM Mono',monospace;font-size:0.68rem;color:var(--text-muted);letter-spacing:0.1em;padding-top:4px;">TRY →</span>
    """, unsafe_allow_html=True)
    examples = ["LLM agents 2025", "CRISPR gene editing", "Fusion energy progress"]
    for ex in examples:
        st.markdown(f"""
        <span style="
            background:var(--card-bg);
            border:1px solid var(--card-border);
            border-radius:6px;
            padding:0.25rem 0.7rem;
            font-size:0.75rem;
            color:var(--text-muted);
            font-family:'DM Sans',sans-serif;
            cursor:default;
            transition: all 0.2s ease;
        " onmouseover="this.style.borderColor='var(--accent)'; this.style.color='var(--text-main)';" onmouseout="this.style.borderColor='var(--card-border)'; this.style.color='var(--text-muted)';">{ex}</span>
        """, unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

with col_pipeline:
    st.markdown('<div class="section-heading">Pipeline</div>', unsafe_allow_html=True)

    r = st.session_state.results
    done = st.session_state.done

    def s(step):
        if not r:
            return "waiting"
        steps = ["search", "reader", "writer", "critic"]
        idx = steps.index(step)
        completed = list(r.keys())
        # figure out which steps are done
        if step in r:
            return "done"
        # which step is running now (first not in r)
        if st.session_state.running:
            for i, k in enumerate(steps):
                if k not in r:
                    return "running" if k == step else "waiting"
        return "waiting"

    step_card("01", "Search Agent",  s("search"), "Gathers recent web information")
    step_card("02", "Reader Agent",  s("reader"), "Scrapes & extracts deep content")
    step_card("03", "Writer Chain",  s("writer"), "Drafts the full research report")
    step_card("04", "Critic Chain",  s("critic"), "Reviews & scores the report")


# ── Run pipeline ──────────────────────────────────────────────────────────────
if run_btn:
    if not topic.strip():
        st.warning("Please enter a research topic first.")
    else:
        st.session_state.results = {}
        st.session_state.running = True
        st.session_state.done = False
        st.rerun()

if st.session_state.running and not st.session_state.done:
    results = {}
    topic_val = st.session_state.topic_input

    # ── Step 1: Search ──
    with st.spinner("🔍  Search Agent is working…"):
        search_agent = build_search_agent()
        sr = search_agent.invoke({
            "messages": [("user", f"Find recent, reliable and detailed information about: {topic_val}")]
        })
        results["search"] = sr["messages"][-1].content
        st.session_state.results = dict(results)
    st.rerun() if False else None   # keep inline for now

    # ── Step 2: Reader ──
    with st.spinner("📄  Reader Agent is scraping top resources…"):
        reader_agent = build_reader_agent()
        rr = reader_agent.invoke({
            "messages": [("user",
                f"Based on the following search results about '{topic_val}', "
                f"pick the most relevant URL and scrape it for deeper content.\n\n"
                f"Search Results:\n{results['search'][:800]}"
            )]
        })
        results["reader"] = rr["messages"][-1].content
        st.session_state.results = dict(results)

    # ── Step 3: Writer ──
    with st.spinner("✍️  Writer is drafting the report…"):
        research_combined = (
            f"SEARCH RESULTS:\n{results['search']}\n\n"
            f"DETAILED SCRAPED CONTENT:\n{results['reader']}"
        )
        results["writer"] = writer_chain.invoke({
            "topic": topic_val,
            "research": research_combined
        })
        st.session_state.results = dict(results)

    # ── Step 4: Critic ──
    with st.spinner("🧐  Critic is reviewing the report…"):
        results["critic"] = critic_chain.invoke({
            "report": results["writer"]
        })
        st.session_state.results = dict(results)

    st.session_state.running = False
    st.session_state.done = True
    st.rerun()


# ── Results display ───────────────────────────────────────────────────────────
r = st.session_state.results

if r:
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
    st.markdown('<div class="section-heading">Results</div>', unsafe_allow_html=True)

    # Raw outputs in expanders
    if "search" in r:
        with st.expander("🔍 Search Results (raw)", expanded=False):
            st.markdown(f'<div class="result-panel"><div class="result-panel-title">Search Agent Output</div>'
                        f'<div class="result-content">{r["search"]}</div></div>', unsafe_allow_html=True)

    if "reader" in r:
        with st.expander("📄 Scraped Content (raw)", expanded=False):
            st.markdown(f'<div class="result-panel"><div class="result-panel-title">Reader Agent Output</div>'
                        f'<div class="result-content">{r["reader"]}</div></div>', unsafe_allow_html=True)

    # Final report
    if "writer" in r:
        st.markdown("""
        <div class="report-panel">
            <div class="panel-label">📝 Final Research Report</div>
        """, unsafe_allow_html=True)
        st.markdown(r["writer"])   # render markdown natively
        st.markdown("</div>", unsafe_allow_html=True)

        # Download
        st.download_button(
            label="⬇  Download Report (.md)",
            data=r["writer"],
            file_name=f"research_report_{int(time.time())}.md",
            mime="text/markdown",
        )

    # Critic feedback
    if "critic" in r:
        st.markdown("""
        <div class="feedback-panel">
            <div class="panel-label">🧐 Critic Feedback</div>
        """, unsafe_allow_html=True)
        st.markdown(r["critic"])
        st.markdown("</div>", unsafe_allow_html=True)


# ── Footer ────────────────────────────────────────────────────────────────────
st.markdown("""
<div class="notice">
    Synagent · Powered by LangChain multi-agent pipeline · Built with Streamlit
</div>
""", unsafe_allow_html=True)