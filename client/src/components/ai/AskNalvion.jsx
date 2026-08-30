import { useState } from "react";
import { askNalvion } from "../../services/aiService";

const suggestedQuestions = [
  "Where do I spend the most?",
  "Am I saving enough?",
  "What is my biggest expense?",
  "How can I reduce my spending?",
];

function AskNalvion() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [askedQuestion, setAskedQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================
  // ASK NALVION
  // =========================================

  const handleAsk = async (customQuestion = question) => {
    const questionToAsk = customQuestion.trim();

    if (!questionToAsk) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnswer("");
      setAskedQuestion(questionToAsk);

      const data = await askNalvion(questionToAsk);

      setAnswer(data?.answer || "I couldn't generate an answer right now.");
    } catch (err) {
      console.error("Ask Nalvion error:", err);

      setError(
        err.response?.data?.message || "Nalvion couldn't answer that question.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // FORM SUBMIT
  // =========================================

  const handleSubmit = (event) => {
    event.preventDefault();

    handleAsk();
  };

  // =========================================
  // SUGGESTION
  // =========================================

  const handleSuggestion = (suggestion) => {
    setQuestion(suggestion);
    handleAsk(suggestion);
  };

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-[#293754]
        bg-[#0F172A]
        shadow-xl
        shadow-black/10
      "
    >
      {/* =====================================
          BACKGROUND GLOW
      ===================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -right-24
          -top-24
          h-64
          w-64
          rounded-full
          bg-[#7C3AED]/10
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-24
          -left-24
          h-64
          w-64
          rounded-full
          bg-[#4C1D95]/10
          blur-3xl
        "
      />

      <div className="relative p-5 sm:p-7">
        {/* ===================================
            HEADER
        =================================== */}

        <div className="mb-7">
          <div className="flex items-start gap-4">
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-linear-to-br
                from-[#7C3AED]
                to-[#9333EA]
                text-xl
                text-white
                shadow-lg
                shadow-purple-950/30
              "
            >
              ✦
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-[#A78BFA]
                  "
                >
                  Nalvion AI
                </p>

                <span
                  className="
                    rounded-full
                    border
                    border-[#293754]
                    bg-[#070A18]
                    px-2
                    py-0.5
                    text-[10px]
                    font-medium
                    text-[#64748B]
                  "
                >
                  Assistant
                </span>
              </div>

              <h2
                className="
                  mt-1
                  text-2xl
                  font-semibold
                  tracking-tight
                  text-[#F8FAFC]
                "
              >
                What would you like to know?
              </h2>
            </div>
          </div>

          <p
            className="
              mt-4
              max-w-2xl
              text-sm
              leading-6
              text-[#94A3B8]
            "
          >
            Ask Nalvion about your spending, savings, budgets, goals, or
            anything else related to your financial activity.
          </p>
        </div>

        {/* ===================================
            INPUT
        =================================== */}

        <form onSubmit={handleSubmit}>
          <div
            className="
              flex
              flex-col
              gap-3
              rounded-2xl
              border
              border-[#293754]
              bg-[#070A18]
              p-2
              sm:flex-row
            "
          >
            <input
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask Nalvion about your finances..."
              disabled={loading}
              className="
                min-w-0
                flex-1
                bg-transparent
                px-3
                py-3
                text-sm
                text-[#F8FAFC]
                placeholder:text-[#475569]
                outline-none
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />

            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="
                flex
                min-h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-linear-to-r
                from-[#7C3AED]
                to-[#9333EA]
                px-6
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-purple-950/30
                transition
                hover:from-[#8B5CF6]
                hover:to-[#A855F7]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading ? (
                <>
                  <span
                    className="
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-white/30
                      border-t-white
                    "
                  />
                  Thinking...
                </>
              ) : (
                <>
                  Ask
                  <span className="text-base">→</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* ===================================
            SUGGESTIONS
        =================================== */}

        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[#64748B]">
              Try asking
            </span>

            <span className="h-px flex-1 bg-[#1E293B]" />
          </div>

          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestion(suggestion)}
                disabled={loading}
                className="
                    rounded-xl
                    border
                    border-[#1E293B]
                    bg-[#070A18]
                    px-3.5
                    py-2.5
                    text-xs
                    font-medium
                    text-[#94A3B8]
                    transition
                    hover:border-[#7C3AED]
                    hover:bg-[#17112D]
                    hover:text-[#C4B5FD]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* ===================================
            ERROR
        =================================== */}

        {error && (
          <div
            className="
              mt-6
              rounded-xl
              border
              border-[#3D1833]
              bg-[#170D18]
              px-4
              py-3
              text-sm
              text-[#F43F5E]
            "
          >
            {error}
          </div>
        )}

        {/* ===================================
            CONVERSATION
        =================================== */}

        {(askedQuestion || answer || loading) && !error && (
          <div className="mt-7">
            <div className="mb-4 h-px bg-[#1E293B]" />

            {/* User question */}

            {askedQuestion && (
              <div className="mb-4 flex justify-end">
                <div
                  className="
                      max-w-[85%]
                      rounded-2xl
                      rounded-br-md
                      bg-[#211A52]
                      px-4
                      py-3
                      text-sm
                      leading-6
                      text-[#E9D5FF]
                    "
                >
                  {askedQuestion}
                </div>
              </div>
            )}

            {/* AI response */}

            <div className="flex items-start gap-3">
              <div
                className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-linear-to-br
                    from-[#7C3AED]
                    to-[#9333EA]
                    text-white
                    shadow-lg
                    shadow-purple-950/30
                  "
              >
                ✦
              </div>

              <div
                className="
                    min-w-0
                    flex-1
                    rounded-2xl
                    rounded-tl-md
                    border
                    border-[#293754]
                    bg-[#111C31]
                    p-4
                  "
              >
                <div className="mb-2 flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#F8FAFC]">
                    Nalvion
                  </p>

                  <span
                    className="
                        rounded-full
                        bg-[#211A52]
                        px-2
                        py-0.5
                        text-[10px]
                        font-medium
                        text-[#A78BFA]
                      "
                  >
                    AI
                  </span>
                </div>

                {loading ? (
                  <div className="flex items-center gap-2 py-2">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#8B5CF6]" />

                    <span
                      className="
                          h-2
                          w-2
                          animate-bounce
                          rounded-full
                          bg-[#8B5CF6]
                        "
                      style={{
                        animationDelay: "120ms",
                      }}
                    />

                    <span
                      className="
                          h-2
                          w-2
                          animate-bounce
                          rounded-full
                          bg-[#8B5CF6]
                        "
                      style={{
                        animationDelay: "240ms",
                      }}
                    />
                  </div>
                ) : (
                  <p
                    className="
                        text-sm
                        leading-7
                        text-[#CBD5E1]
                      "
                  >
                    {answer}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default AskNalvion;
