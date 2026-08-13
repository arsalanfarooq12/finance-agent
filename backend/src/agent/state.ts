import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

// Shared state that flows through every agent and subgraph
export const AgentState = Annotation.Root({
  // Full conversation history — messagesStateReducer auto-appends
  messages: Annotation<BaseMessage[]>({
    default: () => [],
    reducer: messagesStateReducer,
  }),

  // userId scopes all DB queries — set once at graph entry
  userId: Annotation<string>(),

  // Which specialist the orchestrator chose
  route: Annotation<string>({
    default: () => "",
    reducer: (_, update) => update,
  }),

  // Final answer text — set by whichever specialist runs
  finalAnswer: Annotation<string>({
    default: () => "",
    reducer: (_, update) => update,
  }),
});

export type AgentStateType = typeof AgentState.State;
