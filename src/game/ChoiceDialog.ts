import { Container, Graphics, Text, TextStyle } from "pixi.js";

export class ChoiceDialog {
  container: Container;
  private bg: Graphics;
  private textObj: Text;
  private fullText: string;
  private displayedChars = 0;
  private charTimer = 0;
  private charIntervalMs = 30;
  private textFinished = false;
  private dismissed = false;
  private selectedIndex = 0; // 0 = Yes, 1 = No
  private choiceContainer: Container | null = null;
  private yesText: Text | null = null;
  private noText: Text | null = null;
  private yesBg: Graphics | null = null;
  private noBg: Graphics | null = null;
  private _chosenYes: boolean | null = null;

  // Key state tracking to detect fresh presses
  private prevKeys: Record<string, boolean> = {};

  constructor(text: string, x: number, y: number) {
    this.fullText = text;
    this.container = new Container();
    this.container.x = x;
    this.container.y = y;

    const padding = 8;
    const boxWidth = Math.min(text.length * 6 + padding * 2, 280);
    const boxHeight = 52;

    this.bg = new Graphics();
    this.bg.rect(-boxWidth / 2, -boxHeight, boxWidth, boxHeight);
    this.bg.fill({ color: 0x000000, alpha: 0.9 });
    this.bg.stroke({ color: 0xffffff, width: 1 });
    this.container.addChild(this.bg);

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
    this.textObj.y = -boxHeight / 2 - 6;
    this.container.addChild(this.textObj);
  }

  get isDismissed(): boolean {
    return this.dismissed;
  }

  get chosenYes(): boolean | null {
    return this._chosenYes;
  }

  update(deltaMs: number, keys: Record<string, boolean>): void {
    if (this.dismissed) return;

    // Typewriter phase
    if (!this.textFinished) {
      this.charTimer += deltaMs;
      while (
        this.charTimer >= this.charIntervalMs &&
        this.displayedChars < this.fullText.length
      ) {
        this.displayedChars++;
        this.charTimer -= this.charIntervalMs;
      }
      this.textObj.text = this.fullText.slice(0, this.displayedChars);

      if (this.displayedChars >= this.fullText.length) {
        this.textFinished = true;
        this.showChoices();
      }

      // E press during typewriter -> instant reveal
      if (this.isNewPress("e", keys) || this.isNewPress("enter", keys)) {
        this.displayedChars = this.fullText.length;
        this.textObj.text = this.fullText;
        this.textFinished = true;
        this.showChoices();
      }

      this.prevKeys = { ...keys };
      return;
    }

    // Choice selection phase
    if (this.isNewPress("a", keys) || this.isNewPress("arrowleft", keys)) {
      this.selectedIndex = 0;
      this.updateChoiceHighlight();
    }
    if (this.isNewPress("d", keys) || this.isNewPress("arrowright", keys)) {
      this.selectedIndex = 1;
      this.updateChoiceHighlight();
    }

    if (this.isNewPress("e", keys) || this.isNewPress("enter", keys)) {
      this._chosenYes = this.selectedIndex === 0;
      this.dismissed = true;
    }

    this.prevKeys = { ...keys };
  }

  private isNewPress(key: string, keys: Record<string, boolean>): boolean {
    return !!keys[key] && !this.prevKeys[key];
  }

  private showChoices(): void {
    this.choiceContainer = new Container();
    this.choiceContainer.y = -14;

    const btnStyle = new TextStyle({
      fontFamily: "monospace",
      fontSize: 9,
      fill: "#ffffff",
      align: "center",
    });

    // Yes button
    this.yesBg = new Graphics();
    this.yesBg.roundRect(-30, -9, 28, 16, 3);
    this.choiceContainer.addChild(this.yesBg);

    this.yesText = new Text({ text: "Yes", style: btnStyle });
    this.yesText.anchor.set(0.5, 0.5);
    this.yesText.x = -16;
    this.choiceContainer.addChild(this.yesText);

    // No button
    this.noBg = new Graphics();
    this.noBg.roundRect(4, -9, 28, 16, 3);
    this.choiceContainer.addChild(this.noBg);

    this.noText = new Text({ text: "No", style: btnStyle });
    this.noText.anchor.set(0.5, 0.5);
    this.noText.x = 18;
    this.choiceContainer.addChild(this.noText);

    this.container.addChild(this.choiceContainer);
    this.updateChoiceHighlight();
  }

  private updateChoiceHighlight(): void {
    if (!this.yesBg || !this.noBg) return;

    this.yesBg.clear();
    this.yesBg.roundRect(-30, -9, 28, 16, 3);
    this.yesBg.fill({
      color: this.selectedIndex === 0 ? 0x446644 : 0x333333,
      alpha: 0.9,
    });
    this.yesBg.stroke({
      color: this.selectedIndex === 0 ? 0x88cc88 : 0x666666,
      width: 1,
    });

    this.noBg.clear();
    this.noBg.roundRect(4, -9, 28, 16, 3);
    this.noBg.fill({
      color: this.selectedIndex === 1 ? 0x664444 : 0x333333,
      alpha: 0.9,
    });
    this.noBg.stroke({
      color: this.selectedIndex === 1 ? 0xcc8888 : 0x666666,
      width: 1,
    });
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
