import { Container, Graphics, Text, TextStyle } from "pixi.js";

export class DialogBox {
  container: Container;
  private bg: Graphics;
  private textObj: Text;
  private fullText: string;
  private displayedChars = 0;
  private charTimer = 0;
  private charIntervalMs = 30;
  private finished = false;
  private dismissed = false;
  private autoDismissMs = 2000;
  private autoDismissTimer = 0;

  constructor(text: string, x: number, y: number) {
    this.fullText = text;
    this.container = new Container();
    this.container.x = x;
    this.container.y = y;

    // Background box
    const padding = 8;
    const boxWidth = Math.min(text.length * 6 + padding * 2, 280);
    const boxHeight = 36;

    this.bg = new Graphics();
    this.bg.rect(-boxWidth / 2, -boxHeight, boxWidth, boxHeight);
    this.bg.fill({ color: 0x000000, alpha: 0.9 });
    this.bg.stroke({ color: 0xffffff, width: 1 });
    this.container.addChild(this.bg);

    // Text
    const style = new TextStyle({
      fontFamily: "monospace",
      fontSize: 9,
      fill: "#ffffff",
      wordWrap: true,
      wordWrapWidth: boxWidth - padding * 2,
      lineHeight: 12,
    });
    this.textObj = new Text({ text: "", style });
    this.textObj.anchor.set(0.5, 0.5);
    this.textObj.y = -boxHeight / 2;
    this.container.addChild(this.textObj);
  }

  get isDismissed(): boolean {
    return this.dismissed;
  }

  update(deltaMs: number, isInteracting: boolean): void {
    if (this.dismissed) return;

    // Typewriter effect
    if (!this.finished) {
      this.charTimer += deltaMs;
      while (this.charTimer >= this.charIntervalMs && this.displayedChars < this.fullText.length) {
        this.displayedChars++;
        this.charTimer -= this.charIntervalMs;
      }
      this.textObj.text = this.fullText.slice(0, this.displayedChars);

      if (this.displayedChars >= this.fullText.length) {
        this.finished = true;
      }

      // E press during typewriter -> show all text immediately
      if (isInteracting && !this.finished) {
        this.displayedChars = this.fullText.length;
        this.textObj.text = this.fullText;
        this.finished = true;
        return;
      }
      return;
    }

    // Auto-dismiss timer
    this.autoDismissTimer += deltaMs;
    if (this.autoDismissTimer >= this.autoDismissMs || isInteracting) {
      this.dismissed = true;
    }
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
