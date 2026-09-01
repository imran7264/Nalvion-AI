import { useState } from "react";
import { askNalvion } from "../../services/aiService";

const suggestedQuestions = [
  "Where do I spend the most?",
  "Am I saving enough?",
  "What is my biggest expense?",
  "How much is left in my budget?",
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
      console.error(
        "Ask Nalvion error:",
        err
      );

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
    <section
      className="
        mt-8
        overflow-hidden
        rounded-2xl
        border
        border-[#293754]
        bg-[#0F172A]
        shadow-xl
        shadow-black/10
      "
    >
      {/* =========================================
          HEADER
      ========================================= */}

      <div
        className="
          border-b
          border-[#1E293B]
          bg-linear-to-r
          from-[#111827]
          to-[#15102B]
          px-5
          py-6
          sm:px-7
        "
      >
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

          <div>
            <div className="flex items-center gap-2">

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A78BFA]">
                Nalvion AI
              </p>

              <span className="rounded-full bg-[#211A52] px-2 py-0.5 text-[10px] font-medium text-[#C4B5FD]">
                Financial assistant
              </span>

            </div>

            <h2 className="mt-2 text-xl font-semibold text-[#F8FAFC] sm:text-2xl">
              Ask Nalvion anything
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#94A3B8]">
              Ask questions about your spending,
              income, budgets, savings, or financial
              goals.
            </p>
          </div>

        </div>
      </div>

      {/* =========================================
          CONVERSATION
      ========================================= */}

      <div className="p-5 sm:p-7">

        {/* Empty state */}

        {!answer && !loading && !error && (
          <div className="mb-7 rounded-2xl border border-[#1E293B] bg-[#070A18] p-6">

            <div className="flex items-start gap-4">

              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#211A52]
                  text-[#A78BFA]
                "
              >
                ✦
              </div>

              <div>

                <p className="text-sm font-semibold text-[#F8FAFC]">
                  How can I help?
                </p>

                <p className="mt-1 text-sm leading-6 text-[#64748B]">
                  Ask me a question and I'll analyze
                  the financial data you've recorded.
                </p>

              </div>

            </div>

          </div>
        )}

        {/* =========================================
            USER QUESTION
        ========================================= */}

        {question && (
          <div className="mb-4 flex justify-end">

            <div
              className="
                max-w-2xl
                rounded-2xl
                rounded-br-md
                bg-linear-to-r
                from-[#7C3AED]
                to-[#9333EA]
                px-5
                py-3.5
                text-sm
                leading-6
                text-white
                shadow-lg
                shadow-purple-950/20
              "
            >
              {question}
            </div>

          </div>
        )}

        {/* =========================================
            LOADING
        ========================================= */}

        {loading && (
          <div className="mb-6 flex items-start gap-3">

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
              "
            >
              ✦
            </div>

            <div className="rounded-2xl rounded-tl-md border border-[#293754] bg-[#111C31] px-5 py-4">

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 animate-pulse rounded-full bg-[#A78BFA]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#A78BFA] [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#A78BFA] [animation-delay:300ms]" />

                <span className="ml-2 text-xs text-[#64748B]">
                  Nalvion is thinking...
                </span>

              </div>

            </div>

          </div>
        )}

        {/* =========================================
            AI ANSWER
        ========================================= */}

        {answer && !loading && !error && (
          <div className="mb-7 flex items-start gap-3">

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
                shadow-purple-950/20
              "
            >
              ✦
            </div>

            <div
              className="
                max-w-3xl
                rounded-2xl
                rounded-tl-md
                border
                border-[#293754]
                bg-[#111C31]
                px-5
                py-4
              "
            >

              <div className="mb-2 flex items-center gap-2">

                <p className="text-sm font-semibold text-[#F8FAFC]">
                  Nalvion
                </p>

                <span className="rounded-full bg-[#211A52] px-2 py-0.5 text-[10px] font-medium text-[#A78BFA]">
                  AI
                </span>

              </div>

              <p className="text-sm leading-7 text-[#CBD5E1]">
                {answer}
              </p>

            </div>

          </div>
        )}

        {/* =========================================
            ERROR
        ========================================= */}

        {error && (
          <div
            className="
              mb-6
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

        {/* =========================================
            INPUT
        ========================================= */}

        <form onSubmit={handleSubmit}>

          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-[#293754]
              bg-[#070A18]
              p-2
              transition
              focus-within:border-[#7C3AED]
              focus-within:ring-1
              focus-within:ring-[#7C3AED]
            "
          >

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
                bg-transparent
                px-3
                py-2.5
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
              disabled={
                loading ||
                !question.trim()
              }
              className="
                flex
                h-10
                shrink-0
                items-center
                gap-2
                rounded-xl
                bg-linear-to-r
                from-[#7C3AED]
                to-[#9333EA]
                px-4
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-purple-950/30
                transition
                hover:from-[#8B5CF6]
                hover:to-[#A855F7]
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <span className="hidden sm:inline">
                    Ask
                  </span>

                  <span className="text-lg leading-none">
                    →
                  </span>
                </>
              )}
            </button>

          </div>

        </form>

        {/* =========================================
            SUGGESTIONS
        ========================================= */}

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

      </div>
    </section>
  );
}

export default AskNalvion;