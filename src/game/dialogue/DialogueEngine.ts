import type { DialogueNode, DialogueChoice, DialogueAction } from '../../types/dialogue';
import { getDialogue } from '../../data/dialogue';

export interface DialogueSession {
  dialogueId: string;
  nodes: DialogueNode[];
  current: DialogueNode;
  displayedText: string;
  complete: boolean;
  choiceIndex: number;
}

export class DialogueEngine {
  private session: DialogueSession | null = null;
  private charIndex = 0;
  private timer = 0;
  private charsPerSecond = 40;

  start(dialogueId: string, startNodeId?: string): DialogueSession {
    const nodes = getDialogue(dialogueId);
    // Honor startNodeId for gym battles, professor after-starter, win scenes, etc.
    const current =
      (startNodeId ? nodes.find((n) => n.id === startNodeId) : undefined) ?? nodes[0];

    this.session = {
      dialogueId,
      nodes,
      current,
      displayedText: '',
      complete: false,
      choiceIndex: 0,
    };
    this.charIndex = 0;
    this.timer = 0;
    return this.session;
  }

  /** One-shot typewriter box (signs, inspect text) — GBA style */
  startEphemeral(speaker: string, text: string): DialogueSession {
    const node: DialogueNode = { id: 'ephemeral', speaker, text };
    this.session = {
      dialogueId: '__ephemeral__',
      nodes: [node],
      current: node,
      displayedText: '',
      complete: false,
      choiceIndex: 0,
    };
    this.charIndex = 0;
    this.timer = 0;
    return this.session;
  }

  setTextSpeed(speed: 'slow' | 'normal' | 'fast'): void {
    this.charsPerSecond = speed === 'slow' ? 20 : speed === 'fast' ? 80 : 40;
  }

  getSession(): DialogueSession | null {
    return this.session;
  }

  update(dt: number): void {
    if (!this.session || this.session.complete) return;
    if (this.charIndex >= this.session.current.text.length) return;
    this.timer += dt;
    const advance = Math.floor(this.timer * this.charsPerSecond);
    if (advance > 0) {
      this.timer = 0;
      this.charIndex = Math.min(
        this.session.current.text.length,
        this.charIndex + advance,
      );
      this.session.displayedText = this.session.current.text.slice(0, this.charIndex);
    }
  }

  isTextComplete(): boolean {
    if (!this.session) return true;
    return this.charIndex >= this.session.current.text.length;
  }

  skipTypewriter(): void {
    if (!this.session) return;
    this.charIndex = this.session.current.text.length;
    this.session.displayedText = this.session.current.text;
  }

  hasChoices(): boolean {
    return (this.session?.current.choices?.length ?? 0) > 0;
  }

  getChoices(): DialogueChoice[] {
    return this.session?.current.choices ?? [];
  }

  moveChoice(delta: number): void {
    if (!this.session || !this.session.current.choices) return;
    const len = this.session.current.choices.length;
    this.session.choiceIndex = (this.session.choiceIndex + delta + len) % len;
  }

  /** Returns action to perform, or null if dialogue continues / ends */
  advance(): { done: boolean; action?: DialogueAction } {
    if (!this.session) return { done: true };
    if (!this.isTextComplete()) {
      this.skipTypewriter();
      return { done: false };
    }

    const node = this.session.current;

    if (node.choices && node.choices.length > 0) {
      const choice = node.choices[this.session.choiceIndex];
      const action = choice.action ?? node.action;
      if (choice.nextId) {
        const next = this.session.nodes.find((n) => n.id === choice.nextId);
        if (next) {
          this.session.current = next;
          this.session.displayedText = '';
          this.session.choiceIndex = 0;
          this.charIndex = 0;
          return { done: false, action };
        }
      }
      this.session = null;
      return { done: true, action };
    }

    if (node.nextId) {
      const action = node.action;
      const next = this.session.nodes.find((n) => n.id === node.nextId);
      if (next) {
        this.session.current = next;
        this.session.displayedText = '';
        this.charIndex = 0;
        return { done: false, action };
      }
    }

    const action = node.action;
    this.session = null;
    return { done: true, action };
  }

  end(): void {
    this.session = null;
  }
}
