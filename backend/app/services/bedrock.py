import json
from typing import List, Dict, Any, Tuple
from ..config import settings

async def answer_with_bedrock(question: str, notes_context: List[Dict[str, Any]]) -> Tuple[str, List[int], str]:
    """
    Calls Bedrock Converse API if enabled and configured;
    Otherwise provides an intelligent local fallback synthesizing the retrieved notes.
    """
    source_ids = [n["id"] for n in notes_context]

    if settings.ENABLE_BEDROCK:
        try:
            import boto3
            client = boto3.client("bedrock-runtime", region_name=settings.AWS_REGION)

            context_str = "\n\n".join(
                f"[Note #{n['id']}] {n['title']}:\n{n['text']}"
                for n in notes_context
            )

            system_prompts = [
                {
                    "text": (
                        "You are VoiceDesk's voice assistant. Answer the user's question grounded strictly "
                        "on the provided user notes. Keep the answer concise (under 40 words) and suitable "
                        "for being spoken aloud. Cite note IDs like [Note #1]."
                    )
                }
            ]

            messages = [
                {
                    "role": "user",
                    "content": [
                        {
                            "text": f"Context notes:\n{context_str}\n\nQuestion: {question}"
                        }
                    ]
                }
            ]

            response = client.converse(
                modelId=settings.BEDROCK_MODEL_ID,
                messages=messages,
                system=system_prompts,
                inferenceConfig={"maxTokens": 150, "temperature": 0.2}
            )

            output_text = response["output"]["message"]["content"][0]["text"]
            return output_text, source_ids, output_text

        except Exception as e:
            # Fall back safely on error or missing AWS credentials
            pass

    # Intelligent deterministic fallback (AWS Builder mini-challenge fallback when offline)
    primary = notes_context[0]
    excerpt = primary["text"]
    if len(excerpt) > 120:
        excerpt = excerpt[:120] + "..."
    answer = f"According to [Note #{primary['id']}] '{primary['title']}': {excerpt}"
    speech = f"Based on your notes: {primary['title']} - {excerpt}"
    return answer, [primary["id"]], speech
