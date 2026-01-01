================ RUN ALL AGENTS ================

UI_AGENT RUN:
--------------------------------
base_prompt = ./agents/UI_AGENT/prompt_base.txt
task_input = ./agents/UI_AGENT/task_input.txt
output_format = "UI Layout + Components"
EXECUTE


BACKEND_AGENT RUN:
--------------------------------
base_prompt = ./agents/BACKEND_AGENT/prompt_base.txt
task_input = ./agents/BACKEND_AGENT/task_input.txt
output_format = "Endpoints + DB Schema"
EXECUTE


DOC_AGENT RUN:
--------------------------------
base_prompt = ./agents/DOC_AGENT/prompt_base.txt
task_input = ./agents/DOC_AGENT/task_input.txt
output_format = "System Documentation PDF Text"
EXECUTE


QA_AGENT RUN:
--------------------------------
base_prompt = ./agents/QA_AGENT/prompt_base.txt
task_input = ./agents/QA_AGENT/task_input.txt
output_format = "Test Cases + Pass/Fail"
EXECUTE

================================================
