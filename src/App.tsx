import { useState, useEffect } from 'react'
import './App.css'

const CATEGORIES: Record<string, string[]> = {
  MEDIUM: ["painting", "drawing", "print", "sculpture", "photo", "video", "installation", "digital", "textile", "hybrid"],
  METHOD: ["carve", "cast", "model", "assemble", "paint", "draw", "print", "stitch", "code", "project"],
  SUBJECT: ["figure", "nature", "object", "narrative", "abstraction", "concept", "society"],
  STYLE: ["naturalist", "realist", "idealized", "symbolic", "expressive", "abstract", "conceptual", "surreal"],
  ELEMENTS: ["geometric", "organic", "chiaroscuro", "minimalist", "layered", "atmospheric", "volumetric", "planar"],
  FUNCTION: ["ritual", "decorative", "documentary", "political", "commercial", "contemplative", "critical"],
  CONTEXT: ["studio", "public", "sacred", "domestic", "institutional", "networked", "environmental"],
  HISTORY: ["prehistoric", "ancient", "medieval", "early modern", "modern", "postmodern", "contemporary"]
};

function App() {
  const [selections, setSelections] = useState<Record<string, string>>({
    MEDIUM: "",
    METHOD: "",
    SUBJECT: "",
    STYLE: "",
    ELEMENTS: "",
    FUNCTION: "",
    CONTEXT: "",
    HISTORY: "",
  });

  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    const parts = [
      selections.HISTORY,
      selections.STYLE,
      selections.ELEMENTS,
      selections.FUNCTION,
      selections.SUBJECT,
      selections.MEDIUM,
      selections.METHOD ? `made via ${selections.METHOD}` : "",
      selections.CONTEXT ? `in a ${selections.CONTEXT} context` : "",
    ].filter(Boolean);

    setPrompt(parts.join(", "));
  }, [selections]);

  const handleSelect = (category: string, value: string) => {
    setSelections(prev => ({
      ...prev,
      [category]: prev[category] === value ? "" : value
    }));
  };

  const randomize = () => {
    const newSelections: Record<string, string> = {};
    Object.keys(CATEGORIES).forEach(cat => {
      const options = CATEGORIES[cat as keyof typeof CATEGORIES];
      newSelections[cat] = options[Math.floor(Math.random() * options.length)];
    });
    setSelections(newSelections);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(prompt);
  };

  return (
    <>
      <section id="center">
        <div className="header">
          <h1>Cortex Twister</h1>
          <p>Visual Art Prompt Generator</p>
        </div>

        <div className="generator-container">
          <div className="categories-grid">
            {Object.entries(CATEGORIES).map(([category, options]) => (
              <div key={category} className="category-group">
                <h3>{category}</h3>
                <div className="options-list">
                  {options.map(option => (
                    <button
                      key={option}
                      className={`option-btn ${selections[category] === option ? 'active' : ''}`}
                      onClick={() => handleSelect(category, option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="prompt-display">
            <h2>Generated Prompt</h2>
            <div className="prompt-box">
              <code>{prompt || "Select options to generate a prompt..."}</code>
            </div>
            <div className="actions">
              <button onClick={randomize} className="action-btn">Randomize</button>
              <button onClick={copyToClipboard} className="action-btn" disabled={!prompt}>Copy to Clipboard</button>
            </div>
          </div>
        </div>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <h2>How it works</h2>
          <p>Combine categories to generate nuanced image prompts for AI models or artistic exploration.</p>
          <p className="formula">Formula: HISTORY + STYLE + ELEMENTS + FUNCTION + SUBJECT + MEDIUM + METHOD + CONTEXT</p>
        </div>
        <div id="social">
          <h2>Reference Data</h2>
          <p>Derived from <code>references/</code> directory taxonomies and art-compatibility matrices.</p>
          <div className="reference-links">
             <span>art.txt</span>
             <span>art-types-index.txt</span>
             <span>art-compatibility-matrix.txt</span>
          </div>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
