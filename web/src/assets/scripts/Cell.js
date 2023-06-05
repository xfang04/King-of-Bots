export class Cell {
  constructor(r, c) {
    this.r = r;
    this.c = c;
    // 建立canvas坐标系和游戏坐标系的映射关系
    // 因为要在每个格子的中心画一个圆，所以要加上0.5
    this.x = c + 0.5;
    this.y = r + 0.5;
  }
}
