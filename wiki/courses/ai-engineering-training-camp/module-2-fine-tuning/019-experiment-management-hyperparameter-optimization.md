---
tags: [experiment-management, hyperparameter, fine-tuning, llm, lora, training, overfitting, underfitting]
source: https://u.geekbang.org/lesson/818?article=927435
---

# LLM Fine-tuning: Experiment Management & Hyperparameter Optimization

Effective LLM fine-tuning requires systematic experiment management and careful hyperparameter tuning. Rather than memorizing all parameters, practitioners focus on a small set of key variables—learning rate, LoRA rank, and training epochs—while using loss curve diagnostics to identify overfitting, underfitting, or training failure.

## Key Concepts

- **Checkpoint**: A saved snapshot of model state at a given training step, analogous to a game save. The best checkpoint is selected by lowest validation loss, not necessarily the final step.
- **Loss Function / Cost Function**: Both terms are widely mixed in literature; treat them as equivalent. Measures prediction error—minimizing this is the goal of training.
- **Learning Rate**: Controls the step size during gradient descent. Too high causes oscillation around the optimum; too low wastes compute. Typical values: `1e-4` to `1e-5`. Linear decay schedules reduce the rate as training progresses.
- **Batch Size**: Number of samples per gradient update. Larger batches are more stable but memory-intensive and risk overfitting; smaller batches add gradient noise but regularize training.
- **eval_steps**: Interval between validation evaluations and checkpoint saves. Too small wastes compute; too large risks missing the optimal checkpoint.
- **num_train_epochs**: Number of full dataset passes. Too few → underfitting; too many → overfitting. Early stopping monitors validation loss to auto-terminate.
- **Underfitting**: Validation loss decreases then rises while training is still short; fix by training longer (more epochs).
- **Overfitting**: Validation loss diverges upward from training loss; fix by adding more training data or reducing epochs.
- **LoRA Adapter mode**: Keep LoRA weights separate from the base model for flexible multi-task switching (5–10% inference overhead).
- **LoRA Merge mode**: Merge LoRA weights into the base model for zero-overhead production deployment, at the cost of losing task-switching flexibility.

## Key Takeaways

- Only three parameters need active tuning for most fine-tuning tasks: **learning rate**, **LoRA rank** (default 8), and **num_train_epochs**.
- A systematic 5-experiment arc—high LR failure → underfitting → overfitting → near-convergence → success—efficiently maps the parameter space without exhaustive search.
- Loss curves provide the first diagnostic layer; direct task testing (comparing model responses before and after fine-tuning) provides the second.
- For communication with stakeholders, always translate technical metrics into business outcomes (e.g., "dialect recognition improved from 58% to 82%" rather than "rank changed from 4 to 8").
- In production, use merged LoRA for single-task private deployments and adapter mode for multi-tenant or multi-task environments.
- Minimum recommended training data for intent classification: ~1,000 samples.

## See Also

- [[017-finetuning-concepts-and-tokenizers]]
- [[018-efficient-finetuning-practice]]
