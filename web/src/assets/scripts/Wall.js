import { AcGameObject } from "./AcGameObject";

export class Wall extends AcGameObject {
  constructor(r, c, gamemap) {
    super();

    this.r = r;
    this.c = c;
    this.gamemap = gamemap;
    this.color = "#B37226";
  }

  update() {
    this.render();
  }

  render() {
    // 动态取出gamemap，因为可能随着窗口大小变化而变化
    const L = this.gamemap.L;
    const ctx = this.gamemap.ctx;

    ctx.fillStyle = this.color;
    ctx.fillRect(this.c * L, this.r * L, L, L);
  }
}
