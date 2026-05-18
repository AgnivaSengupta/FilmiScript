import { StateGraph, START, END } from "@langchain/langgraph";
import { GraphState } from "./state";
import { storyAgentNode } from "./storyAgent";
import { charAgentNode } from "./charAgent";
import { sceneAgentNode } from "./sceneAgent";
import { dialogueAgentNode } from "./dialogueAgent";

/**
 * Builds the FilmiScript LangGraph pipeline.
 *
 * Flow: START → storyAgent → charAgent → sceneAgent → dialogueAgent → END
 *
 * Each node receives the full accumulated GraphState, so downstream agents
 * always have complete context from all previous agents.
 */
export function buildGraph() {
  const workflow = new StateGraph(GraphState)
    .addNode("storyAgent", storyAgentNode)
    .addNode("charAgent", charAgentNode)
    .addNode("sceneAgent", sceneAgentNode)
    .addNode("dialogueAgent", dialogueAgentNode)
    .addEdge(START, "storyAgent")
    .addEdge("storyAgent", "charAgent")
    .addEdge("charAgent", "sceneAgent")
    .addEdge("sceneAgent", "dialogueAgent")
    .addEdge("dialogueAgent", END);

  return workflow.compile();
}
