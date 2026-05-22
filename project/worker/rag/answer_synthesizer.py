from local_models.model_runner import local_llm

class AnswerSynthesizer:
    def synthesize(self, prompt: str, context: str) -> str:
        """
        Generates the final answer using the Local LLM.
        """
        if not context:
            # If no context, try direct gen or generic fallback
            return local_llm.generate(prompt)
            
        return local_llm.generate(prompt, context)

synthesizer = AnswerSynthesizer()
