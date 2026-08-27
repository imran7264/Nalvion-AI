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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = async (customQuestion) => {
    const questionToAsk =
      customQuestion ?? question;

    if (!questionToAsk.trim()) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnswer("");

      const data = await askNalvion(
        questionToAsk
      );

      setAnswer(data.answer);
      setQuestion(questionToAsk);
    } catch (err) {
      console.error("Ask Nalvion error:", err);

      setError(
        err.response?.data?.message ||
          "Nalvion couldn't answer that question."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleAsk();
  };

  const handleSuggestion = (suggestion) => {
    setQuestion(suggestion);
    handleAsk(suggestion);
  };

  return (
    <section className="mt-6 rounded-2xl border border-[#1E293B] bg-[#0F172A] p-5 sm:p-6">

      {/* Header */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#211A52] text-lg text-[#A78BFA]">
            ✦
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B5CF6]">
              Nalvion AI
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#F8FAFC]">
              Ask Nalvion
            </h2>
          </div>
        </div>

        <p className="text-sm leading-6 text-[#94A3B8]">
          Ask questions about your income, spending,
          savings, and financial activity.
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            placeholder="Ask Nalvion about your finances..."
            disabled={loading}
            className="
              min-w-0
              flex-1
              rounded-xl
              border border-[#1E293B]
              bg-[#070A18]
              px-4
              py-3.5
              text-sm
              text-[#F8FAFC]
              placeholder:text-[#475569]
              outline-none
              transition
              focus:border-[#7C3AED]
              focus:ring-1
              focus:ring-[#7C3AED]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          />

          <button
            type="submit"
            disabled={
              loading || !question.trim()
            }
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-gradient-to-r
              from-[#7C3AED]
              to-[#9333EA]
              px-6
              py-3.5
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
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Thinking...
              </>
            ) : (
              <>
                Ask
                <span>→</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggestions */}
      <div className="mt-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#64748B]">
          Try asking
        </p>

        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map(
            (suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() =>
                  handleSuggestion(
                    suggestion
                  )
                }
                disabled={loading}
                className="
                  rounded-full
                  border
                  border-[#1E293B]
                  bg-[#070A18]
                  px-3.5
                  py-2
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
            )
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-5 rounded-xl border border-[#3D1833] bg-[#170D18] px-4 py-3 text-sm text-[#F43F5E]">
          {error}
        </div>
      )}

      {/* Answer */}
      {answer && !error && (
        <div className="mt-6 rounded-2xl border border-[#293754] bg-[#111C31] p-5">

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] text-white shadow-lg shadow-purple-950/30">
              ✦
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[#F8FAFC]">
                  Nalvion
                </p>

                <span className="rounded-full bg-[#211A52] px-2 py-0.5 text-[10px] font-medium text-[#A78BFA]">
                  AI
                </span>
              </div>

              <p className="mt-2 text-sm leading-7 text-[#CBD5E1]">
                {answer}
              </p>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}

export default AskNalvion;